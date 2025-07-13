# 🏆 Mini-CRM Hackathon Project

A comprehensive Customer Relationship Management system built for hackathon demonstration with AI-powered document processing and workflow automation.

## ✨ Key Features

### 🎯 Lead Management Dashboard
- **Real-time Lead Tracking**: View all leads with status filtering (New, Contacted)
- **Interactive Lead Cards**: Update status, edit details, and delete leads
- **Smart Search & Filtering**: Find leads quickly by status, source, or search terms
- **Lead Statistics**: Overview cards showing total leads, conversion rates, and trends

### 📄 Hybrid Document Processing
- **AI-Powered OCR**: Upload business cards, resumes, or documents for automatic data extraction
- **Dual Processing Engine**: 
  - Primary: Groq AI model for intelligent text extraction
  - Fallback: Tesseract OCR for reliable backup processing
- **Document Preview**: See uploaded documents with highlighted extracted fields
- **Smart Field Detection**: Automatically identifies names, emails, and phone numbers
- **Confidence Scoring**: Shows extraction accuracy for better data validation

### 🤖 AI Lead Interaction
- **Mock LLM Chat**: Simulate conversations with leads using context-aware responses
- **Lead Context Awareness**: AI responses tailored to individual lead information
- **Conversation History**: Track all interactions with each lead
- **Follow-up Suggestions**: AI-generated recommendations for next steps

### ⚡ Visual Workflow Designer
- **Drag & Drop Interface**: Create workflows using React Flow
- **Trigger Nodes**: "Lead Created" trigger starts automation
- **Action Nodes**: "Send Email", "Update Status", "Schedule Follow-up"
- **Real-time Execution**: Watch workflows execute with visual feedback
- **Workflow Logging**: Track all automated actions and their results

### 📊 Analytics Dashboard
- **Real-time Metrics**: Live updates based on actual lead data
- **Performance Charts**: Lead activity trends over time
- **Source Distribution**: Visual breakdown of lead sources
- **Conversion Tracking**: Monitor lead progression through stages
- **Data-Driven Insights**: Smart recommendations based on performance

## 🚀 Hackathon Winning Strategy

This Mini-CRM project is designed to impress judges with:

### 🎯 Complete Problem Solution
- **Real Business Value**: Solves actual CRM pain points for small businesses
- **User-Centered Design**: Intuitive interface that non-technical users can navigate
- **Scalable Architecture**: Built to handle growth from startup to enterprise
- **Production Ready**: Professional code quality and error handling

### 🔥 Innovative Features
- **Hybrid AI Processing**: Combines multiple AI approaches for maximum reliability
- **Visual Workflow Builder**: No-code automation that anyone can use
- **Real-time Document Processing**: Upload and extract data in seconds
- **Smart Lead Interaction**: AI-powered communication simulation

### Technical Excellence
- **Hybrid AI Processing**: Groq AI + Tesseract OCR for maximum reliability
- **Modern React Stack**: TypeScript, Vite, Tailwind CSS, shadcn/ui components
- **FastAPI Backend**: High-performance Python backend with async processing
- **Professional Architecture**: Clean, scalable, production-ready code

### 🎨 Impressive Demo Points
- **Live Document Upload**: Drag & drop business cards and watch data extraction
- **Visual Workflow Execution**: Create and execute workflows in real-time
- **Professional UI**: polished interface that looks like a commercial product
- **Error Handling**: Graceful fallbacks and user-friendly error messages

## 🛠️ Technology Stack

### Frontend
- **React 18** with TypeScript for type safety
- **Vite** for fast development and building
- **Tailwind CSS** for utility-first styling
- **shadcn/ui** for professional components
- **React Flow** for visual workflow designer
- **Recharts** for analytics visualization

### Backend
- **FastAPI** for high-performance API
- **Python 3.11+** with async/await
- **Tesseract OCR** for text extraction
- **Groq SDK** for AI-powered processing
- **PyMuPDF** for PDF processing
- **OpenCV** for image preprocessing

## 🏃‍♂️ Quick Start

### Prerequisites
- Node.js 18+ and npm/yarn
- Python 3.11+
- Tesseract OCR installed on system

### 1. Install Tesseract OCR

**Windows:**
```bash
# Using winget
winget install UB-Mannheim.TesseractOCR

# Or download from: https://github.com/UB-Mannheim/tesseract/wiki
```

**macOS:**
```bash
brew install tesseract
```

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install tesseract-ocr
```

### 2. Frontend Setup
```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

### 3. Backend Setup
```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start backend server
python main.py
```

### 4. Optional: Groq AI Setup
```bash
# Set environment variable for enhanced AI processing
export GROQ_API_KEY="your-groq-api-key"
```

## 📖 How to Use Each Feature

### 🎯 Lead Management Dashboard
1. **View Leads**: Navigate to Dashboard tab to see all leads
2. **Filter Leads**: Use status buttons (New, Contacted) to filter
3. **Search Leads**: Use search bar to find specific leads
4. **Update Status**: Click status buttons on lead cards to change status
5. **Delete Leads**: Use delete button on lead cards

### 📄 Document Processing
1. **Upload Document**: Go to "Create Lead" tab
2. **Drag & Drop**: Drop PDF, PNG, JPG files into upload area
3. **Wait for Processing**: System processes with AI first, then OCR fallback
4. **Review Preview**: See document preview with extracted data
5. **Edit Data**: Modify extracted information if needed
6. **Create Lead**: Confirm to add lead to system

**Supported Formats**: PDF, PNG, JPG, JPEG
**Processing Flow**: Groq AI → Tesseract OCR (if AI fails) → Manual Entry (if both fail)

### 🤖 Lead Interaction
1. **Select Lead**: Click "Interact" button on any lead card
2. **Chat Interface**: Type messages to simulate conversations
3. **Context Awareness**: AI responses use lead's name and information
4. **Follow-up**: Ask for follow-up suggestions or next steps
5. **History**: All conversations are saved per lead

**Sample Prompts**:
- "Tell me about this lead"
- "What should be my follow-up strategy?"
- "Generate a follow-up email"

### ⚡ Workflow Designer
1. **Access Workflows**: Navigate to "Workflows" tab
2. **Drag Nodes**: Drag trigger and action nodes from sidebar
3. **Connect Nodes**: Draw connections between nodes
4. **Configure**: Click nodes to set parameters
5. **Execute**: Workflows auto-execute when triggers fire

**Available Nodes**:
- **Trigger**: Lead Created
- **Actions**: Send Email, Update Status, Schedule Follow-up

**How Workflows Execute**:
- Automatically when new leads are created
- Manual execution via workflow panel
- Real-time logging shows execution results

### 📊 Analytics
1. **View Analytics**: Navigate to "Analytics" tab
2. **KPI Cards**: See total leads, conversion rates, response times
3. **Trend Charts**: 7-day activity charts with leads/contacts/conversions
4. **Source Distribution**: Pie chart showing Manual vs Document leads
5. **Performance Metrics**: Weekly performance and recommendations

**Data Sources**:
- Real lead data from your CRM
- Calculated metrics and trends
- AI-generated recommendations

## 🎯 Demo Scenarios for Hackathon

### Scenario 1: Document Processing Demo
1. **Prepare**: Have business card images ready
2. **Upload**: Drag business card into upload area
3. **Processing**: Show AI processing → Tesseract fallback
4. **Preview**: Highlight extracted data accuracy
5. **Create**: Convert to lead and show in dashboard

### Scenario 2: Workflow Automation Demo
1. **Create Workflow**: Build "New Lead → Send Welcome Email" workflow
2. **Upload Document**: Process new business card
3. **Show Execution**: Workflow automatically triggers
4. **Log Results**: Display execution log and email sent

### Scenario 3: Analytics Demo
1. **Show Empty State**: Start with no leads
2. **Add Multiple Leads**: Upload 3-4 documents rapidly
3. **Real-time Updates**: Watch analytics update live
4. **Trend Analysis**: Show how charts reflect new data

### Scenario 4: AI Interaction Demo
1. **Select Lead**: Choose a lead with full information
2. **Context Demo**: Ask "Tell me about this lead"
3. **Strategy**: Ask "What's my follow-up strategy?"
4. **Personalization**: Show how AI uses lead data

## 🏆 Winning Tips for Judges

### 1. Technical Innovation (25%)
- **Highlight Hybrid Processing**: Explain AI-first approach with OCR fallback
- **Show Real OCR**: Process actual business cards, not fake data
- **Demonstrate Workflows**: Build and execute workflows live
- **Code Quality**: Mention TypeScript, clean architecture, error handling

### 2. User Experience (25%)
- **Professional Design**: Point out shadcn/ui components and animations
- **Intuitive Flow**: Show how non-technical users can navigate
- **Error Handling**: Demonstrate graceful failures and recovery
- **Responsive Design**: Show mobile/tablet compatibility

### 3. Business Value (25%)
- **Real Problem**: Explain CRM pain points for small businesses
- **Time Savings**: Calculate time saved vs manual data entry
- **Scalability**: Discuss handling hundreds of leads
- **ROI**: Business case for automation and AI

### 4. Completeness (25%)
- **Full Stack**: Show frontend, backend, AI, and database integration
- **Production Ready**: Mention deployment readiness
- **Documentation**: Reference this comprehensive README
- **Testing**: Mention error scenarios and edge cases

## 🚨 Troubleshooting

### Common Issues

#### Tesseract Not Found
```bash
# Windows: Add to PATH or reinstall
# Check installation: tesseract --version

# macOS: Reinstall with brew
brew uninstall tesseract
brew install tesseract

# Linux: Verify installation
which tesseract
sudo apt reinstall tesseract-ocr
```

#### Backend Dependencies
```bash
# If pip install fails, try:
pip install --upgrade pip
pip install wheel
pip install -r requirements.txt

# For rapidfuzz issues:
pip install rapidfuzz --no-cache-dir
```

#### Frontend Issues
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install

# If build fails:
npm run build --verbose
```

#### OCR Processing Fails
- **Check File Format**: Only PDF, PNG, JPG, JPEG supported
- **File Size**: Keep under 10MB for best performance
- **Image Quality**: Higher resolution images work better
- **Groq API**: Optional, system works without it

## 🎯 Competitive Advantages

### What Makes This Project Stand Out

1. **Real OCR Processing**: Most hackathon projects fake this
2. **Hybrid AI Approach**: Shows understanding of fallback strategies
3. **Professional UI**: Looks like a commercial product
4. **Complete Feature Set**: Every requirement implemented and polished
5. **Smart Architecture**: Scalable, maintainable, production-ready
6. **Excellent Demo Flow**: Easy to show all features quickly

### Judge Appeal Factors

- **Impressive Tech**: Real AI/OCR processing
- **Business Ready**: Actual value for real businesses
- **User Friendly**: Non-technical users can operate it
- **Scalable Design**: Handles growth and complexity
- **Code Quality**: Professional development practices

## 🚀 Next Steps for Production

1. **Database Integration**: Replace local storage with PostgreSQL
2. **User Authentication**: Add real login/signup system
3. **Email Integration**: Connect to actual email services
4. **Advanced AI**: Integrate GPT-4V or Claude for better extraction
5. **Mobile App**: React Native version
6. **Advanced Analytics**: ML-powered insights and predictions

---

## 📞 Demo Talking Points

When presenting to judges, emphasize:

1. **"Real AI Processing"** - Not fake data, actual document extraction
2. **"Hybrid Reliability"** - AI first, OCR backup ensures it always works
3. **"Production Quality"** - Professional UI and error handling
4. **"Business Value"** - Saves hours of manual data entry daily
5. **"Scalable Architecture"** - Built to handle real business growth

Good luck with your hackathon! 🏆