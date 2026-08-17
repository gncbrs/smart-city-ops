using SmartCityOps.Api;
using SmartCityOps.Api.ExceptionHandling;
using SmartCityOps.Infrastructure;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddInfrastructure(builder.Configuration);
builder.Services.AddApiServices(builder.Configuration);

builder.Services.AddExceptionHandler<DomainExceptionHandler>();
builder.Services.AddProblemDetails();

var app = builder.Build();

app.UseExceptionHandler();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// app.UseHttpsRedirection(); // https profili şu an kullanılmıyor, aktif edilince buraya geri alınacak

app.UseCors(SmartCityOps.Api.DependencyInjection.FrontendCorsPolicy);

app.UseAuthorization();

app.MapControllers();

app.Run();
