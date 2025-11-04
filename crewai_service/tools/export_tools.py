"""Export tools for saving reports to files."""

from crewai_tools import tool
import os
from datetime import datetime
from typing import Dict, Any

from config import settings
from utils.logger import logger


@tool("Save Markdown Report")
def save_markdown(
    content: str,
    filename: str = None
) -> Dict[str, Any]:
    """
    Save report content to a Markdown file.
    
    The file is saved to the configured reports directory with
    automatic filename generation if not specified.
    
    Args:
        content: Markdown content to save
        filename: Optional filename (auto-generated if not provided)
    
    Returns:
        Dictionary with file path and metadata:
        {
            "format": "markdown",
            "path": "/path/to/file.md",
            "size_bytes": 12345,
            "created_at": "2025-11-04T10:35:00Z"
        }
    """
    try:
        # Ensure reports directory exists
        reports_dir = os.path.expanduser(settings.REPORTS_DIR)
        os.makedirs(reports_dir, exist_ok=True)
        
        # Generate filename if not provided
        if not filename:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"weekly_report_{timestamp}.md"
        
        # Ensure .md extension
        if not filename.endswith('.md'):
            filename += '.md'
        
        filepath = os.path.join(reports_dir, filename)
        
        logger.info(f"Saving report to {filepath}")
        
        # Write content
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        
        # Get file stats
        file_size = os.path.getsize(filepath)
        
        logger.info(f"Report saved successfully: {file_size} bytes")
        
        return {
            "format": "markdown",
            "path": filepath,
            "size_bytes": file_size,
            "created_at": datetime.now().isoformat()
        }
    
    except IOError as e:
        logger.error(f"Error writing file: {e}")
        return {"error": f"File write error: {str(e)}"}
    
    except Exception as e:
        logger.error(f"Error saving Markdown: {e}")
        return {"error": str(e)}


@tool("Save Report Metadata")
def save_metadata(
    report_id: str,
    metadata: Dict[str, Any]
) -> Dict[str, Any]:
    """
    Save report metadata to a JSON file.
    
    Stores additional information about the report generation
    process, statistics, and settings used.
    
    Args:
        report_id: Unique report identifier
        metadata: Metadata dictionary to save
    
    Returns:
        Dictionary with file path:
        {
            "format": "json",
            "path": "/path/to/metadata.json",
            "size_bytes": 456
        }
    """
    try:
        import json
        
        reports_dir = os.path.expanduser(settings.REPORTS_DIR)
        os.makedirs(reports_dir, exist_ok=True)
        
        filename = f"{report_id}_metadata.json"
        filepath = os.path.join(reports_dir, filename)
        
        logger.info(f"Saving metadata to {filepath}")
        
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(metadata, f, indent=2, ensure_ascii=False)
        
        file_size = os.path.getsize(filepath)
        
        return {
            "format": "json",
            "path": filepath,
            "size_bytes": file_size
        }
    
    except Exception as e:
        logger.error(f"Error saving metadata: {e}")
        return {"error": str(e)}

