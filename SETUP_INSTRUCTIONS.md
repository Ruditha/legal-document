# 🚀 Legal Awareness App - Setup Instructions

## Quick Setup for Development & Testing

### Prerequisites Check
Before starting, ensure you have:
- [ ] Node.js 18+ installed
- [ ] Python 3.8+ installed  
- [ ] Git installed
- [ ] Google Gemini API key (get from: https://makersuite.google.com/app/apikey)

### Step 1: Clone and Setup
```bash
# Clone repository
git clone <your-repository-url>
cd legal-awareness-app

# Setup backend environment
cd backend
cp .env.example .env
# Edit .env and add your GEMINI_API_KEY

# Install backend dependencies
python3 install_dependencies.py
# Or manually:
# python3 -m venv venv
# source venv/bin/activate
# pip install -r requirements.txt
# python -m spacy download en_core_web_sm

# Setup frontend
cd ../frontend
npm install
```

### Step 2: Start Services

#### Terminal 1 - Backend
```bash
cd backend
source venv/bin/activate  # On Windows: venv\Scripts\activate
python main.py
# Backend will start on http://localhost:8000
```

#### Terminal 2 - Frontend
```bash
cd frontend
npm run web-dev
# Frontend will start on http://localhost:19009
```

### Step 3: Test Application
1. Open http://localhost:19009
2. Click "Pick from Gallery" 
3. Upload a legal document image
4. Click "Process Document"
5. Verify AI analysis results

### Docker Setup (Alternative)
```bash
# Quick start with Docker
docker-compose up --build

# Access:
# Frontend: http://localhost:19009
# Backend: http://localhost:8000
```

### Troubleshooting
- **"Failed to fetch"**: Check if backend is running on port 8000
- **"GEMINI_API_KEY not found"**: Verify API key in backend/.env
- **OCR fails**: Ensure image is clear and in supported format (PNG, JPG, JPEG)

### Production Deployment
See [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) for complete production setup instructions.
