# Legal Awareness App - Deployment Guide

## 🚀 Production-Ready Legal Document Analysis Platform

This is a complete Legal Awareness App that uses AI-powered analysis to help users understand legal documents before signing. The app features OCR text extraction, Google Gemini AI summarization, and key point highlighting.

---

## 🏗️ Architecture Overview

- **Frontend**: React Native Web (Webpack + React Native Web)
- **Backend**: FastAPI with Google Gemini AI integration
- **OCR**: Tesseract for text extraction from images
- **AI**: Google Gemini 1.5 Flash for document analysis
- **Deployment**: Docker containers with production optimizations

---

## 📋 Prerequisites

### Required Software
- **Node.js** 18+ 
- **Python** 3.8+
- **Docker** & Docker Compose (for containerized deployment)
- **Git** for version control

### Required API Keys
- **Google Gemini API Key** (Required for AI functionality)
  - Get from: https://makersuite.google.com/app/apikey
  - Free tier available with generous limits

---

## 🛠️ Quick Start (Recommended)

### 1. Clone Repository
```bash
git clone <your-repository-url>
cd legal-awareness-app
```

### 2. Set Up Environment
```bash
# Copy environment template
cp backend/.env.example backend/.env

# Edit the .env file and add your GEMINI_API_KEY
nano backend/.env
```

### 3. Deploy with Docker (Easiest)
```bash
# Build and start all services
docker-compose up --build

# Access the application
# Frontend: http://localhost:19009
# Backend API: http://localhost:8000
# API Documentation: http://localhost:8000/docs
```

---

## 🔧 Manual Installation

### Backend Setup

1. **Navigate to backend directory**
```bash
cd backend
```

2. **Install Python dependencies**
```bash
# Option A: Automated installation
python3 install_dependencies.py

# Option B: Manual installation
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python -m spacy download en_core_web_sm
```

3. **Configure environment**
```bash
cp .env.example .env
# Edit .env and add your GEMINI_API_KEY
```

4. **Start backend server**
```bash
source venv/bin/activate  # On Windows: venv\Scripts\activate
python main.py
# Or: uvicorn main:app --reload --port 8000
```

### Frontend Setup

1. **Navigate to frontend directory**
```bash
cd frontend
```

2. **Install Node.js dependencies**
```bash
npm install
```

3. **Start development server**
```bash
npm run web-dev
```

4. **Access application**
- Frontend: http://localhost:19009
- Backend API: http://localhost:8000/docs

---

## 🌐 Production Deployment

### Environment Variables

#### Backend (.env)
```env
# Required
GEMINI_API_KEY=your_actual_gemini_api_key_here

# Production settings
ENV=production
DEBUG=False

# CORS (update with your actual domain)
ALLOWED_ORIGINS=https://yourdomain.com,https://api.yourdomain.com

# File upload limits
MAX_FILE_SIZE_MB=10
ALLOWED_FILE_TYPES=png,jpg,jpeg,tiff,bmp,pdf

# OCR settings
OCR_LANGUAGE=eng
OCR_DPI=300
```

### Docker Production Deployment

1. **Update docker-compose.yml for production**
```yaml
services:
  backend:
    environment:
      - ENV=production
      - DEBUG=False
      - ALLOWED_ORIGINS=https://yourdomain.com
```

2. **Deploy with production configuration**
```bash
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

### Manual Production Deployment

#### Backend (Ubuntu/Debian)
```bash
# Install system dependencies
sudo apt update
sudo apt install python3 python3-pip python3-venv tesseract-ocr nginx

# Set up application
git clone <repository>
cd legal-awareness-app/backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python -m spacy download en_core_web_sm

# Configure environment
cp .env.example .env
# Add your GEMINI_API_KEY and set ENV=production

# Set up systemd service
sudo cp legal-awareness-backend.service /etc/systemd/system/
sudo systemctl enable legal-awareness-backend
sudo systemctl start legal-awareness-backend
```

#### Frontend Production Build
```bash
cd frontend
npm install
npm run build
# Serve with nginx or your preferred web server
```

---

## 🧪 Testing the Application

### Health Check
```bash
curl http://localhost:8000/health
```

Expected response:
```json
{
  "status": "healthy",
  "message": "Legal Awareness App Backend is running",
  "llm_available": true,
  "version": "2.0.0"
}
```

### Document Processing Test
1. Open http://localhost:19009
2. Click "Pick from Gallery" or "Take Photo"
3. Select a legal document image
4. Click "Process Document"
5. Verify AI analysis results appear

---

## 🔒 Security Considerations

### Production Checklist
- [ ] Set `DEBUG=False` in backend .env
- [ ] Configure proper CORS origins (remove "*" wildcard)
- [ ] Use HTTPS in production
- [ ] Set up proper firewall rules
- [ ] Use environment variables for secrets
- [ ] Regular security updates
- [ ] Monitor API usage and rate limiting

### API Key Security
- Never commit `.env` files to version control
- Use environment variables in cloud deployments
- Rotate API keys regularly
- Monitor API usage in Google Cloud Console

---

## 📊 Monitoring & Logs

### Backend Logs
```bash
# Docker logs
docker-compose logs -f backend

# Manual deployment logs
tail -f /var/log/legal-awareness-backend.log
```

### Frontend Logs
```bash
# Docker logs
docker-compose logs -f frontend

# Browser console for client-side issues
```

### Performance Monitoring
- Monitor API response times
- Track document processing success rates
- Monitor Google Gemini API usage
- Set up alerts for errors

---

## 🎯 Features

### Core Functionality
✅ **OCR Text Extraction** - Tesseract-powered image-to-text  
✅ **AI Document Analysis** - Google Gemini-powered summarization  
✅ **Key Point Extraction** - Automated legal clause identification  
✅ **Multi-platform Support** - Works on web, mobile, tablets  
✅ **Error Handling** - Graceful fallbacks and user-friendly messages  
✅ **Demo Mode** - Fallback when backend unavailable  

### Production Features
✅ **Docker Containerization** - Easy deployment anywhere  
✅ **Health Checks** - Automated service monitoring  
✅ **CORS Configuration** - Secure cross-origin requests  
✅ **File Upload Validation** - Size and type restrictions  
✅ **Production Logging** - Comprehensive error tracking  
✅ **Environment Configuration** - Flexible deployment options  

---

## 🆘 Troubleshooting

### Common Issues

#### "Failed to fetch" errors
- **Cause**: Backend not running or CORS misconfiguration
- **Solution**: Check backend logs, verify CORS origins in .env

#### "GEMINI_API_KEY not found"
- **Cause**: Missing or invalid API key
- **Solution**: Check .env file, verify API key validity

#### OCR extraction fails
- **Cause**: Poor image quality or unsupported format
- **Solution**: Use high-quality images, supported formats (PNG, JPG, JPEG)

#### Docker build fails
- **Cause**: Missing dependencies or network issues
- **Solution**: Check internet connection, clear Docker cache

### Getting Help
1. Check application logs
2. Verify environment configuration
3. Test API endpoints individually
4. Review this documentation
5. Check Google Gemini API status

---

## 📞 Customer Support & Sales Information

### For End Customers
This Legal Awareness App helps you:
- **Understand legal documents** before signing
- **Identify key clauses** and obligations
- **Spot potential risks** in contracts
- **Make informed decisions** about legal agreements

### For Technical Implementation
- **Professional deployment support** available
- **Custom integrations** and modifications
- **Training and documentation** included
- **Ongoing maintenance** options

---

## 🔄 Version Information

**Current Version**: 2.0.0  
**Last Updated**: August 2024  
**Compatibility**: Node.js 18+, Python 3.8+  
**AI Model**: Google Gemini 1.5 Flash  

---

*This deployment guide ensures a professional, error-free installation suitable for customer delivery and production use.*
