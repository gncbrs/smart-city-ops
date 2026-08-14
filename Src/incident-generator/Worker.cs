using System.Net.Http.Json; //apilere json formatında veri göndermeyi kolaylaştır.
//using System.Runtime.CompilerServices;
using System.Text.Json; // c# nesnelerini jsona dönüştürür.
using Microsoft.Extensions.Options; // uygulama ayarlarını okumayı sağlar.

namespace SmartCityOps.IncidentGenerator;

// TODO SOLUTIONS WILL BE MERGED, WHY SHOULD THE ONE HAVE TWO SOLUTIONS WHILE THEY CAN ONLY HAVE ONE
public class Worker : BackgroundService
{
    // TODO -- SHOULD BE IMPORTED FROM COMMONs 
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

    private const double AnkaraLatitude = 39.925;
    private const double AnkaraLongitude = 32.836;
    private const double CoordinateSpread = 0.05;

    private static readonly JsonSerializerOptions JsonOptions = new(JsonSerializerDefaults.Web);

    private readonly ILogger<Worker> logger; // ekran/konsola bilgilendirme (loglama) yazmak için.
    private readonly HttpClient httpClient; //sanal tarayıcı ya da istemci.
    private readonly IncidentGenerator  options;
    private readonly Random random = new();
    private int sequence;

    public Worker(ILogger<Worker> logger, HttpClient httpClient, IOptions<IncidentGenerator > options)
    {
        this.logger = logger;
        this.httpClient = httpClient;
        this.options = options.Value;
    }

    //arka plan servisinin kalbi. Otomatik olarak çalışır(uygulama başladığında.).
    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested) //uygulama kapatılmadığı sürece sonsuz döngü.
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

    private IncidentPayload BuildRandomIncident()
    {
        sequence++;

        var latitude = AnkaraLatitude + ((random.NextDouble() * 2 - 1) * CoordinateSpread);
        var longitude = AnkaraLongitude + ((random.NextDouble() * 2 - 1) * CoordinateSpread);
    
        return new IncidentPayload
        (
            IncidentCode: $"INC-{DateTime.UtcNow:yyyyMMdd}-{sequence:D4}",
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