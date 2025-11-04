"""Data Analyst Agent - Analyzes collected data for insights."""

from crewai import Agent
from tools.screenpipe_tools import calculate_time_stats
from tools.database_tools import get_conversation_summary
from utils.llm_config import get_llm


def create_analyst_agent() -> Agent:
    """
    Create Data Analyst Agent.
    
    This agent analyzes the collected data to extract meaningful insights:
    - Calculate time distribution metrics
    - Identify key achievements
    - Detect productivity patterns
    - Compare with historical data (if available)
    
    Returns:
        Configured Agent instance
    """
    return Agent(
        role='Data Analyst',
        
        goal='''Analyze the collected data and extract meaningful insights.
        Calculate metrics, identify achievements, detect patterns, and provide
        actionable insights for the weekly report.''',
        
        backstory='''You are a skilled data analyst with expertise in productivity
        analysis and data interpretation. You excel at finding patterns in large
        datasets and quantifying abstract concepts like "productivity" and "achievement".
        
        You can spot important trends that others miss. You focus on deriving
        actionable insights rather than just presenting raw numbers. You understand
        what metrics matter most for professional growth and time management.
        
        You are analytical but also human-centric, recognizing that behind every
        data point is a person trying to understand their work habits better.''',
        
        tools=[
            calculate_time_stats,
            get_conversation_summary
        ],
        
        llm=get_llm(),
        
        verbose=True,
        allow_delegation=False,
        max_iter=8
    )

