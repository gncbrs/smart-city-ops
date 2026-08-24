namespace SmartCityOps.Domain.Exceptions;

public class ResourceConflictException : DomainException
{
    public ResourceConflictException(string message) : base(message)
    {
    }
}
