import logging
import smtplib
import ssl
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from typing import Any, Dict, Optional

logger = logging.getLogger(__name__)

class EmailService:
    def __init__(self):
        self.smtp_server = "smtp.gmail.com"
        self.smtp_port = 587
        self.sender_email = "piazzacrm.demo@gmail.com"
        self.sender_password = "your_app_password_here"  # You'll need to set this
        self.sender_name = "Piazza CRM"
        
    def configure_email(self, email: str, password: str, name: str = "Piazza CRM"):
        """Configure email settings"""
        self.sender_email = email
        self.sender_password = password
        self.sender_name = name
        logger.info(f"Email service configured for: {email}")
        
    def send_email(self, to_email: str, to_name: str, subject: str, message: str) -> Dict[str, Any]:
        """Send email using SMTP"""
        try:
            # Create message
            msg = MIMEMultipart()
            msg['From'] = f"{self.sender_name} <{self.sender_email}>"
            msg['To'] = to_email
            msg['Subject'] = subject
            
            # Add body
            body = f"""
            Hi {to_name},
            
            {message}
            
            Best regards,
            {self.sender_name}
            """
            
            msg.attach(MIMEText(body, 'plain'))
            
            # Create SMTP session
            context = ssl.create_default_context()
            
            logger.info(f"Attempting to send email to {to_email} via {self.smtp_server}:{self.smtp_port}")
            logger.info(f"Using sender: {self.sender_email}")
            
            with smtplib.SMTP(self.smtp_server, self.smtp_port) as server:
                server.starttls(context=context)
                logger.info("TLS started, attempting login...")
                server.login(self.sender_email, self.sender_password)
                logger.info("Login successful, sending email...")
                
                # Send email
                text = msg.as_string()
                server.sendmail(self.sender_email, to_email, text)
                
            logger.info(f"Email sent successfully to {to_email}")
            return {
                "success": True,
                "message": f"Email sent successfully to {to_name}",
                "to": to_email,
                "subject": subject
            }
            
        except smtplib.SMTPAuthenticationError as e:
            logger.error(f"Gmail authentication failed: {str(e)}")
            return {
                "success": False,
                "message": "Gmail authentication failed. Please check your email and app password. Make sure you're using an App Password, not your regular Gmail password.",
                "error": str(e),
                "help": "Go to Google Account → Security → App Passwords to generate a new app password"
            }
        except smtplib.SMTPException as e:
            logger.error(f"SMTP error: {str(e)}")
            return {
                "success": False,
                "message": f"SMTP error: {str(e)}",
                "error": str(e)
            }
        except Exception as e:
            logger.error(f"Failed to send email: {str(e)}")
            return {
                "success": False,
                "message": f"Failed to send email: {str(e)}",
                "error": str(e)
            }
    
    def test_connection(self) -> Dict[str, Any]:
        """Test SMTP connection"""
        try:
            logger.info(f"Testing SMTP connection to {self.smtp_server}:{self.smtp_port}")
            context = ssl.create_default_context()
            
            with smtplib.SMTP(self.smtp_server, self.smtp_port) as server:
                server.starttls(context=context)
                logger.info("TLS started, testing login...")
                server.login(self.sender_email, self.sender_password)
                logger.info("Login test successful")
                
            logger.info("SMTP connection test successful")
            return {
                "success": True,
                "message": "SMTP connection successful"
            }
            
        except smtplib.SMTPAuthenticationError as e:
            logger.error(f"SMTP authentication test failed: {str(e)}")
            return {
                "success": False,
                "message": "Gmail authentication failed. Please check your email and app password. Make sure you're using an App Password, not your regular Gmail password.",
                "error": str(e),
                "help": "Go to Google Account → Security → App Passwords to generate a new app password"
            }
        except Exception as e:
            logger.error(f"SMTP connection test failed: {str(e)}")
            return {
                "success": False,
                "message": f"SMTP connection failed: {str(e)}",
                "error": str(e)
            }

# Create global email service instance
email_service = EmailService() 
