using System.Net.Http.Json; //apilere json formatında veri göndermeyi kolaylaştır.
//using System.Runtime.CompilerServices;
using System.Text.Json; // c# nesnelerini jsona dönüştürür.
using Microsoft.Extensions.Options; // uygulama ayarlarını okumayı sağlar.

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

    private record OperationZone(string Name, double Latitude, double Longitude, double Spread, int Weight);

    // Ankara'nın farklı ilçelerine yayılmış bölgeler; Weight, o bölgede ne sıklıkla incident
    // üretileceğini belirliyor (toplamları normalize edilmiyor, sadece birbirine oranı önemli).
    private static readonly OperationZone[] AnkaraZones =
    {
        new("Merkez (Çankaya)", 39.925, 32.836, 0.05, 30),
        new("Keçiören",         39.995, 32.865, 0.03, 12),
        new("Mamak",            39.930, 32.920, 0.03, 12),
        new("Etimesgut",        39.950, 32.670, 0.03, 12),
        new("Sincan",           39.970, 32.575, 0.03, 12),
        new("Gölbaşı",          39.790, 32.810, 0.03, 10),
        new("Pursaklar",        40.040, 32.895, 0.03, 8),
    };

    private static readonly JsonSerializerOptions JsonOptions = new(JsonSerializerDefaults.Web);

    private readonly ILogger<Worker> logger; // ekran/konsola bilgilendirme (loglama) yazmak için.
    private readonly HttpClient httpClient; //sanal tarayıcı ya da istemci.
    private readonly IncidentGeneratorOptions options;
    private readonly Random random = new();

    public Worker(ILogger<Worker> logger, HttpClient httpClient, IOptions<IncidentGeneratorOptions> options)
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

    private OperationZone GetRandomZone()
    {
        var totalWeight = AnkaraZones.Sum(zone => zone.Weight);
        var value = random.Next(totalWeight);

        foreach (var zone in AnkaraZones)
        {
            if (value < zone.Weight)
            {
                return zone;
            }

            value -= zone.Weight;
        }

        return AnkaraZones[0];
    }

    private IncidentPayload BuildRandomIncident()
    {
        var zone = GetRandomZone();

        var latitude = zone.Latitude + ((random.NextDouble() * 2 - 1) * zone.Spread);
        var longitude = zone.Longitude + ((random.NextDouble() * 2 - 1) * zone.Spread);

        return new IncidentPayload
        (
            // Milisaniyeye kadar zaman damgası: process her yeniden başlatıldığında sıfırdan
            // sayan bir "sequence" alanına göre daha güvenli -- iki farklı process çalıştırması
            // aynı günde aynı kodu üretip IX_Incidents_IncidentCode unique index'ine çarpmıyor.
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