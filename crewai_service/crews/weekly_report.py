"""Weekly Report Crew - Multi-agent workflow for report generation."""

from crewai import Crew, Task, Process
from agents import (
    create_researcher_agent,
    create_analyst_agent,
    create_writer_agent,
    create_reviewer_agent,
    create_exporter_agent
)
from utils.logger import logger


def create_weekly_report_tasks(start_date: str, end_date: str, language: str = "zh"):
    """
    Create task definitions for weekly report generation.
    
    Args:
        start_date: Start date for data collection (ISO 8601)
        end_date: End date for data collection (ISO 8601)
        language: Report language ("zh" or "en")
    
    Returns:
        List of Task instances
    """
    
    # Task 1: Data Collection
    research_task = Task(
        description=f'''Gather all activities and context from {start_date} to {end_date}.
        
        Focus on collecting:
        1. Desktop activities from Screenpipe (apps, windows, OCR text)
           - Use the fetch_screenpipe_activities tool
           - Get all activities within the date range
        
        2. Documents created or edited from MineContext
           - Use search_documents tool with relevant queries
           - Search for "work", "project", "document" etc.
        
        3. Conversations and chat history from database
           - Use fetch_conversations tool
           - Get all conversations in the date range
        
        4. Any significant events or milestones
        
        Use ALL available tools to collect comprehensive data.
        Organize the information chronologically and by category.
        
        Expected output structure:
        - activities: list of desktop activities with timestamps
        - documents: list of documents with metadata
        - conversations: list of chat records
        - metadata: statistics about data collection
        ''',
        
        expected_output='''A structured JSON containing:
        {{
          "activities": [array of activity objects],
          "documents": [array of document objects],
          "conversations": [array of conversation objects],
          "metadata": {{
            "total_activities": number,
            "total_documents": number,
            "total_conversations": number,
            "date_range": "{start_date} to {end_date}"
          }}
        }}''',
        
        agent=create_researcher_agent()
    )
    
    # Task 2: Data Analysis
    analysis_task = Task(
        description=f'''Analyze the collected data and extract meaningful insights.
        
        Calculate and identify:
        1. Total time and productive time distribution
           - Use calculate_time_stats tool on the activities
           - Break down by application and category
        
        2. Key accomplishments and achievements
           - Identify major tasks completed
           - Find evidence of progress (commits, documents, features)
        
        3. Productivity patterns
           - Most productive time of day
           - Focus session duration and frequency
           - Work-life balance indicators
        
        4. Conversation insights
           - Use get_conversation_summary tool
           - Identify key topics discussed
        
        5. Challenges or blockers
           - Look for repeated patterns that indicate issues
           - Identify areas needing improvement
        
        Provide quantifiable metrics where possible.
        Rank achievements by impact and evidence quality.
        ''',
        
        expected_output='''A structured analysis report containing:
        {{
          "time_distribution": {{
            "total_hours": number,
            "by_application": {{}},
            "by_category": {{}}
          }},
          "achievements": [
            {{
              "title": "string",
              "description": "string",
              "impact": "high|medium|low",
              "evidence": ["string"]
            }}
          ],
          "patterns": {{
            "most_productive_time": "HH:MM-HH:MM",
            "focus_sessions": number,
            "work_life_balance": "good|needs_attention"
          }},
          "metrics": {{
            "productivity_score": number (0-1),
            "focus_score": number (0-1)
          }},
          "challenges": ["string"]
        }}''',
        
        agent=create_analyst_agent(),
        context=[research_task]  # Depends on research task output
    )
    
    # Task 3: Report Writing
    writing_task = Task(
        description=f'''Write a comprehensive weekly report in Markdown format.
        
        Language: {language}
        
        Structure the report as follows:
        
        # 📊 Weekly Report: {{date_range}}
        
        ## 🎯 Executive Summary
        - Brief overview (2-3 sentences)
        - Total hours worked and productivity score
        - Top 3 achievements
        
        ## 🏆 Key Achievements
        - List major accomplishments with details
        - Include evidence and impact assessment
        - Use bullet points for clarity
        
        ## ⏱️ Time Distribution
        - Present a table showing time by category
        - Highlight top applications used
        - Show percentage breakdown
        
        ## 📈 Productivity Metrics
        - Quantifiable results (files created, hours focused, etc.)
        - Productivity and focus scores with interpretation
        - Trend comparison (if historical data available)
        
        ## 💬 Collaboration & Communication
        - Summary of conversations and meetings
        - Key topics discussed
        - Team interactions
        
        ## 🚧 Challenges & Blockers
        - Issues encountered
        - How they were addressed
        - Recommendations for next week
        
        ## 📅 Next Week Planning
        - Suggested priorities based on current progress
        - Areas needing attention
        
        Writing guidelines:
        - Use clear, professional language
        - Include relevant emojis for visual appeal (1-2 per section)
        - Make numbers meaningful with context
        - Keep paragraphs concise
        - Use tables and bullet points for readability
        - Write in {language} (zh=Chinese, en=English)
        ''',
        
        expected_output=f'''Complete Markdown report following the specified structure.
        Report should be well-formatted, engaging, and professional.
        Language: {language}
        Length: Approximately 800-1200 words.''',
        
        agent=create_writer_agent(),
        context=[analysis_task]  # Depends on analysis task output
    )
    
    # Task 4: Quality Review
    review_task = Task(
        description='''Review and improve the report for quality and accuracy.
        
        Check for:
        1. Grammar and spelling errors
           - Fix any grammatical issues
           - Correct spelling mistakes
        
        2. Logical flow and coherence
           - Ensure sections connect smoothly
           - Verify information flow makes sense
        
        3. Accuracy of facts and numbers
           - Cross-check all statistics
           - Ensure consistency between sections
        
        4. Consistency in style and tone
           - Maintain professional yet engaging tone
           - Consistent use of terminology
        
        5. Proper Markdown formatting
           - Verify headings hierarchy
           - Check table formatting
           - Ensure lists are properly formatted
        
        6. Readability and clarity
           - Simplify complex sentences
           - Add clarifying phrases where needed
           - Ensure technical terms are explained
        
        Make corrections and improvements directly.
        Ensure the report is polished and publication-ready.
        ''',
        
        expected_output='''Polished Markdown report with all issues fixed.
        The report should be professional, accurate, and easy to read.
        All formatting should be correct and consistent.''',
        
        agent=create_reviewer_agent(),
        context=[writing_task]  # Depends on writing task output
    )
    
    # Task 5: Export
    export_task = Task(
        description=f'''Export the final report to file system.
        
        Actions:
        1. Save Markdown report using save_markdown tool
           - Use filename format: weekly_report_{{end_date}}.md
           - Example: weekly_report_{end_date}.md
        
        2. Save metadata using save_metadata tool
           - Include generation timestamp
           - Include statistics (word count, sections, etc.)
           - Include settings used
        
        3. Verify export success
           - Check that files were created
           - Verify file sizes are reasonable
           - Confirm paths are correct
        
        4. Return export confirmation with file paths
        
        File location: configured in settings.REPORTS_DIR
        ''',
        
        expected_output=f'''JSON object with export details:
        {{
          "report_file": {{
            "path": "/path/to/weekly_report_{end_date}.md",
            "size_bytes": number,
            "format": "markdown"
          }},
          "metadata_file": {{
            "path": "/path/to/metadata.json",
            "size_bytes": number,
            "format": "json"
          }},
          "status": "success",
          "timestamp": "ISO 8601 timestamp"
        }}''',
        
        agent=create_exporter_agent(),
        context=[review_task]  # Depends on review task output
    )
    
    return [research_task, analysis_task, writing_task, review_task, export_task]


def create_weekly_report_crew(start_date: str, end_date: str, language: str = "zh") -> Crew:
    """
    Create and configure the weekly report generation crew.
    
    Args:
        start_date: Start date for report (ISO 8601)
        end_date: End date for report (ISO 8601)
        language: Report language
    
    Returns:
        Configured Crew instance
    """
    logger.info(f"Creating weekly report crew: {start_date} to {end_date}")
    
    # Create tasks
    tasks = create_weekly_report_tasks(start_date, end_date, language)
    
    # Create agents
    agents = [
        create_researcher_agent(),
        create_analyst_agent(),
        create_writer_agent(),
        create_reviewer_agent(),
        create_exporter_agent()
    ]
    
    # Create crew
    crew = Crew(
        agents=agents,
        tasks=tasks,
        process=Process.sequential,  # Execute tasks in order
        verbose=True,
        memory=False,  # Disable memory for Phase 3.1
        max_rpm=100   # Rate limit
    )
    
    logger.info("Weekly report crew created successfully")
    
    return crew

