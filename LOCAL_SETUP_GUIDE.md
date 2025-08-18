# 🏠 Run Legal Awareness App Locally - Complete Guide

## Your System Requirements
- **Python 3.8+** 
- **Node.js 18+**
- **4GB+ RAM** (for AI models)
- **5GB+ disk space** (for model downloads)

---

## 🚀 Option 1: BART + BERT Local Models (Your Original Approach)

### Step 1: Clone and Setup
```bash
# Clone the repository
git clone <your-repository-url>
cd legal-awareness-app

# Create Python virtual environment
cd backend
# On Windows:
python -m venv venv
# On Mac/Linux:
python3 -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On Mac/Linux:
source venv/bin/activate
```

### Step 2: Install Local AI Models
```bash
# Install BART + BERT dependencies
pip install -r requirements_local.txt

# Download spaCy model for text processing
python -m spacy download en_core_web_sm

# Test model installation
# On Windows:
python -c "import torch; from transformers import BartTokenizer, BartForConditionalGeneration; print('✅ BART model test passed'); from transformers import pipeline; ner = pipeline('ner', model='dslim/bert-base-NER'); print('✅ BERT model test passed'); print('🎉 All local models ready!')"
# On Mac/Linux:
python3 -c "import torch; from transformers import BartTokenizer, BartForConditionalGeneration; print('✅ BART model test passed'); from transformers import pipeline; ner = pipeline('ner', model='dslim/bert-base-NER'); print('✅ BERT model test passed'); print('🎉 All local models ready!')"
```

### Step 3: Configure Environment
```bash
# Copy environment file
cp .env.example .env

# Edit .env file (optional - GEMINI_API_KEY can be empty for local models)
# For pure local mode:
GEMINI_API_KEY=
USE_LOCAL_MODELS=true
```

### Step 4: Start Backend Server
```bash
# Make sure virtual environment is activated
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Start the backend server
python main.py

# You should see:
# INFO:     Application startup complete.
# INFO:     Uvicorn running on http://127.0.0.1:8000
```

### Step 5: Test Backend
```bash
# In a new terminal, test the health endpoint
curl http://localhost:8000/health

# Expected response:
# {
#   "status": "healthy",
#   "llm_available": false,
#   "version": "2.0.0"
# }
```

---

## 🌐 Option 2: Google Gemini API (Current Implementation)

### Step 1: Get API Key
```bash
# Get free API key from: https://makersuite.google.com/app/apikey
# Copy your API key
```

### Step 2: Install Dependencies
```bash
cd backend
# On Windows:
python -m venv venv
venv\Scripts\activate
# On Mac/Linux:
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python -m spacy download en_core_web_sm
```

### Step 3: Configure API Key
```bash
cp .env.example .env
# Edit .env and add your API key:
echo "GEMINI_API_KEY=your_actual_api_key_here" >> .env
```

### Step 4: Start Backend
```bash
python main.py
```

---

## 🖥️ Frontend Setup (Same for Both Options)

### Step 1: Install Node Dependencies
```bash
# In a new terminal
cd frontend
npm install
```

### Step 2: Start Frontend Server
```bash
npm run web-dev

# You should see:
# webpack compiled successfully
# Frontend available at: http://localhost:19009
```

---

## 🧪 Complete Testing Process

### Step 1: Verify Both Servers Running
```bash
# Backend health check
curl http://localhost:8000/health

# Frontend check - open browser to:
http://localhost:19009
```

### Step 2: Test Document Upload
1. **Open** http://localhost:19009 in browser
2. **Click** "Pick from Gallery"
3. **Select** a legal document image (contract, agreement, etc.)
4. **Verify** image preview appears

### Step 3: Test AI Processing
1. **Click** "Process Document"
2. **Wait** 5-15 seconds for processing
3. **Check results**:
   - Summary appears with legal analysis
   - Key points list critical details
   - Success message shows processing method

### Step 4: Verify BART + BERT Results
Look for these specific outputs:
- **Critical deadlines** like "due before 1/1/25" 
- **Financial amounts** like "$5,000 penalty"
- **Ownership changes** highlighted
- **Processing method**: Shows "Local BART + BERT"

---

## 📊 Expected Performance

### BART + BERT Local Models:
- **Processing Time**: 5-15 seconds
- **Memory Usage**: 2-4 GB RAM
- **Accuracy**: Excellent for specific legal entities
- **Cost**: $0 (runs offline)

### Google Gemini API:
- **Processing Time**: 2-5 seconds  
- **Memory Usage**: <1 GB RAM
- **Accuracy**: Excellent for general understanding
- **Cost**: ~$0.01 per document

---

## 🔧 Troubleshooting

### "ModuleNotFoundError: No module named 'torch'"
```bash
# Reinstall PyTorch
pip install torch torchvision torchaudio

# For GPU support (optional):
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu118
```

### "Model 'en_core_web_sm' not found"
```bash
python -m spacy download en_core_web_sm
```

### "Failed to fetch" errors in frontend
```bash
# Check if backend is running on port 8000
curl http://localhost:8000/health

# If not running, restart backend:
cd backend
source venv/bin/activate
python main.py
```

### Out of memory errors
```bash
# Reduce batch size or use smaller models
# Edit models_local.py and change max_length parameters
```

---

## 🎯 Which Option Should You Choose?

### Choose **BART + BERT** if:
- ✅ You want to catch specific details like "due before 1/1/25"
- ✅ You need offline processing (no internet required)
- ✅ You want zero API costs
- ✅ You can fine-tune models for your specific legal domains

### Choose **Google Gemini** if:
- ✅ You want faster setup and processing
- ✅ You need better general legal understanding
- ✅ You don't mind small API costs (~$0.01/document)
- ✅ You want the latest AI technology

---

## 💡 Pro Tip: Hybrid Approach

The current implementation supports **both**! It tries local models first, then falls back to Gemini API. This gives you:
- **Best accuracy** from specialized models
- **Reliability** with API fallback
- **Cost optimization** using local when possible

---

## 🚀 Ready to Test?

Run these commands in order:

```bash
# Terminal 1 - Backend
cd backend
source venv/bin/activate
pip install -r requirements_local.txt
python -m spacy download en_core_web_sm
python main.py

# Terminal 2 - Frontend  
cd frontend
npm install
npm run web-dev

# Terminal 3 - Test
curl http://localhost:8000/health
open http://localhost:19009
```

**Your Legal Awareness App with BART + BERT models will be running locally and ready for testing!** 🎉
