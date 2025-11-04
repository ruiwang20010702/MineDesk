"""Data Researcher Agent - Collects data from multiple sources."""

from crewai import Agent
from tools.screenpipe_tools import fetch_screenpipe_activities
from tools.minecontext_tools import search_documents, get_context
from tools.database_tools import fetch_conversations
from utils.llm_config import get_llm


def create_researcher_agent() -> Agent:
    """
    Create Data Researcher Agent.
    
    This agent is responsible for collecting comprehensive activity data
    from the past week, including:
    - Desktop activities from Screenpipe
    - Documents from MineContext
    - Conversation history from database
    
    Returns:
        Configured Agent instance
    """
    return Agent(
        role='Data Researcher',
        
        goal='''Collect comprehensive activity data from the past week.
        Focus on accuracy and completeness of data collection.
        Gather information from all available sources without missing important details.''',
        
        backstory='''You are a meticulous data researcher with expertise in 
        gathering information from multiple sources. You have access to the user's
        desktop activities via Screenpipe, documents via MineContext, and conversations
        from the local database. 
        
        Your job is to retrieve all relevant facts systematically and organize them
        in a structured way. You are thorough and never skip data sources. You understand
        that this data will be used to generate an accurate weekly report, so completeness
        is critical.''',
        
        tools=[
            fetch_screenpipe_activities,
            search_documents,
            get_context,
            fetch_conversations
        ],
        
        llm=get_llm(),
        
        verbose=True,
        allow_delegation=False,
        max_iter=10
    )

