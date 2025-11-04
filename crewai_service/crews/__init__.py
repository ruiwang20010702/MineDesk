"""Crews package for CrewAI workflows."""

from .weekly_report import create_weekly_report_crew, create_weekly_report_tasks
from .crew_manager import CrewManager

__all__ = [
    'create_weekly_report_crew',
    'create_weekly_report_tasks',
    'CrewManager',
]

