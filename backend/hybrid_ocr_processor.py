import logging
import re
import time
import base64
import json
from pathlib import Path
from typing import Dict, Any, Optional, List
import asyncio
from PIL import Image
import pytesseract
import fitz  # PyMuPDF for PDF processing
import cv2
import numpy as np
from groq import Groq
import httpx
from config import settings

logger = logging.getLogger(__name__)

class HybridOCRProcessor:
    """
    Hybrid OCR processor that uses Tesseract OCR first, then Groq AI for intelligent extraction
    """
    
    def __init__(self):
        self.supported_formats = ['.pdf', '.png', '.jpg', '.jpeg']
        # Initialize Groq client (will use environment variable GROQ_API_KEY)
        self.groq_client = None
        try:
            self.groq_client = Groq()
            logger.info("Groq client initialized successfully")
        except Exception as e:
            logger.warning(f"Groq client initialization failed: {e}")
        
        # Email regex pattern
        self.email_pattern = re.compile(r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b')
        # Phone regex patterns (various formats)
        self.phone_patterns = [
            re.compile(r'\+?1?[-.\s]?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})'),  # US format
            re.compile(r'\+?[0-9]{1,4}[-.\s]?[0-9]{3,4}[-.\s]?[0-9]{3,4}[-.\s]?[0-9]{3,4}'),  # International
            re.compile(r'\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}')  # Standard US
        ]
        
    async def health_check(self) -> str:
        """Check if OCR processor is working"""
        try:
            # Test tesseract
            version = pytesseract.get_tesseract_version()
            groq_status = "available" if self.groq_client else "unavailable"
            return f"Tesseract {version} ready, Groq {groq_status}"
        except Exception as e:
            logger.error(f"OCR health check failed: {e}")
            return f"OCR unavailable: {str(e)}"
    
    async def process_document_enhanced(self, file_path: Path) -> Dict[str, Any]:
        """
        Enhanced document processing: OCR first, then Groq AI for intelligent extraction
        """
        start_time = time.time()
        
        try:
            # Step 1: Extract raw text using OCR
            logger.info("Step 1: Extracting text with OCR...")
            raw_text = await self._extract_with_tesseract(file_path)
            logger.info(f"OCR extracted {len(raw_text)} characters")
            
            # Step 2: Generate document preview
            document_preview = await self._generate_preview(file_path)
            
            # Step 3: Use Groq AI for intelligent extraction
            if self.groq_client and raw_text.strip():
                logger.info("Step 2: Processing with Groq AI...")
                extracted_info = await self._extract_with_groq_ai(raw_text)
                methods_used = ["Tesseract OCR", "Groq AI"]
            else:
                logger.info("Step 2: Fallback to regex extraction...")
                extracted_info = await self._extract_lead_info_enhanced(raw_text)
                methods_used = ["Tesseract OCR", "Regex Extraction"]
            
            processing_time = time.time() - start_time
            
            result = {
                "success": True,
                "extracted_data": {
                    "name": extracted_info.get("name", ""),
                    "email": extracted_info.get("email", ""),
                    "phone": extracted_info.get("phone", "N/A"),
                    "confidence_score": extracted_info.get("confidence", 0.0)
                },
                "document_preview": document_preview,
                "processing_metadata": {
                    "document_type": self._detect_document_type(raw_text),
                    "processing_time": round(processing_time, 2),
                    "methods_used": methods_used,
                    "text_length": len(raw_text)
                },
                "confidence_score": extracted_info.get("confidence", 0.0),
                "raw_text": raw_text[:500],  # Include first 500 chars for debugging
                "message": "Document processed successfully"
            }
            
            logger.info(f"Enhanced processing completed in {processing_time:.2f}s")
            return result
            
        except Exception as e:
            logger.error(f"Enhanced document processing failed: {str(e)}")
            
            # Return error with document preview if possible
            try:
                document_preview = await self._generate_preview(file_path)
            except:
                document_preview = None
                
            return {
                "success": False,
                "extracted_data": {"name": "", "email": "", "phone": "N/A", "confidence_score": 0.0},
                "document_preview": document_preview,
                "processing_metadata": {"document_type": "unknown", "processing_time": 0, "methods_used": []},
                "confidence_score": 0.0,
                "message": f"Processing failed: {str(e)}"
            }
    
    async def _extract_with_groq_ai(self, text: str) -> Dict[str, Any]:
        """Extract contact information using Groq AI"""
        try:
            prompt = f"""You are an expert data extraction assistant. Extract contact information from this OCR text from a business card, resume, or document.

OCR Text:
{text}

Instructions:
1. Identify the PRIMARY CONTACT PERSON'S name (not company name, not multiple people)
2. Extract email address with proper format validation
3. Extract phone number in any format
4. If information is unclear or missing, use "N/A"
5. For names, prioritize the most prominent person (usually first name mentioned or largest text)

Return ONLY valid JSON in this exact format:
{{
  "name": "Full Name Here",
  "email": "email@domain.com",
  "phone": "+1-555-123-4567",
  "confidence": 0.95
}}

Rules:
- Name should be 2-4 words maximum
- Exclude titles like "Mr.", "Dr.", "CEO", "Manager"
- If multiple emails, pick the most professional one
- Phone can include country code, spaces, dashes, or parentheses
- Confidence score from 0.0 to 1.0 based on text clarity
- Do not include company names as personal names
- If text is garbled or unclear, lower confidence score

Examples:
- "John Smith CEO" → name: "John Smith"
- "ACME Corp\\nMary Johnson\\nSales Manager" → name: "Mary Johnson"
- "Dr. Robert Wilson MD" → name: "Robert Wilson"
"""

            completion = self.groq_client.chat.completions.create(
                messages=[
                    {"role": "system", "content": "You are a precise data extraction assistant. Return only valid JSON."},
                    {"role": "user", "content": prompt}
                ],
                model="llama-3.1-8b-instant",
                temperature=0.1,
                max_tokens=500
            )
            
            response_text = completion.choices[0].message.content.strip()
            logger.info(f"Groq AI response: {response_text}")
            
            # Parse JSON response
            try:
                result = json.loads(response_text)
                return {
                    "name": result.get("name", ""),
                    "email": result.get("email", ""),
                    "phone": result.get("phone", "N/A"),
                    "confidence": result.get("confidence", 0.8)
                }
            except json.JSONDecodeError:
                logger.warning("Failed to parse Groq AI JSON response, using fallback")
                return await self._extract_lead_info_enhanced(text)
                
        except Exception as e:
            logger.error(f"Groq AI extraction failed: {e}")
            return await self._extract_lead_info_enhanced(text)
    
    async def _generate_preview(self, file_path: Path) -> Optional[str]:
        """Generate base64 encoded preview of the document"""
        try:
            file_extension = file_path.suffix.lower()
            
            if file_extension == '.pdf':
                # Convert first page of PDF to image
                doc = fitz.open(file_path)
                page = doc.load_page(0)
                pix = page.get_pixmap(matrix=fitz.Matrix(2, 2))  # 2x zoom for better quality
                img_data = pix.tobytes("png")
                doc.close()
                
                # Convert to base64
                return base64.b64encode(img_data).decode('utf-8')
                
            elif file_extension in ['.png', '.jpg', '.jpeg']:
                # Read image and convert to base64
                with open(file_path, 'rb') as img_file:
                    img_data = img_file.read()
                    return base64.b64encode(img_data).decode('utf-8')
                    
        except Exception as e:
            logger.error(f"Preview generation failed: {str(e)}")
            return None
    
    async def _extract_with_tesseract(self, file_path: Path) -> str:
        """Extract text using Tesseract OCR"""
        file_extension = file_path.suffix.lower()
        
        if file_extension == '.pdf':
            return await self._extract_text_from_pdf(file_path)
        elif file_extension in ['.png', '.jpg', '.jpeg']:
            return await self._extract_text_from_image(file_path)
        else:
            raise ValueError(f"Unsupported file format: {file_extension}")
    
    async def _extract_text_from_pdf(self, file_path: Path) -> str:
        """Extract text from PDF file"""
        try:
            doc = fitz.open(file_path)
            text = ""
            
            for page_num in range(min(3, len(doc))):  # Process max 3 pages
                page = doc.load_page(page_num)
                page_text = page.get_text()
                
                # If PDF has no text, try OCR on images
                if not page_text.strip():
                    pix = page.get_pixmap(matrix=fitz.Matrix(2, 2))  # Higher resolution
                    img_data = pix.tobytes("png")
                    
                    # Convert to PIL Image for OCR
                    import io
                    image = Image.open(io.BytesIO(img_data))
                    
                    # Preprocess image for better OCR
                    image_array = np.array(image)
                    if len(image_array.shape) == 3:
                        gray = cv2.cvtColor(image_array, cv2.COLOR_RGB2GRAY)
                    else:
                        gray = image_array
                    
                    # Apply preprocessing
                    gray = cv2.medianBlur(gray, 3)
                    thresh = cv2.adaptiveThreshold(
                        gray, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY, 11, 2
                    )
                    
                    # OCR with better config
                    custom_config = r'--oem 3 --psm 6'
                    ocr_text = pytesseract.image_to_string(Image.fromarray(thresh), config=custom_config)
                    text += ocr_text
                else:
                    text += page_text
                
                text += "\n"
            
            doc.close()
            return text.strip()
            
        except Exception as e:
            logger.error(f"PDF text extraction failed: {str(e)}")
            raise Exception(f"Failed to process PDF: {str(e)}")
    
    async def _extract_text_from_image(self, file_path: Path) -> str:
        """Extract text from image file using OCR with enhanced preprocessing for Aadhaar/ID documents"""
        try:
            # Open and preprocess image
            image = cv2.imread(str(file_path))
            
            if image is None:
                raise Exception("Could not load image file")
            
            # Convert to grayscale
            gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
            
            # Enhanced preprocessing for ID documents
            # 1. Noise reduction
            gray = cv2.medianBlur(gray, 3)
            
            # 2. Contrast enhancement with CLAHE
            clahe = cv2.createCLAHE(clipLimit=3.0, tileGridSize=(8,8))
            gray = clahe.apply(gray)
            
            # 3. Morphological operations to clean up text
            kernel = np.ones((1,1), np.uint8)
            gray = cv2.morphologyEx(gray, cv2.MORPH_CLOSE, kernel)
            gray = cv2.morphologyEx(gray, cv2.MORPH_OPEN, kernel)
            
            # 4. Apply adaptive threshold for better OCR
            thresh = cv2.adaptiveThreshold(
                gray, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY, 11, 2
            )
            
            # 5. Dilation to connect text components
            kernel = np.ones((1,1), np.uint8)
            thresh = cv2.dilate(thresh, kernel, iterations=1)
            
            # Enhanced OCR configuration for Indian documents
            # Multiple OCR attempts with different configurations
            custom_configs = [
                r'--oem 3 --psm 6 -l eng',  # Standard English
                r'--oem 3 --psm 8 -l eng',  # Single word
                r'--oem 3 --psm 7 -l eng',  # Single text line
                r'--oem 3 --psm 4 -l eng',  # Single column
                r'--oem 3 --psm 6 -l eng+hin',  # English + Hindi (if available)
            ]
            
            best_text = ""
            best_confidence = 0
            
            for config in custom_configs:
                try:
                    # Try OCR with current config
                    text = pytesseract.image_to_string(Image.fromarray(thresh), config=config)
                    
                    # Get confidence scores
                    data = pytesseract.image_to_data(Image.fromarray(thresh), config=config, output_type=pytesseract.Output.DICT)
                    confidences = [int(conf) for conf in data['conf'] if int(conf) > 0]
                    avg_confidence = sum(confidences) / len(confidences) if confidences else 0
                    
                    # Keep the best result
                    if avg_confidence > best_confidence and len(text.strip()) > len(best_text.strip()):
                        best_text = text
                        best_confidence = avg_confidence
                        
                except Exception as e:
                    logger.warning(f"OCR config failed: {config} - {e}")
                    continue
            
            # If no good results, try with original grayscale image
            if not best_text.strip():
                try:
                    best_text = pytesseract.image_to_string(Image.fromarray(gray), config=r'--oem 3 --psm 6 -l eng')
                except Exception as e:
                    logger.warning(f"Fallback OCR failed: {e}")
            
            logger.info(f"OCR completed with confidence: {best_confidence:.2f}%")
            return best_text.strip()
            
        except Exception as e:
            logger.error(f"Image OCR failed: {str(e)}")
            raise Exception(f"Failed to process image: {str(e)}")
    
    def _detect_document_type(self, text: str) -> str:
        """Detect document type based on content"""
        text_lower = text.lower()
        
        if any(keyword in text_lower for keyword in ['resume', 'cv', 'curriculum', 'experience', 'education', 'skills']):
            return 'resume'
        elif any(keyword in text_lower for keyword in ['business card', 'card', 'company', 'title', 'position']):
            return 'business_card'
        elif any(keyword in text_lower for keyword in ['form', 'application', 'survey']):
            return 'form'
        elif '@' in text and any(pattern.search(text) for pattern in self.phone_patterns):
            return 'contact_info'
        else:
            return 'document'
    
    async def _extract_lead_info_enhanced(self, text: str) -> Dict[str, Any]:
        """
        Enhanced lead information extraction with better accuracy for Indian documents
        """
        extracted = {
            "name": "",
            "email": "",
            "phone": "",
            "confidence": 0.0
        }
        
        confidence_factors = []
        
        # Extract email with enhanced validation
        email_matches = self.email_pattern.findall(text)
        if email_matches:
            # Filter out common false positives
            valid_emails = [email for email in email_matches 
                          if not any(invalid in email.lower() for invalid in ['noreply', 'donotreply', 'example.com'])]
            if valid_emails:
                extracted["email"] = valid_emails[0]  # Take first valid email
                confidence_factors.append(0.4)  # Email adds 40% confidence
        
        # Enhanced phone number extraction for Indian numbers
        # Indian phone patterns
        indian_phone_patterns = [
            re.compile(r'\b(?:\+91|91)?[-.\s]?([6-9]\d{9})\b'),  # Indian mobile
            re.compile(r'\b(?:\+91|91)?[-.\s]?([6-9]\d{4}[-.\s]?\d{5})\b'),  # Indian mobile with separator
            re.compile(r'\b(?:\+91|91)?[-.\s]?([2-9]\d{2,4}[-.\s]?\d{6,8})\b'),  # Indian landline
        ]
        
        # Combine with existing patterns
        all_phone_patterns = self.phone_patterns + indian_phone_patterns
        
        for pattern in all_phone_patterns:
            phone_matches = pattern.findall(text)
            if phone_matches:
                phone = phone_matches[0]
                if isinstance(phone, tuple):
                    phone = phone[0]
                
                # Clean and format phone number
                phone = re.sub(r'[^\d]', '', phone)  # Remove non-digits
                
                # Format Indian mobile numbers
                if len(phone) == 10 and phone[0] in '6789':
                    phone = f"+91 {phone[:5]}-{phone[5:]}"
                elif len(phone) == 12 and phone.startswith('91'):
                    phone = f"+91 {phone[2:7]}-{phone[7:]}"
                elif len(phone) == 10:
                    phone = f"({phone[:3]}) {phone[3:6]}-{phone[6:]}"
                elif len(phone) == 11 and phone[0] == '1':
                    phone = f"+1 ({phone[1:4]}) {phone[4:7]}-{phone[7:]}"
                
                extracted["phone"] = phone
                confidence_factors.append(0.3)  # Phone adds 30% confidence
                break
        
        # Enhanced name extraction for Indian names
        name_candidates = []
        
        # Look for names in specific contexts
        lines = text.split('\n')
        
        # Check first few lines for names (common in ID documents)
        for i, line in enumerate(lines[:8]):  # Check more lines for ID documents
            line = line.strip()
            if len(line) > 3 and len(line) < 60:  # Reasonable name length
                # Clean the line
                cleaned_line = re.sub(r'[^\w\s]', ' ', line)
                words = cleaned_line.split()
                
                if len(words) >= 2 and len(words) <= 4:
                    # Check if it looks like a name
                    if all(len(word) > 1 for word in words):
                        # Skip common document words
                        skip_words = ['government', 'india', 'unique', 'identification', 'authority', 'aadhaar', 'card', 'date', 'birth', 'address', 'male', 'female']
                        if not any(skip_word in line.lower() for skip_word in skip_words):
                            score = 1.0 - (i * 0.05)  # Earlier lines get higher scores
                            name_candidates.append((line, score))
        
        # Look for name after keywords
        name_keywords = ['name', 'naam', 'नाम']
        for keyword in name_keywords:
            pattern = re.compile(rf'{keyword}[:\s]+([A-Za-z\s]+)', re.IGNORECASE)
            matches = pattern.findall(text)
            for match in matches:
                clean_match = match.strip()
                if len(clean_match) > 3 and len(clean_match) < 60:
                    name_candidates.append((clean_match, 0.8))
        
        # If email found but no name, try to derive from email
        if not name_candidates and extracted["email"]:
            email_name = extracted["email"].split('@')[0]
            if '.' in email_name:
                parts = email_name.split('.')
                if len(parts) == 2 and all(len(part) > 1 for part in parts):
                    derived_name = f"{parts[0].capitalize()} {parts[1].capitalize()}"
                    name_candidates.append((derived_name, 0.2))  # Low confidence for derived name
        
        # Select best name candidate
        if name_candidates:
            # Sort by score and take the best one
            name_candidates.sort(key=lambda x: x[1], reverse=True)
            extracted["name"] = name_candidates[0][0]
            confidence_factors.append(0.3 * name_candidates[0][1])  # Weighted confidence
        
        # Calculate overall confidence
        if confidence_factors:
            extracted["confidence"] = min(sum(confidence_factors), 1.0)
        
        # Boost confidence if multiple fields found
        fields_found = sum(1 for field in ['name', 'email', 'phone'] if extracted[field])
        if fields_found >= 2:
            extracted["confidence"] = min(extracted["confidence"] * 1.2, 1.0)
        
        return extracted
