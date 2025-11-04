# CrewAI Service for MineDesk

Multi-agent workflow service for automated weekly report generation.

## 🚀 Quick Start

```bash
# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env and add your API key

# Run service
python main.py
```

## 📡 API Documentation

Service runs on http://localhost:18000

See `/docs` for interactive API documentation (Swagger UI).

## 🏗️ Architecture

- **5 Specialized Agents**: Researcher, Analyst, Writer, Reviewer, Exporter
- **4 Tool Categories**: Screenpipe, MineContext, Database, Export
- **Sequential Workflow**: Data Collection → Analysis → Writing → Review → Export

## 🔧 Configuration

Edit `.env` file to configure:
- LLM provider (SiliconFlow by default)
- External service URLs (Screenpipe, MineContext)
- Service port and debug settings

## 🛠️ Development

```bash
# Run tests
pytest tests/

# Run with auto-reload (development)
DEBUG=true python main.py
```

## 📦 Project Structure

```
crewai_service/
├── main.py              # FastAPI application entry
├── config.py            # Configuration management
├── api/                 # API routes and schemas
├── crews/               # Crew definitions
├── agents/              # Agent implementations
├── tools/               # Custom tools
├── utils/               # Utilities and helpers
└── tests/               # Test files
```

## 📝 API Endpoints

### Generate Weekly Report
```http
POST /api/weekly-report/generate
Content-Type: application/json

{
  "start_date": "2025-10-28",
  "end_date": "2025-11-04",
  "options": {
    "language": "zh",
    "include_activities": true,
    "include_documents": true,
    "include_conversations": true
  }
}
```

### Health Check
```http
GET /api/health
```

## 🔒 Security

- Sensitive data filtering
- Excluded apps configuration
- API key protection
- No data stored on remote servers

## 📄 License

Part of MineDesk project.

