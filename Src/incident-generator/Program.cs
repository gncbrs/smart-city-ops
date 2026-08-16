using SmartCityOps.IncidentGenerator;
using Microsoft.Extensions.Options;

var builder = Host.CreateApplicationBuilder(args);

builder.Services.Configure<IncidentGeneratorOptions>(
    builder.Configuration.GetSection("IncidentGenerator"));

builder.Services.AddHttpClient<Worker>((serviceProvider, client) =>
{
    var options = serviceProvider.GetRequiredService<IOptions<IncidentGeneratorOptions>>().Value;
    client.BaseAddress = new Uri(options.ApiBaseUrl);
});

builder.Services.AddHostedService(serviceProvider => serviceProvider.GetRequiredService<Worker>());

var host = builder.Build();
host.Run();