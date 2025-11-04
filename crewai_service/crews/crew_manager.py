"""Crew Manager - Orchestrates crew execution and handles errors."""

import time
from datetime import datetime
from typing import Dict, Any, Optional

from crews.weekly_report import create_weekly_report_crew
from utils.logger import logger
from utils.exceptions import (
    ReportGenerationException,
    ServiceUnavailableException,
    LLMException
)


class CrewManager:
    """
    Manager class for CrewAI workflow execution.
    
    Handles:
    - Crew instantiation
    - Execution with error handling
    - Progress tracking
    - Fallback strategies
    """
    
    def __init__(self):
        """Initialize Crew Manager."""
        self.current_crew = None
        self.execution_start_time = None
        
    def generate_report(
        self,
        start_date: str,
        end_date: str,
        options: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Generate weekly report using CrewAI workflow.
        
        Args:
            start_date: Start date (ISO 8601)
            end_date: End date (ISO 8601)
            options: Report options (language, includes, etc.)
        
        Returns:
            Dictionary with report content and metadata
        
        Raises:
            ReportGenerationException: If generation fails
        """
        try:
            self.execution_start_time = time.time()
            
            # Extract options
            language = options.get('language', 'zh')
            
            logger.info("="*60)
            logger.info(f"Starting report generation")
            logger.info(f"Date range: {start_date} to {end_date}")
            logger.info(f"Language: {language}")
            logger.info(f"Options: {options}")
            logger.info("="*60)
            
            # Create crew
            crew = create_weekly_report_crew(
                start_date=start_date,
                end_date=end_date,
                language=language
            )
            
            self.current_crew = crew
            
            # Execute crew workflow
            logger.info("🚀 Executing crew workflow...")
            result = crew.kickoff()
            
            # Calculate execution time
            duration = time.time() - self.execution_start_time
            
            logger.info(f"✅ Crew execution completed in {duration:.2f}s")
            
            # Process result
            report_content = self._extract_report_content(result)
            
            # Generate report ID
            report_id = f"report_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
            
            # Prepare response
            response = {
                "report_id": report_id,
                "content": report_content,
                "metadata": {
                    "generated_at": datetime.now().isoformat(),
                    "duration_seconds": round(duration, 2),
                    "word_count": len(report_content.split()),
                    "sections": self._count_sections(report_content),
                    "language": language,
                    "date_range": f"{start_date} to {end_date}"
                },
                "statistics": {
                    "total_activities": 0,  # TODO: Extract from crew output
                    "total_documents": 0,
                    "total_time_hours": 0,
                    "productivity_score": 0.0
                }
            }
            
            logger.info("="*60)
            logger.info("✨ Report generation successful!")
            logger.info(f"Report ID: {report_id}")
            logger.info(f"Word count: {response['metadata']['word_count']}")
            logger.info("="*60)
            
            return response
        
        except ServiceUnavailableException as e:
            logger.error(f"External service unavailable: {e}")
            return self._generate_fallback_report(start_date, end_date, language, str(e))
        
        except LLMException as e:
            logger.error(f"LLM API error: {e}")
            return self._generate_error_report(start_date, end_date, "LLM_ERROR", str(e))
        
        except Exception as e:
            logger.error(f"Unexpected error during report generation: {e}", exc_info=True)
            raise ReportGenerationException(f"Failed to generate report: {str(e)}")
    
    def _extract_report_content(self, result: Any) -> str:
        """
        Extract Markdown content from crew execution result.
        
        Args:
            result: Crew execution result
        
        Returns:
            Markdown report content
        """
        try:
            # CrewAI result can be various types
            if isinstance(result, str):
                return result
            elif hasattr(result, 'output'):
                return str(result.output)
            elif hasattr(result, 'result'):
                return str(result.result)
            else:
                return str(result)
        except Exception as e:
            logger.warning(f"Error extracting report content: {e}")
            return f"# Report Generation Result\n\n{str(result)}"
    
    def _count_sections(self, content: str) -> list:
        """
        Count sections in Markdown content.
        
        Args:
            content: Markdown content
        
        Returns:
            List of section names
        """
        sections = []
        for line in content.split('\n'):
            if line.startswith('## '):
                section_name = line.replace('## ', '').strip()
                sections.append(section_name)
        return sections
    
    def _generate_fallback_report(
        self,
        start_date: str,
        end_date: str,
        language: str,
        error_message: str
    ) -> Dict[str, Any]:
        """
        Generate a fallback report when external services are unavailable.
        
        Args:
            start_date: Start date
            end_date: End date
            language: Report language
            error_message: Error description
        
        Returns:
            Minimal report with error notification
        """
        logger.warning("Generating fallback report due to service unavailability")
        
        if language == "zh":
            content = f"""# 📊 周报

**报告期间**: {start_date} 至 {end_date}

## ⚠️ 提示

部分数据源当前不可用：{error_message}

本周报使用有限的数据生成。请检查外部服务状态并稍后重试以获取完整报告。

## 📌 下一步

1. 检查 Screenpipe 服务状态
2. 检查 MineContext 服务状态
3. 重新生成报告
"""
        else:
            content = f"""# 📊 Weekly Report

**Period**: {start_date} to {end_date}

## ⚠️ Notice

Some data sources are currently unavailable: {error_message}

This report was generated with limited data. Please check external service status and retry for a complete report.

## 📌 Next Steps

1. Check Screenpipe service status
2. Check MineContext service status  
3. Regenerate the report
"""
        
        return {
            "report_id": f"fallback_{datetime.now().strftime('%Y%m%d_%H%M%S')}",
            "content": content,
            "metadata": {
                "generated_at": datetime.now().isoformat(),
                "duration_seconds": 0,
                "word_count": len(content.split()),
                "is_fallback": True,
                "error": error_message
            },
            "statistics": {}
        }
    
    def _generate_error_report(
        self,
        start_date: str,
        end_date: str,
        error_code: str,
        error_detail: str
    ) -> Dict[str, Any]:
        """
        Generate an error report when generation fails completely.
        
        Args:
            start_date: Start date
            end_date: End date
            error_code: Error code
            error_detail: Error details
        
        Returns:
            Error report
        """
        logger.error(f"Generating error report: {error_code}")
        
        content = f"""# ❌ Report Generation Failed

**Error**: {error_code}
**Details**: {error_detail}
**Period**: {start_date} to {end_date}
**Timestamp**: {datetime.now().isoformat()}

Please check the service logs for more information.
"""
        
        return {
            "report_id": f"error_{datetime.now().strftime('%Y%m%d_%H%M%S')}",
            "content": content,
            "metadata": {
                "generated_at": datetime.now().isoformat(),
                "is_error": True,
                "error_code": error_code,
                "error_detail": error_detail
            },
            "statistics": {}
        }
    
    def get_status(self) -> Dict[str, Any]:
        """
        Get current execution status.
        
        Returns:
            Status information
        """
        if self.current_crew is None:
            return {
                "status": "idle",
                "message": "No crew currently executing"
            }
        
        if self.execution_start_time:
            elapsed = time.time() - self.execution_start_time
            return {
                "status": "in_progress",
                "elapsed_seconds": round(elapsed, 2),
                "message": "Crew is currently executing"
            }
        
        return {
            "status": "unknown",
            "message": "Status unavailable"
        }

