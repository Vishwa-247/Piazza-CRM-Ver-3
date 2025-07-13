import json
import logging
from typing import Any, Dict, List, Optional

from config import settings
from groq import Groq

logger = logging.getLogger(__name__)

class LLMService:
    """
    LLM service for CRM interactions and lead analysis
    """
    
    def __init__(self):
        self.groq_client = None
        try:
            self.groq_client = Groq()
            logger.info("LLM service initialized successfully")
        except Exception as e:
            logger.warning(f"LLM service initialization failed: {e}")
    
    def is_available(self) -> bool:
        """Check if LLM service is available"""
        return self.groq_client is not None
    
    def generate_response(self, user_message: str, lead_data: Dict[str, Any], conversation_history: List[Dict[str, Any]] = None) -> Dict[str, Any]:
        """Generate AI response for lead interaction"""
        try:
            if not self.groq_client:
                return {
                    "success": False,
                    "message": "LLM service not available",
                    "response": "I'm sorry, the AI service is currently unavailable. Please try again later."
                }
            
            # Build context from lead data
            lead_context = self._build_lead_context(lead_data)
            
            # Build conversation history
            history_context = ""
            if conversation_history:
                history_context = self._build_conversation_history(conversation_history)
            
            # Create the prompt
            prompt = f"""You are an AI assistant for a CRM system. You're helping a sales representative interact with a lead.

LEAD INFORMATION:
{lead_context}

CONVERSATION HISTORY:
{history_context}

USER MESSAGE:
{user_message}

Instructions:
1. Provide helpful, professional responses about the lead
2. Suggest next steps, follow-up actions, or communication strategies
3. Answer questions about the lead's status, contact info, or history
4. Be conversational but professional
5. If asked about sending emails, suggest using the email feature
6. If asked about workflows, explain the automation features
7. Keep responses concise but informative

Respond naturally as if you're a helpful CRM assistant:"""

            completion = self.groq_client.chat.completions.create(
                messages=[
                    {"role": "system", "content": "You are a helpful CRM assistant. Provide professional, actionable advice about leads and sales processes."},
                    {"role": "user", "content": prompt}
                ],
                model="llama-3.1-8b-instant",
                temperature=0.7,
                max_tokens=500
            )
            
            response = completion.choices[0].message.content.strip()
            
            logger.info(f"LLM response generated for lead {lead_data.get('name', 'Unknown')}")
            
            return {
                "success": True,
                "message": "Response generated successfully",
                "response": response
            }
            
        except Exception as e:
            logger.error(f"LLM response generation failed: {e}")
            return {
                "success": False,
                "message": f"Failed to generate response: {str(e)}",
                "response": "I'm sorry, I encountered an error while processing your request. Please try again."
            }
    
    def _build_lead_context(self, lead_data: Dict[str, Any]) -> str:
        """Build context string from lead data"""
        context = f"""
Name: {lead_data.get('name', 'Unknown')}
Email: {lead_data.get('email', 'N/A')}
Phone: {lead_data.get('phone', 'N/A')}
Status: {lead_data.get('status', 'Unknown')}
Source: {lead_data.get('source', 'Unknown')}
Created: {lead_data.get('createdAt', 'Unknown')}
"""
        return context
    
    def _build_conversation_history(self, history: List[Dict[str, Any]]) -> str:
        """Build conversation history context"""
        if not history:
            return "No previous conversation history."
        
        history_text = ""
        for i, message in enumerate(history[-5:], 1):  # Last 5 messages
            sender = "User" if message.get('sender') == 'user' else "Assistant"
            content = message.get('content', '')
            history_text += f"{i}. {sender}: {content}\n"
        
        return history_text
    
    def analyze_lead(self, lead_data: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze lead and provide insights"""
        try:
            if not self.groq_client:
                return {
                    "success": False,
                    "insights": "LLM service not available"
                }
            
            lead_context = self._build_lead_context(lead_data)
            
            prompt = f"""Analyze this lead and provide actionable insights for the sales team.

LEAD DATA:
{lead_context}

Provide analysis in this JSON format:
{{
  "priority": "high/medium/low",
  "suggested_approach": "Brief description of how to approach this lead",
  "next_steps": ["step1", "step2", "step3"],
  "risk_factors": ["factor1", "factor2"],
  "opportunity_score": 0.85
}}"""

            completion = self.groq_client.chat.completions.create(
                messages=[
                    {"role": "system", "content": "You are a sales analyst. Provide data-driven insights about leads."},
                    {"role": "user", "content": prompt}
                ],
                model="llama-3.1-8b-instant",
                temperature=0.3,
                max_tokens=300
            )
            
            response = completion.choices[0].message.content.strip()
            
            try:
                insights = json.loads(response)
                return {
                    "success": True,
                    "insights": insights
                }
            except json.JSONDecodeError:
                return {
                    "success": False,
                    "insights": "Failed to parse analysis"
                }
                
        except Exception as e:
            logger.error(f"Lead analysis failed: {e}")
            return {
                "success": False,
                "insights": f"Analysis failed: {str(e)}"
            }

# Create global LLM service instance
llm_service = LLMService() 
