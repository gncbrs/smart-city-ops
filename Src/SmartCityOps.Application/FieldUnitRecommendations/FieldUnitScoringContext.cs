using SmartCityOps.Domain.Entities;

namespace SmartCityOps.Application.FieldUnitRecommendations;

public record FieldUnitScoringContext(Incident Incident, FieldUnit FieldUnit, TimeSpan Eta, double DistanceKm);
