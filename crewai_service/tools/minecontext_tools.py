"""MineContext integration tools for CrewAI agents."""

from crewai_tools import tool
import requests
from typing import List, Dict, Any

from config import settings
from utils.logger import logger
from utils.exceptions import ServiceUnavailableException


@tool("Search Documents in MineContext")
def search_documents(
    query: str,
    start_date: str,
    end_date: str,
    top_k: int = 50
) -> List[Dict[str, Any]]:
    """
    Search documents in MineContext RAG system.
    
    This tool performs semantic search on documents that the user has
    created or edited during the specified time period.
    
    Args:
        query: Search query (e.g., "work progress", "project documents")
        start_date: Filter documents created after this date (ISO 8601)
        end_date: Filter documents created before this date (ISO 8601)
        top_k: Number of results to return (default: 50)
    
    Returns:
        List of relevant documents with content and metadata:
        [
            {
                "id": "doc_123",
                "title": "Document title",
                "content": "Document content...",
                "created_at": "2025-11-01T10:00:00Z",
                "score": 0.95
            },
            ...
        ]
    """
    try:
        logger.info(f"Searching MineContext: query='{query}', top_k={top_k}")
        
        response = requests.post(
            f"{settings.MINECONTEXT_URL}/api/search/vector",
            json={
                "query": query,
                "top_k": top_k,
                "filters": {
                    "created_at": {
                        "gte": start_date,
                        "lte": end_date
                    }
                }
            },
            timeout=settings.REQUEST_TIMEOUT
        )
        
        if response.status_code != 200:
            logger.error(f"MineContext API error: HTTP {response.status_code}")
            raise ServiceUnavailableException("MineContext")
        
        data = response.json()
        results = data.get("results", [])
        
        logger.info(f"Found {len(results)} documents in MineContext")
        
        return results
    
    except requests.RequestException as e:
        logger.error(f"MineContext connection failed: {e}")
        raise ServiceUnavailableException("MineContext")
    
    except Exception as e:
        logger.error(f"Error searching MineContext: {e}")
        return []


@tool("Get Context from MineContext")
def get_context(topic: str, max_results: int = 10) -> str:
    """
    Get contextual information about a topic from MineContext.
    
    This tool retrieves relevant context that can help understand
    what the user was working on during the week.
    
    Args:
        topic: Topic to get context for (e.g., "Phase 2.2", "frontend")
        max_results: Maximum number of context items to retrieve
    
    Returns:
        Concatenated context string with relevant information
    """
    try:
        logger.info(f"Getting context for topic: {topic}")
        
        response = requests.post(
            f"{settings.MINECONTEXT_URL}/api/query",
            json={
                "query": f"What is {topic}? What work was done on {topic}?",
                "top_k": max_results
            },
            timeout=settings.REQUEST_TIMEOUT
        )
        
        if response.status_code != 200:
            logger.warning(f"MineContext API returned {response.status_code}")
            return f"No context available for {topic}"
        
        data = response.json()
        context_items = data.get("results", [])
        
        if not context_items:
            return f"No context found for {topic}"
        
        # Concatenate context
        context_text = f"Context about '{topic}':\n\n"
        for i, item in enumerate(context_items, 1):
            content = item.get("content", "")
            context_text += f"{i}. {content}\n\n"
        
        logger.info(f"Retrieved context: {len(context_items)} items")
        
        return context_text
    
    except Exception as e:
        logger.error(f"Error getting context: {e}")
        return f"Error retrieving context for {topic}: {str(e)}"

