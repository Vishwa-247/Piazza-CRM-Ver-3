export interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: string;
  source: string;
  createdAt: Date;
}

export interface Message {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

export interface ChatResponse {
  success: boolean;
  message: string;
  response: string;
}

export interface LeadAnalysis {
  success: boolean;
  insights: {
    priority: string;
    suggested_approach: string;
    next_steps: string[];
    risk_factors: string[];
    opportunity_score: number;
  };
}

class LLMService {
  private backendUrl = "http://localhost:8000"; // Backend URL

  // Check if LLM service is available
  async checkStatus(): Promise<boolean> {
    try {
      const response = await fetch(`${this.backendUrl}/api/llm/status`);
      if (response.ok) {
        const result = await response.json();
        return result.available;
      }
      return false;
    } catch (error) {
      console.error('LLM status check failed:', error);
      return false;
    }
  }

  // Send message to LLM and get response
  async sendMessage(
    message: string, 
    lead: Lead, 
    conversationHistory: Message[] = []
  ): Promise<ChatResponse> {
    try {
      console.log('🤖 Sending message to LLM:', message);
      console.log('🤖 Lead:', lead.name);

      const response = await fetch(`${this.backendUrl}/api/llm/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: message,
          lead_data: {
            name: lead.name,
            email: lead.email,
            phone: lead.phone,
            status: lead.status,
            source: lead.source,
            createdAt: lead.createdAt.toISOString(),
          },
          conversation_history: conversationHistory.map(msg => ({
            sender: msg.sender,
            content: msg.content,
            timestamp: msg.timestamp.toISOString(),
          })),
        }),
      });

      if (response.ok) {
        const result = await response.json();
        console.log('✅ LLM response received:', result);
        return result;
      } else {
        const error = await response.json();
        console.error('❌ LLM chat failed:', error);
        return {
          success: false,
          message: error.detail || 'Failed to get LLM response',
          response: 'I apologize, but I encountered an error. Please try again.'
        };
      }
    } catch (error) {
      console.error('❌ LLM chat error:', error);
      return {
        success: false,
        message: 'Network error',
        response: 'I apologize, but I cannot connect to the AI service right now. Please check if the backend server is running.'
      };
    }
  }

  // Analyze lead with LLM
  async analyzeLead(lead: Lead): Promise<LeadAnalysis> {
    try {
      console.log('🔍 Analyzing lead with LLM:', lead.name);

      const response = await fetch(`${this.backendUrl}/api/llm/analyze-lead`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: lead.name,
          email: lead.email,
          phone: lead.phone,
          status: lead.status,
          source: lead.source,
          createdAt: lead.createdAt.toISOString(),
        }),
      });

      if (response.ok) {
        const result = await response.json();
        console.log('✅ LLM analysis received:', result);
        return result;
      } else {
        const error = await response.json();
        console.error('❌ LLM analysis failed:', error);
        return {
          success: false,
          insights: {
            priority: 'unknown',
            suggested_approach: 'Unable to analyze lead',
            next_steps: ['Contact lead directly'],
            risk_factors: ['Analysis unavailable'],
            opportunity_score: 0.5,
          }
        };
      }
    } catch (error) {
      console.error('❌ LLM analysis error:', error);
      return {
        success: false,
        insights: {
          priority: 'unknown',
          suggested_approach: 'Unable to analyze lead',
          next_steps: ['Contact lead directly'],
          risk_factors: ['Analysis unavailable'],
          opportunity_score: 0.5,
        }
      };
    }
  }

  // Generate quick response suggestions
  getQuickSuggestions(lead: Lead): string[] {
    return [
      `What's the best way to follow up with ${lead.name}?`,
      `Analyze ${lead.name}'s lead status and suggest next steps`,
      `What communication strategy should I use for ${lead.name}?`,
      `Tell me about ${lead.name}'s lead source and how to approach them`,
      `What are the key insights about ${lead.name}?`,
    ];
  }
}

export const llmService = new LLMService(); 
