"""Database tools for accessing local SQLite conversations."""

from crewai_tools import tool
import sqlite3
import os
from typing import List, Dict, Any
from datetime import datetime

from config import settings
from utils.logger import logger


@tool("Fetch Conversations from Database")
def fetch_conversations(
    start_date: str,
    end_date: str
) -> List[Dict[str, Any]]:
    """
    Fetch conversation records from local SQLite database.
    
    Retrieves chat history between the user and MineDesk assistant
    during the specified time period.
    
    Args:
        start_date: ISO 8601 date string (e.g., "2025-10-28")
        end_date: ISO 8601 date string (e.g., "2025-11-04")
    
    Returns:
        List of conversations with messages:
        [
            {
                "id": "conv_123",
                "title": "Conversation title",
                "created_at": 1730457600000,
                "messages": [
                    {
                        "role": "user",
                        "content": "User message",
                        "timestamp": 1730457600000
                    },
                    {
                        "role": "assistant",
                        "content": "Assistant response",
                        "timestamp": 1730457610000
                    }
                ]
            },
            ...
        ]
    """
    try:
        # Expand user path
        db_path = os.path.expanduser(settings.DB_PATH)
        
        # Check if database exists
        if not os.path.exists(db_path):
            logger.warning(f"Database not found at {db_path}")
            return []
        
        logger.info(f"Fetching conversations from {db_path}")
        
        # Connect to database
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # Convert ISO dates to timestamps (milliseconds)
        start_ts = int(datetime.fromisoformat(start_date).timestamp() * 1000)
        end_ts = int(datetime.fromisoformat(end_date).timestamp() * 1000)
        
        # Query conversations and messages
        query = """
        SELECT c.id, c.title, c.created_at, m.role, m.content, m.timestamp
        FROM conversations c
        JOIN messages m ON c.id = m.conversation_id
        WHERE m.timestamp >= ? AND m.timestamp <= ?
        ORDER BY m.timestamp ASC
        """
        
        cursor.execute(query, (start_ts, end_ts))
        rows = cursor.fetchall()
        
        # Group messages by conversation
        conversations_dict = {}
        for row in rows:
            conv_id, title, created_at, role, content, timestamp = row
            
            if conv_id not in conversations_dict:
                conversations_dict[conv_id] = {
                    "id": conv_id,
                    "title": title,
                    "created_at": created_at,
                    "messages": []
                }
            
            conversations_dict[conv_id]["messages"].append({
                "role": role,
                "content": content,
                "timestamp": timestamp
            })
        
        conn.close()
        
        conversations = list(conversations_dict.values())
        
        logger.info(f"Fetched {len(conversations)} conversations with messages")
        
        return conversations
    
    except sqlite3.Error as e:
        logger.error(f"Database error: {e}")
        return []
    
    except Exception as e:
        logger.error(f"Error fetching conversations: {e}")
        return []


@tool("Get Conversation Summary")
def get_conversation_summary(conversations: List[Dict]) -> Dict[str, Any]:
    """
    Summarize conversation statistics.
    
    Args:
        conversations: List of conversation records
    
    Returns:
        Summary statistics:
        {
            "total_conversations": int,
            "total_messages": int,
            "user_messages": int,
            "assistant_messages": int,
            "topics_discussed": List[str]
        }
    """
    if not conversations:
        return {
            "total_conversations": 0,
            "total_messages": 0,
            "user_messages": 0,
            "assistant_messages": 0,
            "topics_discussed": []
        }
    
    try:
        total_messages = 0
        user_messages = 0
        assistant_messages = 0
        topics = []
        
        for conv in conversations:
            messages = conv.get("messages", [])
            total_messages += len(messages)
            
            for msg in messages:
                if msg.get("role") == "user":
                    user_messages += 1
                elif msg.get("role") == "assistant":
                    assistant_messages += 1
            
            # Extract topic from title
            title = conv.get("title", "")
            if title and title not in topics:
                topics.append(title)
        
        return {
            "total_conversations": len(conversations),
            "total_messages": total_messages,
            "user_messages": user_messages,
            "assistant_messages": assistant_messages,
            "topics_discussed": topics[:10]  # Limit to top 10
        }
    
    except Exception as e:
        logger.error(f"Error summarizing conversations: {e}")
        return {
            "total_conversations": len(conversations),
            "error": str(e)
        }

