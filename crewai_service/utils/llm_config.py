"""LLM configuration for CrewAI agents."""

from langchain_openai import ChatOpenAI
from config import settings
from utils.logger import logger


def get_llm():
    """
    Get configured LLM instance for CrewAI agents.
    
    Returns:
        ChatOpenAI instance configured with SiliconFlow API
    """
    if not settings.SILICONFLOW_API_KEY:
        logger.warning("SILICONFLOW_API_KEY not set, LLM calls may fail")
    
    return ChatOpenAI(
        model=settings.LLM_MODEL,
        openai_api_base=settings.LLM_BASE_URL,
        openai_api_key=settings.SILICONFLOW_API_KEY,
        temperature=settings.LLM_TEMPERATURE,
        max_tokens=settings.LLM_MAX_TOKENS
    )

