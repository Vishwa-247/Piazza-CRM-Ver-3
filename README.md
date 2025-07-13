# 🚀 Piazza CRM Ver 3 - AI-Powered Lead Management

A modern, AI-powered Customer Relationship Management (CRM) system with intelligent document processing, automated workflows, and real-time LLM interactions.

## ✨ Key Features

### 📄 **Smart Document Processing**
- **Hybrid OCR**: Tesseract + Groq AI for intelligent data extraction
- **Multi-format Support**: PDF, PNG, JPG, JPEG files
- **Real-time Processing**: Instant lead creation from uploaded documents
- **AI-powered Extraction**: Names, emails, phones with confidence scoring

### 🤖 **AI Lead Interaction**
- **Real-time LLM Chat**: Ask questions about leads and get AI-powered responses
- **Lead Analysis**: AI-driven insights and recommendations
- **Smart Suggestions**: Quick action buttons for common queries
- **Conversation History**: Track all AI interactions with each lead

### 🔄 **Automated Workflows**
- **Visual Designer**: Drag-and-drop workflow creation
- **Email Automation**: Send real emails via SMTP (Gmail)
- **Auto-triggering**: Workflows activate on new lead creation
- **Progress Tracking**: Real-time workflow execution status

### 📊 **Lead Management**
- **Interactive Lead Cards**: Update status, edit details, and delete leads
- **Status Tracking**: New → Contacted workflow
- **Source Attribution**: Track lead origins
- **Real-time Updates**: Instant UI synchronization

### 📧 **Email Integration**
- **SMTP Email Service**: Real email sending via Gmail
- **Template Support**: Customizable email templates
- **Delivery Tracking**: Email status monitoring
- **Secure Configuration**: App password authentication

## 🛠️ Technology Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development
- **Tailwind CSS** for styling
- **Shadcn/ui** components
- **Lucide React** icons

### Backend
- **FastAPI** with Python 3.11+
- **Groq AI** for LLM interactions
- **Tesseract OCR** for document processing
- **PyMuPDF** for PDF handling
- **SMTP** for email delivery

## 🚀 Quick Start

### Prerequisites
- Python 3.11+
- Node.js 18+
- Tesseract OCR installed
- Groq API key

### Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt

# Set up environment variables
cp .env.example .env
# Edit .env with your Groq API key and email settings

python main.py
```

### Frontend Setup
```bash
npm install
npm run dev
```

### Environment Variables
Create a `.env` file in the backend directory:
```env
GROQ_API_KEY=your_groq_api_key_here
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
```

## 📖 Usage Guide

### 1. Document Upload & Processing
1. **Upload Document**: Drag and drop or click to upload PDF/image
2. **AI Processing**: Hybrid OCR extracts contact information
3. **Lead Creation**: Automatically creates lead with extracted data
4. **Review & Edit**: Verify and modify extracted information

### 2. AI Lead Interaction
1. **Select Lead**: Click "Interact" button on any lead card
2. **AI Chat**: Ask questions about the lead
3. **Smart Analysis**: Get AI-powered insights and recommendations
4. **Quick Actions**: Use suggested questions for common queries

### 3. Workflow Automation
1. **Design Workflow**: Use the visual workflow designer
2. **Add Actions**: Email, status updates, notifications
3. **Set Triggers**: Configure when workflows activate
4. **Monitor Execution**: Track workflow progress in real-time

### 4. Email Management
1. **Configure SMTP**: Set up Gmail with App Password
2. **Test Connection**: Verify email service is working
3. **Send Emails**: Use workflows or manual sending
4. **Track Delivery**: Monitor email status

## 🤖 AI Features

### Real-time LLM Chat
- **Contextual Responses**: AI understands lead context and history
- **Smart Suggestions**: Pre-built questions for common scenarios
- **Lead Analysis**: AI-driven insights about lead priority and approach
- **Conversation Memory**: Maintains context across chat sessions

### AI-Powered Insights
- **Priority Scoring**: AI determines lead priority level
- **Approach Recommendations**: Suggests best communication strategies
- **Risk Assessment**: Identifies potential issues or concerns
- **Next Steps**: Provides actionable next steps for each lead

### Quick Actions
- **Follow-up Suggestions**: AI recommends when and how to follow up
- **Communication Strategy**: Suggests best approach based on lead data
- **Lead Analysis**: Instant insights about lead potential
- **Status Recommendations**: AI suggests optimal status updates

## 🔧 Configuration

### Groq AI Setup
1. Get API key from [Groq Console](https://console.groq.com/)
2. Add to `.env` file: `GROQ_API_KEY=your_key_here`
3. Restart backend server

### Email Configuration
1. Enable 2FA on Gmail account
2. Generate App Password
3. Configure in Settings → Email tab
4. Test connection

### OCR Setup
1. Install Tesseract OCR
2. Windows: Download from GitHub releases
3. Linux: `sudo apt install tesseract-ocr`
4. macOS: `brew install tesseract`

## 📁 Project Structure

```
Piazza-CRM-Ver-3/
├── backend/
│   ├── main.py              # FastAPI server
│   ├── hybrid_ocr_processor.py  # AI document processing
│   ├── llm_service.py       # LLM chat service
│   ├── email_service.py     # SMTP email service
│   ├── models.py            # Pydantic models
│   └── config.py            # Configuration
├── src/
│   ├── components/
│   │   ├── Dashboard.tsx    # Main dashboard
│   │   ├── InteractionModal.tsx  # AI chat interface
│   │   ├── WorkflowDesigner.tsx  # Workflow builder
│   │   └── Settings.tsx     # Email configuration
│   ├── services/
│   │   ├── llmService.ts    # LLM API client
│   │   ├── backendEmailService.ts  # Email API client
│   │   └── workflowService.ts      # Workflow management
│   └── ...
└── ...
```

## 🎯 Use Cases

### Scenario 1: Document Processing
1. **Upload Business Card**: Sales rep uploads scanned business card
2. **AI Extraction**: System extracts name, email, phone automatically
3. **Lead Creation**: Lead is created with extracted data
4. **Workflow Trigger**: Automated email sent to new lead

### Scenario 2: AI Lead Interaction
1. **Select Lead**: Click "Interact" on John Smith's lead
2. **Ask Question**: "What's the best way to follow up with John?"
3. **AI Response**: "Based on John's profile, I recommend..."
4. **Take Action**: Follow AI suggestions for next steps

### Scenario 3: Workflow Automation
1. **Design Workflow**: Create "New Lead Welcome" workflow
2. **Add Actions**: Send welcome email + update status
3. **Auto-trigger**: Workflow runs when new lead is created
4. **Monitor Progress**: Track email delivery and status updates

### Scenario 4: AI Interaction Demo
1. **Upload Document**: Process business card or resume
2. **Interact with Lead**: Use AI chat to ask questions
3. **Get Insights**: Receive AI-powered recommendations
4. **Take Action**: Follow suggested next steps

## 🔒 Security Features

- **Environment Variables**: Secure configuration management
- **CORS Protection**: Controlled cross-origin requests
- **Input Validation**: Pydantic model validation
- **Error Handling**: Graceful error management
- **Logging**: Comprehensive activity logging

## 🚀 Deployment

### Development
```bash
# Backend
cd backend && python main.py

# Frontend
npm run dev
```

### Production
```bash
# Build frontend
npm run build

# Deploy backend
pip install -r requirements.txt
python main.py
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Make changes
4. Test thoroughly
5. Submit pull request

## 📄 License

MIT License - see LICENSE file for details

---

**Built with ❤️ using React, FastAPI, and Groq AI**
