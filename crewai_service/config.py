"""Configuration management for CrewAI Service."""

import os
from typing import List
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""
    
    # Service Configuration
    HOST: str = "127.0.0.1"
    PORT: int = 18000
    WORKERS: int = 1
    DEBUG: bool = False
    
    # External Services
    SCREENPIPE_URL: str = "http://localhost:3030"
    MINECONTEXT_URL: str = "http://localhost:17860"
    
    # LLM Configuration
    LLM_BASE_URL: str = "https://api.siliconflow.cn/v1"
    SILICONFLOW_API_KEY: str = ""
    LLM_MODEL: str = "Qwen/Qwen2.5-7B-Instruct"
    LLM_TEMPERATURE: float = 0.7
    LLM_MAX_TOKENS: int = 4000
    
    # Database
    DB_PATH: str = "~/Library/Application Support/MineDesk/conversations.db"
    
    # Reports
    REPORTS_DIR: str = "~/MineDesk/reports"
    
    # Data Filtering - Sensitive Keywords
    SENSITIVE_KEYWORDS: List[str] = [
        "password", "api_key", "secret", "token",
        "密码", "口令", "秘钥", "私钥"
    ]
    
    # Data Filtering - Excluded Apps
    EXCLUDED_APPS: List[str] = [
        "1Password", "Keychain Access", "Passwords",
        "钥匙串访问"
    ]
    
    # Performance
    MAX_ACTIVITIES_PER_REQUEST: int = 10000
    REQUEST_TIMEOUT: int = 30
    CREW_MAX_RPM: int = 100
    
    class Config:
        """Pydantic config."""
        env_file = ".env"
        case_sensitive = True


# Global settings instance
settings = Settings()

