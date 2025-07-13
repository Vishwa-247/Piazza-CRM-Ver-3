import asyncio
import logging
import os
import uuid
from datetime import datetime
from pathlib import Path
from typing import Any, Dict, Optional

import aiofiles
import uvicorn
from config import settings
from email_service import email_service
from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
# Import our modules
from hybrid_ocr_processor import HybridOCRProcessor
from llm_service import llm_service
from models import HealthResponse, LeadData, ProcessingResponse

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Log application startup
logger.info("🚀 === STARTING MINI-CRM BACKEND API ===")
logger.info(f"🔧 Debug mode: {settings.DEBUG}")
logger.info(f"🌐 Host: {settings.HOST}")
logger.info(f"🔌 Port: {settings.PORT}")
logger.info(f"📁 Upload directory: {settings.UPLOAD_DIR}")
logger.info(f"🗝️  Groq API Key: {'Set' if settings.GROQ_API_KEY else 'Not Set'}")

# Initialize FastAPI app
app = FastAPI(
    title="Mini-CRM Backend API",
    description="AI-powered document processing and lead management backend",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "http://localhost:8081", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

logger.info("🌐 CORS middleware configured")

# Initialize OCR processor
logger.info("🤖 Initializing OCR processor...")
ocr_processor = HybridOCRProcessor()
logger.info("✅ OCR processor initialized")

# Create upload directory
UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)
logger.info(f"📁 Upload directory ready: {UPLOAD_DIR.absolute()}")

logger.info("🎯 === MINI-CRM BACKEND API READY ===")

@app.get("/", response_model=HealthResponse)
async def root():
    """Health check endpoint"""
    return HealthResponse(
        status="healthy",
        message="Mini-CRM Backend API is running",
        timestamp=datetime.now().isoformat()
    )

@app.get("/health", response_model=HealthResponse)
async def health_check():
    """Detailed health check endpoint"""
    try:
        # Test OCR processor
        ocr_status = await ocr_processor.health_check()
        
        return HealthResponse(
            status="healthy",
            message="All systems operational",
            timestamp=datetime.now().isoformat(),
            details={
                "ocr_processor": ocr_status,
                "upload_dir": str(UPLOAD_DIR.absolute()),
                "api_version": "1.0.0"
            }
        )
    except Exception as e:
        logger.error(f"Health check failed: {str(e)}")
        return HealthResponse(
            status="unhealthy",
            message=f"System error: {str(e)}",
            timestamp=datetime.now().isoformat()
        )

@app.post("/api/process-document-enhanced")
async def process_document_enhanced(file: UploadFile = File(...)):
    """
    Enhanced document processing with preview and advanced OCR
    """
    logger.info("=== DOCUMENT PROCESSING STARTED ===")
    
    try:
        # Log initial file info
        logger.info(f"📄 Received file: {file.filename}")
        logger.info(f"📄 Content type: {file.content_type}")
        logger.info(f"📄 File size: {file.size if hasattr(file, 'size') else 'Unknown'}")
        
        # Validate file
        if not file.filename:
            logger.error("❌ No file provided")
            raise HTTPException(status_code=400, detail="No file provided")
        
        # Check file type
        allowed_types = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg']
        logger.info(f"📄 Checking file type: {file.content_type}")
        
        # More flexible file type checking
        if file.content_type not in allowed_types:
            # Check file extension as fallback
            file_extension = Path(file.filename).suffix.lower()
            if file_extension in ['.pdf', '.png', '.jpg', '.jpeg']:
                logger.warning(f"⚠️  File type mismatch but extension is valid: {file.content_type} -> {file_extension}")
            else:
                logger.error(f"❌ Unsupported file type: {file.content_type}")
                raise HTTPException(
                    status_code=400, 
                    detail=f"Unsupported file type: {file.content_type}. Supported: PDF, PNG, JPG"
                )
        
        logger.info("✅ File type validation passed")
        
        # Generate unique filename
        file_extension = Path(file.filename).suffix
        unique_filename = f"{uuid.uuid4()}{file_extension}"
        file_path = UPLOAD_DIR / unique_filename
        
        logger.info(f"📁 Generated unique filename: {unique_filename}")
        logger.info(f"📁 File path: {file_path}")
        
        # Save uploaded file
        try:
            logger.info("💾 Starting file save...")
            async with aiofiles.open(file_path, 'wb') as f:
                content = await file.read()
                logger.info(f"💾 Read {len(content)} bytes from upload")
                await f.write(content)
            
            logger.info("✅ File saved successfully")
            
            # Verify file was saved
            if file_path.exists():
                file_size = file_path.stat().st_size
                logger.info(f"✅ File exists on disk: {file_size} bytes")
            else:
                logger.error("❌ File was not saved to disk")
                raise Exception("File was not saved to disk")
                
        except Exception as e:
            logger.error(f"❌ File save failed: {str(e)}")
            raise HTTPException(status_code=500, detail=f"Failed to save file: {str(e)}")
        
        logger.info(f"🔄 Processing file: {file.filename} -> {unique_filename}")
        
        # Process document with enhanced OCR
        try:
            logger.info("🤖 Starting OCR processing...")
            logger.info(f"📄 File path for OCR: {file_path}")
            logger.info(f"📄 File exists: {file_path.exists()}")
            logger.info(f"📄 File size: {file_path.stat().st_size} bytes")
            
            result = await ocr_processor.process_document_enhanced(file_path)
            
            if result.get("success"):
                logger.info("✅ OCR processing completed successfully")
                logger.info(f"📊 Extracted data: {result.get('extracted_data', {})}")
                logger.info(f"📊 Confidence score: {result.get('confidence_score', 0)}")
                logger.info(f"📊 Processing time: {result.get('processing_metadata', {}).get('processing_time', 0)}s")
                logger.info(f"📊 Methods used: {result.get('processing_metadata', {}).get('methods_used', [])}")
            else:
                logger.error(f"❌ OCR processing failed: {result.get('message', 'Unknown error')}")
                logger.error(f"❌ Result details: {result}")
                
        except Exception as e:
            logger.error(f"❌ OCR processing error: {str(e)}")
            logger.error(f"❌ Error type: {type(e).__name__}")
            import traceback
            logger.error(f"❌ Full traceback: {traceback.format_exc()}")
            
            # Create error response
            result = {
                "success": False,
                "extracted_data": {"name": "", "email": "", "phone": "N/A", "confidence_score": 0.0},
                "document_preview": None,
                "processing_metadata": {"document_type": "unknown", "processing_time": 0, "methods_used": ["Failed"]},
                "confidence_score": 0.0,
                "message": f"OCR processing failed: {str(e)}"
            }
            
            # Don't raise exception here, return error result instead
            logger.warning("⚠️  Returning error result instead of raising exception")
        
        # Clean up uploaded file
        try:
            logger.info("🧹 Cleaning up uploaded file...")
            os.remove(file_path)
            logger.info("✅ File cleanup completed")
        except Exception as e:
            logger.warning(f"⚠️  Failed to cleanup file {file_path}: {e}")
        
        logger.info("=== DOCUMENT PROCESSING COMPLETED ===")
        return result
        
    except HTTPException:
        logger.error("❌ HTTP Exception occurred")
        raise
    except Exception as e:
        logger.error(f"❌ Unexpected error in document processing: {str(e)}")
        logger.error(f"❌ Error type: {type(e).__name__}")
        import traceback
        logger.error(f"❌ Full traceback: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=f"Processing failed: {str(e)}")

@app.post("/api/process-document", response_model=ProcessingResponse)
async def process_document(file: UploadFile = File(...)):
    """
    Process uploaded document and extract lead information
    Supports PDF, PNG, JPG, JPEG formats
    """
    logger.info("=== BASIC DOCUMENT PROCESSING STARTED ===")
    
    try:
        # Log initial file info
        logger.info(f"📄 Received file: {file.filename}")
        logger.info(f"📄 Content type: {file.content_type}")
        
        # Validate file
        if not file.filename:
            logger.error("❌ No file provided")
            raise HTTPException(status_code=400, detail="No file provided")
        
        # Check file extension
        allowed_extensions = ['.pdf', '.png', '.jpg', '.jpeg']
        file_extension = Path(file.filename).suffix.lower()
        
        if file_extension not in allowed_extensions:
            logger.error(f"❌ Unsupported file extension: {file_extension}")
            raise HTTPException(
                status_code=400, 
                detail=f"Unsupported file type. Supported: {', '.join(allowed_extensions)}"
            )
        
        logger.info("✅ File validation passed")
        
        # Generate unique filename
        unique_filename = f"{uuid.uuid4()}{file_extension}"
        file_path = UPLOAD_DIR / unique_filename
        
        logger.info(f"📁 Generated unique filename: {unique_filename}")
        
        # Save uploaded file
        try:
            logger.info("💾 Starting file save...")
            async with aiofiles.open(file_path, 'wb') as f:
                content = await file.read()
                await f.write(content)
            logger.info("✅ File saved successfully")
        except Exception as e:
            logger.error(f"❌ File save failed: {str(e)}")
            raise HTTPException(status_code=500, detail=f"Failed to save file: {str(e)}")
        
        logger.info(f"🔄 Processing file: {file.filename} -> {unique_filename}")
        
        # Process document
        try:
            logger.info("🤖 Starting basic OCR processing...")
            result = await ocr_processor.process_document_enhanced(file_path)
            
            # Convert to ProcessingResponse format
            processing_response = ProcessingResponse(
                success=result.get("success", False),
                extracted_data=result.get("extracted_data", {}),
                confidence_score=result.get("confidence_score", 0.0),
                message=result.get("message", "Processing completed")
            )
            
            logger.info("✅ Basic OCR processing completed successfully")
            
        except Exception as e:
            logger.error(f"❌ OCR processing error: {str(e)}")
            raise HTTPException(status_code=500, detail=f"OCR processing failed: {str(e)}")
        
        # Clean up uploaded file
        try:
            logger.info("🧹 Cleaning up uploaded file...")
            os.remove(file_path)
            logger.info("✅ File cleanup completed")
        except Exception as e:
            logger.warning(f"⚠️  Failed to cleanup file {file_path}: {e}")
        
        logger.info("=== BASIC DOCUMENT PROCESSING COMPLETED ===")
        return processing_response
        
    except HTTPException:
        logger.error("❌ HTTP Exception occurred")
        raise
    except Exception as e:
        logger.error(f"❌ Unexpected error in basic document processing: {str(e)}")
        import traceback
        logger.error(f"❌ Full traceback: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=f"Processing failed: {str(e)}")

@app.post("/api/create-lead", response_model=Dict[str, Any])
async def create_lead(lead_data: LeadData):
    """
    Create a new lead (simulated - would integrate with database)
    """
    try:
        # Simulate lead creation logic
        lead_id = str(uuid.uuid4())
        created_lead = {
            "id": lead_id,
            "name": lead_data.name,
            "email": lead_data.email,
            "phone": lead_data.phone or "N/A",
            "status": "new",
            "source": lead_data.source,
            "created_at": datetime.now().isoformat(),
            "confidence_score": getattr(lead_data, 'confidence_score', None)
        }
        
        logger.info(f"Created lead: {lead_id} - {lead_data.name}")
        
        return {
            "success": True,
            "message": "Lead created successfully",
            "lead": created_lead
        }
        
    except Exception as e:
        logger.error(f"Lead creation error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to create lead: {str(e)}")

@app.get("/api/supported-formats")
async def get_supported_formats():
    """Get list of supported document formats"""
    return {
        "formats": [
            {
                "type": "PDF",
                "mime_types": ["application/pdf"],
                "extensions": [".pdf"],
                "description": "Portable Document Format"
            },
            {
                "type": "PNG",
                "mime_types": ["image/png"],
                "extensions": [".png"],
                "description": "Portable Network Graphics"
            },
            {
                "type": "JPEG",
                "mime_types": ["image/jpeg", "image/jpg"],
                "extensions": [".jpg", ".jpeg"],
                "description": "JPEG Image Format"
            }
        ],
        "max_file_size": "10MB",
        "processing_features": [
            "Text extraction",
            "Name detection", 
            "Email extraction",
            "Phone number detection",
            "Confidence scoring"
        ]
    }

# Email endpoints
@app.post("/api/email/configure")
async def configure_email(email_data: Dict[str, str]):
    """Configure email settings"""
    try:
        email = email_data.get("email")
        password = email_data.get("password")
        name = email_data.get("name", "Piazza CRM")
        
        if not email or not password:
            raise HTTPException(status_code=400, detail="Email and password are required")
        
        email_service.configure_email(email, password, name)
        
        logger.info(f"Email service configured for: {email}")
        
        return {
            "success": True,
            "message": "Email configuration saved successfully"
        }
        
    except Exception as e:
        logger.error(f"Email configuration error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to configure email: {str(e)}")

@app.post("/api/email/send")
async def send_email(email_data: Dict[str, str]):
    """Send email using SMTP"""
    try:
        to_email = email_data.get("to_email")
        to_name = email_data.get("to_name")
        subject = email_data.get("subject")
        message = email_data.get("message")
        
        if not all([to_email, to_name, subject, message]):
            raise HTTPException(status_code=400, detail="All email fields are required")
        
        result = email_service.send_email(to_email, to_name, subject, message)
        
        if result["success"]:
            logger.info(f"Email sent successfully to {to_email}")
            return result
        else:
            logger.error(f"Failed to send email: {result.get('message')}")
            # Return detailed error information
            error_detail = {
                "success": False,
                "message": result.get("message", "Failed to send email"),
                "error": result.get("error", ""),
                "help": result.get("help", "")
            }
            raise HTTPException(status_code=500, detail=error_detail)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Email sending error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to send email: {str(e)}")

@app.post("/api/email/test")
async def test_email_connection():
    """Test SMTP connection"""
    try:
        result = email_service.test_connection()
        
        if result["success"]:
            logger.info("Email connection test successful")
            return result
        else:
            logger.error(f"Email connection test failed: {result.get('message')}")
            # Return detailed error information
            error_detail = {
                "success": False,
                "message": result.get("message", "Email connection test failed"),
                "error": result.get("error", ""),
                "help": result.get("help", "")
            }
            raise HTTPException(status_code=500, detail=error_detail)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Email test error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Email test failed: {str(e)}")

# LLM endpoints
@app.post("/api/llm/chat")
async def chat_with_llm(chat_data: Dict[str, Any]):
    """Chat with LLM about a lead"""
    try:
        user_message = chat_data.get("message")
        lead_data = chat_data.get("lead_data", {})
        conversation_history = chat_data.get("conversation_history", [])
        
        if not user_message:
            raise HTTPException(status_code=400, detail="Message is required")
        
        if not lead_data:
            raise HTTPException(status_code=400, detail="Lead data is required")
        
        result = llm_service.generate_response(user_message, lead_data, conversation_history)
        
        if result["success"]:
            logger.info(f"LLM chat response generated for lead {lead_data.get('name', 'Unknown')}")
            return result
        else:
            logger.error(f"LLM chat failed: {result.get('message')}")
            raise HTTPException(status_code=500, detail=result.get("message", "LLM chat failed"))
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"LLM chat error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"LLM chat failed: {str(e)}")

@app.post("/api/llm/analyze-lead")
async def analyze_lead_with_llm(lead_data: Dict[str, Any]):
    """Analyze lead with LLM"""
    try:
        if not lead_data:
            raise HTTPException(status_code=400, detail="Lead data is required")
        
        result = llm_service.analyze_lead(lead_data)
        
        if result["success"]:
            logger.info(f"LLM lead analysis completed for {lead_data.get('name', 'Unknown')}")
            return result
        else:
            logger.error(f"LLM lead analysis failed: {result.get('message')}")
            raise HTTPException(status_code=500, detail=result.get("message", "LLM analysis failed"))
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"LLM analysis error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"LLM analysis failed: {str(e)}")

@app.get("/api/llm/status")
async def get_llm_status():
    """Check LLM service status"""
    try:
        is_available = llm_service.is_available()
        return {
            "available": is_available,
            "message": "LLM service is available" if is_available else "LLM service is not available"
        }
    except Exception as e:
        logger.error(f"LLM status check error: {str(e)}")
        return {
            "available": False,
            "message": f"LLM status check failed: {str(e)}"
        }

if __name__ == "__main__":
    logger.info("🚀 === STARTING UVICORN SERVER ===")
    logger.info(f"🌐 Server will run on: http://{settings.HOST}:{settings.PORT}")
    logger.info(f"📚 API Documentation: http://{settings.HOST}:{settings.PORT}/docs")
    logger.info(f"🔄 Hot reload: {settings.DEBUG}")
    
    uvicorn.run(
        "main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG,
        log_level="info"
    )
