"""Data filtering utilities for sensitive information."""

import re
from typing import Dict, Optional
from config import settings
from utils.logger import logger


def filter_sensitive_activity(activity: Dict) -> Optional[Dict]:
    """
    Filter sensitive information from activity data.
    
    Args:
        activity: Activity record from Screenpipe
        
    Returns:
        Filtered activity dict, or None if should be excluded
    """
    if not activity:
        return None
    
    filtered = activity.copy()
    
    # Exclude activities from sensitive apps
    app_name = filtered.get('app', '')
    if app_name in settings.EXCLUDED_APPS:
        logger.debug(f"Excluding activity from sensitive app: {app_name}")
        return None
    
    # Filter OCR text
    if 'ocr_text' in filtered and filtered['ocr_text']:
        filtered['ocr_text'] = filter_sensitive_text(filtered['ocr_text'])
    
    # Filter window titles
    if 'window' in filtered and filtered['window']:
        filtered['window'] = filter_sensitive_text(filtered['window'])
    
    # Filter window names (alternative field)
    if 'window_name' in filtered and filtered['window_name']:
        filtered['window_name'] = filter_sensitive_text(filtered['window_name'])
    
    return filtered


def filter_sensitive_text(text: str) -> str:
    """
    Replace sensitive keywords with [REDACTED].
    
    Args:
        text: Original text
        
    Returns:
        Filtered text with sensitive info redacted
    """
    if not text:
        return text
    
    filtered = text
    
    # Check each sensitive keyword
    for keyword in settings.SENSITIVE_KEYWORDS:
        if keyword.lower() in filtered.lower():
            # Case-insensitive replacement
            pattern = re.compile(re.escape(keyword), re.IGNORECASE)
            filtered = pattern.sub("[REDACTED]", filtered)
    
    return filtered


def sanitize_for_llm(data: Dict) -> Dict:
    """
    Additional sanitization for data sent to LLM.
    
    Removes or masks fields that might contain PII or sensitive info.
    
    Args:
        data: Data dictionary
        
    Returns:
        Sanitized data
    """
    sanitized = data.copy()
    
    # Fields to completely remove
    remove_fields = ['ip_address', 'mac_address', 'user_id', 'email']
    for field in remove_fields:
        if field in sanitized:
            del sanitized[field]
    
    # Truncate long text fields to prevent token limit issues
    max_text_length = 5000
    if 'ocr_text' in sanitized and len(sanitized['ocr_text']) > max_text_length:
        sanitized['ocr_text'] = sanitized['ocr_text'][:max_text_length] + "... [truncated]"
    
    return sanitized

