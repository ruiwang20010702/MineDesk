"""Screenpipe integration tools for CrewAI agents."""

from crewai_tools import tool
import requests
from datetime import datetime
from typing import List, Dict, Any

from config import settings
from utils.logger import logger
from utils.exceptions import ServiceUnavailableException
from utils.data_filter import filter_sensitive_activity


@tool("Fetch Screenpipe Activities")
def fetch_screenpipe_activities(start_date: str, end_date: str) -> List[Dict[str, Any]]:
    """
    Fetch desktop activities from Screenpipe for a date range.
    
    This tool retrieves screen capture data including:
    - Application names and window titles
    - OCR text from screenshots
    - Timestamps and durations
    
    Sensitive data is automatically filtered before returning.
    
    Args:
        start_date: ISO 8601 date string (e.g., "2025-10-28")
        end_date: ISO 8601 date string (e.g., "2025-11-04")
    
    Returns:
        List of activity records with timestamps, apps, windows, and OCR text.
        Returns empty list if service is unavailable.
    """
    try:
        # Convert dates to Unix timestamps
        start_ts = int(datetime.fromisoformat(start_date).timestamp())
        end_ts = int(datetime.fromisoformat(end_date).timestamp())
        
        logger.info(f"Fetching Screenpipe activities: {start_date} to {end_date}")
        
        # Call Screenpipe API
        response = requests.get(
            f"{settings.SCREENPIPE_URL}/search",
            params={
                "start_time": start_ts,
                "end_time": end_ts,
                "limit": settings.MAX_ACTIVITIES_PER_REQUEST
            },
            timeout=settings.REQUEST_TIMEOUT
        )
        
        if response.status_code != 200:
            logger.error(f"Screenpipe API error: HTTP {response.status_code}")
            raise ServiceUnavailableException("Screenpipe")
        
        data = response.json()
        activities = data.get("data", [])
        
        logger.info(f"Fetched {len(activities)} raw activities from Screenpipe")
        
        # Filter sensitive data
        filtered = []
        for activity in activities:
            filtered_activity = filter_sensitive_activity(activity)
            if filtered_activity:  # None means excluded
                filtered.append(filtered_activity)
        
        logger.info(f"Filtered to {len(filtered)} activities (removed sensitive data)")
        
        return filtered
    
    except requests.RequestException as e:
        logger.error(f"Screenpipe connection failed: {e}")
        raise ServiceUnavailableException("Screenpipe")
    
    except Exception as e:
        logger.error(f"Error fetching Screenpipe activities: {e}")
        return []


@tool("Calculate Activity Statistics")
def calculate_time_stats(activities: List[Dict]) -> Dict[str, Any]:
    """
    Calculate time distribution statistics from activities.
    
    Analyzes activity data to compute:
    - Total time by application
    - Time by category (coding, meetings, documentation, etc.)
    - Most productive hours
    - Focus session patterns
    
    Args:
        activities: List of activity records from fetch_screenpipe_activities
    
    Returns:
        Dictionary with detailed time distribution statistics:
        {
            "total_hours": float,
            "by_application": {"app_name": hours, ...},
            "by_category": {"coding": hours, "meetings": hours, ...},
            "most_productive_time": "09:00-12:00",
            "focus_sessions": int
        }
    """
    if not activities:
        return {
            "total_hours": 0,
            "by_application": {},
            "by_category": {},
            "most_productive_time": "N/A",
            "focus_sessions": 0
        }
    
    try:
        # Group by application
        app_times = {}
        for activity in activities:
            app = activity.get('app', 'Unknown')
            duration = activity.get('duration_seconds', 0)
            
            if app in app_times:
                app_times[app] += duration
            else:
                app_times[app] = duration
        
        # Convert seconds to hours
        app_hours = {app: round(seconds / 3600, 2) for app, seconds in app_times.items()}
        
        # Calculate total hours
        total_seconds = sum(app_times.values())
        total_hours = round(total_seconds / 3600, 2)
        
        # Categorize applications
        coding_apps = ['Visual Studio Code', 'VS Code', 'PyCharm', 'Xcode', 'Cursor', 'Terminal', 'iTerm']
        browser_apps = ['Chrome', 'Safari', 'Firefox', 'Edge']
        communication_apps = ['Slack', 'Teams', 'Zoom', 'WeChat', 'DingTalk']
        
        category_times = {
            "coding": 0,
            "browsing": 0,
            "communication": 0,
            "other": 0
        }
        
        for app, hours in app_hours.items():
            if any(coding_app.lower() in app.lower() for coding_app in coding_apps):
                category_times["coding"] += hours
            elif any(browser_app.lower() in app.lower() for browser_app in browser_apps):
                category_times["browsing"] += hours
            elif any(comm_app.lower() in app.lower() for comm_app in communication_apps):
                category_times["communication"] += hours
            else:
                category_times["other"] += hours
        
        # Analyze time patterns (simplified for now)
        # TODO: Implement more sophisticated time pattern analysis
        most_productive_time = "09:00-12:00"  # Default assumption
        focus_sessions = len([a for a in activities if a.get('duration_seconds', 0) > 1800])  # 30+ min sessions
        
        logger.info(f"Calculated time stats: {total_hours} hours across {len(app_hours)} apps")
        
        return {
            "total_hours": total_hours,
            "by_application": dict(sorted(app_hours.items(), key=lambda x: x[1], reverse=True)),
            "by_category": category_times,
            "most_productive_time": most_productive_time,
            "focus_sessions": focus_sessions
        }
    
    except Exception as e:
        logger.error(f"Error calculating time stats: {e}")
        return {
            "total_hours": 0,
            "by_application": {},
            "by_category": {},
            "error": str(e)
        }

