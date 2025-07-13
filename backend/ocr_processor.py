
import asyncio
import logging
import re
import time
from pathlib import Path
from typing import Any, Dict, List, Optional

import cv2
import fitz  # PyMuPDF for PDF processing
import numpy as np
import pytesseract
from config import settings
from PIL import Image

logger = logging.getLogger(__name__)

class OCRProcessor:
    """
    Advanced OCR processor for extracting lead information from documents
    Uses Tesseract OCR instead of heavy models for better performance
    """
    
    def __init__(self):
        self.supported_formats = ['.pdf', '.png', '.jpg', '.jpeg']
        # Email regex pattern
        self.email_pattern = re.compile(r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b')
        # Phone regex patterns (various formats)
        self.phone_patterns = [
            re.compile(r'\+?1?[-.\s]?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})'),  # US format
            re.compile(r'\+?[0-9]{1,4}[-.\s]?[0-9]{3,4}[-.\s]?[0-9]{3,4}[-.\s]?[0-9]{3,4}'),  # International
            re.compile(r'\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}')  # Standard US
        ]
        # Name patterns (basic heuristics)
        self.name_patterns = [
            re.compile(r'\b([A-Z][a-z]+\s+[A-Z][a-z]+)\b'),  # First Last
            re.compile(r'\b([A-Z][a-z]+\s+[A-Z][a-z]+\s+[A-Z][a-z]+)\b'),  # First Middle Last
        ]
        
    async def health_check(self) -> str:
        """Check if OCR processor is working"""
        try:
            # Test tesseract
            version = pytesseract.get_tesseract_version()
            return f"Tesseract {version} ready"
        except Exception as e:
            logger.error(f"OCR health check failed: {e}")
            return f"OCR unavailable: {str(e)}"
    
    async def process_document(self, file_path: Path) -> Dict[str, Any]:
        """
        Process document and extract lead information
        """
        start_time = time.time()
        
        try:
            file_extension = file_path.suffix.lower()
            
            if file_extension == '.pdf':
                text = await self._extract_text_from_pdf(file_path)
            elif file_extension in ['.png', '.jpg', '.jpeg']:
                text = await self._extract_text_from_image(file_path)
            else:
                raise ValueError(f"Unsupported file format: {file_extension}")
            
            # Extract information from text
            extracted_info = await self._extract_lead_info(text)
            
            processing_time = time.time() - start_time
            
            result = {
                "name": extracted_info.get("name", ""),
                "email": extracted_info.get("email", ""),
                "phone": extracted_info.get("phone", ""),
                "raw_text": text[:500] + "..." if len(text) > 500 else text,  # Truncate for response
                "confidence_score": extracted_info.get("confidence", 0.0),
                "processing_time": round(processing_time, 2),
                "source": "Document Upload"
            }
            
            logger.info(f"Processed document in {processing_time:.2f}s: {extracted_info}")
            return result
            
        except Exception as e:
            logger.error(f"Document processing failed: {str(e)}")
            raise Exception(f"OCR processing failed: {str(e)}")
    
    async def _extract_text_from_pdf(self, file_path: Path) -> str:
        """Extract text from PDF file"""
        try:
            doc = fitz.open(file_path)
            text = ""
            
            for page_num in range(len(doc)):
                page = doc.load_page(page_num)
                text += page.get_text()
                
                # If PDF has no text, try OCR on images
                if not text.strip():
                    pix = page.get_pixmap()
                    img_data = pix.tobytes("png")
                    
                    # Convert to PIL Image for OCR
                    import io
                    image = Image.open(io.BytesIO(img_data))
                    ocr_text = pytesseract.image_to_string(image)
                    text += ocr_text
            
            doc.close()
            return text.strip()
            
        except Exception as e:
            logger.error(f"PDF text extraction failed: {str(e)}")
            raise Exception(f"Failed to process PDF: {str(e)}")
    
    async def _extract_text_from_image(self, file_path: Path) -> str:
        """Extract text from image file using OCR"""
        try:
            # Open and preprocess image
            image = cv2.imread(str(file_path))
            
            # Convert to grayscale
            gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
            
            # Apply noise reduction and sharpening
            gray = cv2.medianBlur(gray, 3)
            
            # Apply adaptive threshold for better OCR
            thresh = cv2.adaptiveThreshold(
                gray, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY, 11, 2
            )
            
            # Use pytesseract for OCR
            custom_config = r'--oem 3 --psm 6'
            text = pytesseract.image_to_string(thresh, config=custom_config)
            
            return text.strip()
            
        except Exception as e:
            logger.error(f"Image OCR failed: {str(e)}")
            raise Exception(f"Failed to process image: {str(e)}")
    
    async def _extract_lead_info(self, text: str) -> Dict[str, Any]:
        """
        Extract lead information from text using regex patterns
        """
        extracted = {
            "name": "",
            "email": "",
            "phone": "",
            "confidence": 0.0
        }
        
        confidence_factors = []
        
        # Extract email
        email_matches = self.email_pattern.findall(text)
        if email_matches:
            extracted["email"] = email_matches[0]  # Take first email found
            confidence_factors.append(0.4)  # Email adds 40% confidence
        
        # Extract phone number
        for pattern in self.phone_patterns:
            phone_matches = pattern.findall(text)
            if phone_matches:
                if isinstance(phone_matches[0], tuple):
                    # For grouped patterns
                    extracted["phone"] = "-".join(phone_matches[0])
                else:
                    extracted["phone"] = phone_matches[0]
                confidence_factors.append(0.3)  # Phone adds 30% confidence
                break
        
        # Extract name (basic heuristic)
        name_candidates = []
        for pattern in self.name_patterns:
            name_matches = pattern.findall(text)
            name_candidates.extend(name_matches)
        
        if name_candidates:
            # Simple heuristic: pick the first name that appears early in text
            lines = text.split('\n')[:5]  # Look in first 5 lines
            for line in lines:
                for candidate in name_candidates:
                    if candidate in line:
                        extracted["name"] = candidate
                        confidence_factors.append(0.3)  # Name adds 30% confidence
                        break
                if extracted["name"]:
                    break
        
        # Calculate overall confidence
        if confidence_factors:
            extracted["confidence"] = min(sum(confidence_factors), 1.0)
        
        # If no name found but we have email, try to extract name from email
        if not extracted["name"] and extracted["email"]:
            email_name = extracted["email"].split('@')[0]
            # Simple conversion: john.doe -> John Doe
            if '.' in email_name:
                parts = email_name.split('.')
                if len(parts) == 2:
                    extracted["name"] = f"{parts[0].capitalize()} {parts[1].capitalize()}"
                    confidence_factors.append(0.1)  # Low confidence for derived name
        
        return extracted
