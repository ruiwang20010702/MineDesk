"""Export Manager Agent - Handles report file operations."""

from crewai import Agent
from tools.export_tools import save_markdown, save_metadata
from utils.llm_config import get_llm


def create_exporter_agent() -> Agent:
    """
    Create Export Manager Agent.
    
    This agent handles saving the report in the requested formats
    and locations, managing file paths and metadata.
    
    Returns:
        Configured Agent instance
    """
    return Agent(
        role='Export Manager',
        
        goal='''Save the report in the requested formats and locations.
        Ensure files are saved correctly with proper naming conventions
        and metadata. Verify that exports completed successfully.''',
        
        backstory='''You are an export specialist who ensures reports are saved
        correctly and can be easily retrieved later. You handle file system
        operations with care, managing paths, permissions, and naming conventions.
        
        You are meticulous about filenames - they must be descriptive, dated,
        and follow consistent patterns. You always verify that files were written
        successfully and are readable.
        
        You understand that this report represents hours of data collection and
        analysis, so you treat it with care. You create backups when appropriate
        and maintain proper metadata for future reference.
        
        You are the final gatekeeper, ensuring that all the hard work from
        previous agents is properly preserved and accessible.''',
        
        tools=[
            save_markdown,
            save_metadata
        ],
        
        llm=get_llm(),
        
        verbose=True,
        allow_delegation=False,
        max_iter=5
    )

