"""Custom exceptions for CrewAI Service."""


class CrewAIServiceException(Exception):
    """Base exception for CrewAI Service."""
    pass


class ServiceUnavailableException(CrewAIServiceException):
    """External service unavailable (Screenpipe/MineContext)."""
    
    def __init__(self, service_name: str):
        self.service_name = service_name
        super().__init__(f"{service_name} service is unavailable")


class DataCollectionException(CrewAIServiceException):
    """Error during data collection."""
    pass


class ReportGenerationException(CrewAIServiceException):
    """Error during report generation."""
    pass


class LLMException(CrewAIServiceException):
    """LLM API call failed."""
    pass


class ConfigurationException(CrewAIServiceException):
    """Configuration error."""
    pass


class ValidationException(CrewAIServiceException):
    """Data validation error."""
    pass

