using System.Net.Http.Json; // simplifies sending JSON payloads to the API.
using System.Text.Json; // serializes C# objects to JSON.
using Microsoft.Extensions.Options; // reads app configuration.
using SmartCityOps.Domain.Common;

namespace SmartCityOps.IncidentGenerator;

public class Worker : BackgroundService
{
    private static readonly string[] IncidentTypes =
    {
        "TrafficAccident",
        "RoadClosure",
        "FireAlert",
        "InfrastructureFailure",
        "FloodAlert",
        "PublicSafetyAlert",
        "UtilityFailure"
    };

    private static readonly string[] Priorities =
    {
      "Low",
      "Medium",
      "High"
    };

    private static readonly JsonSerializerOptions JsonOptions = new(JsonSerializerDefaults.Web);

    private readonly ILogger<Worker> logger; // writes informational output to the console.
    private readonly HttpClient httpClient; // client used to call the API.
    private readonly IncidentGeneratorOptions options;
    private readonly Random random = new();

    public Worker(ILogger<Worker> logger, HttpClient httpClient, IOptions<IncidentGeneratorOptions> options)
    {
        this.logger = logger;
        this.httpClient = httpClient;
        this.options = options.Value;
    }

    // The heart of the background service. Runs automatically when the app starts.
    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested) // loops indefinitely until the app shuts down.
        {
            await GenerateAndSendIncidentAsync(stoppingToken);
            await Task.Delay(TimeSpan.FromSeconds(options.IntervalSeconds), stoppingToken);
        }
    }

    private async Task GenerateAndSendIncidentAsync(CancellationToken cancellationToken)
    {
        var payload = BuildRandomIncident();

        try
        {
            var response = await httpClient.PostAsJsonAsync("incidents", payload, JsonOptions, cancellationToken);

            if (response.IsSuccessStatusCode)
            {
                logger.LogInformation("Incident gönderildi: {IncidentCode}", payload.IncidentCode);
            }

            else
            {
                var body = await response.Content.ReadAsStringAsync(cancellationToken);
                logger.LogWarning("Incident gönderilemedi... ({StatusCode}) : {Body}", response.StatusCode, body);
            }
        }

        catch (HttpRequestException ex)
        {
            logger.LogError(ex, "API'ye bağlanılamadı...");
        }
    }

    private OperationalZoneDefinition GetRandomZone()
    {
        var totalWeight = AnkaraOperationalZones.All.Sum(zone => zone.Weight);
        var value = random.Next(totalWeight);

        foreach (var zone in AnkaraOperationalZones.All)
        {
            if (value < zone.Weight)
            {
                return zone;
            }

            value -= zone.Weight;
        }

        return AnkaraOperationalZones.All[0];
    }

    private IncidentPayload BuildRandomIncident()
    {
        var zone = GetRandomZone();

        var latitude = zone.Latitude + ((random.NextDouble() * 2 - 1) * zone.Spread);
        var longitude = zone.Longitude + ((random.NextDouble() * 2 - 1) * zone.Spread);

        return new IncidentPayload
        (
            // Millisecond-precision timestamp: safer than a "sequence" field that resets to
            // zero on every process restart -- two separate process runs on the same day
            // won't collide on the IX_Incidents_IncidentCode unique index.
            IncidentCode: $"INC-{DateTime.UtcNow:yyyyMMddHHmmssfff}",
            Type: IncidentTypes[random.Next(IncidentTypes.Length)],
            Priority: Priorities[random.Next(Priorities.Length)],
            ReportedAt: DateTimeOffset.UtcNow,
            Latitude: latitude,
            Longitude: longitude,
            Description: "Incident generator tarafından üretilmiş rastgele incident..."
        );
    }

    internal record IncidentPayload
    (
        string IncidentCode,
        string Type,
        string Priority,
        DateTimeOffset ReportedAt,
        double Latitude,
        double Longitude,
        string Description
    );
}