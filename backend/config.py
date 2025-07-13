
import os
from pathlib import Path

from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

class Settings:
    # FastAPI settings
    HOST = "0.0.0.0"
    PORT = 8000
    DEBUG = True
    
    # Upload settings
    UPLOAD_DIR = Path("uploads")
    MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB
    
    # OCR settings
    GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")
    
    # Tesseract OCR path for Windows
    TESSERACT_CMD = r"C:\Program Files\Tesseract-OCR\tesseract.exe"
    
    # Supported file types
    SUPPORTED_MIME_TYPES = [
        'application/pdf',
        'image/png', 
        'image/jpeg',
        'image/jpg'
    ]
    
    SUPPORTED_EXTENSIONS = ['.pdf', '.png', '.jpg', '.jpeg']
    
    # CORS settings
    CORS_ORIGINS: list = os.getenv("CORS_ORIGINS", "http://localhost:5173,http://localhost:3000").split(",")
    
    # Logging
    LOG_LEVEL: str = os.getenv("LOG_LEVEL", "INFO")

settings = Settings()

# Configure tesseract path if provided
if settings.TESSERACT_CMD:
    import pytesseract
    pytesseract.pytesseract.tesseract_cmd = settings.TESSERACT_CMD
