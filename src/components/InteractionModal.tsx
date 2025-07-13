import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import {
  ChatResponse,
  LeadAnalysis,
  llmService,
  Message,
} from "@/services/llmService";
import {
  AlertCircle,
  Bot,
  Brain,
  Clock,
  FileText,
  Lightbulb,
  Send,
  Sparkles,
  User,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Lead } from "./Dashboard";

interface InteractionModalProps {
  lead: Lead | null;
  isOpen: boolean;
  onClose: () => void;
}

export const InteractionModal = ({
  lead,
  isOpen,
  onClose,
}: InteractionModalProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isLLMAvailable, setIsLLMAvailable] = useState(false);
  const [leadAnalysis, setLeadAnalysis] = useState<LeadAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (lead && isOpen) {
      // Check LLM availability
      checkLLMStatus();

      // Initialize with a welcome message
      const welcomeMessage: Message = {
        id: "1",
        content: `Hello! I'm here to help with ${lead.name}. How can I assist you?`,
        sender: "ai",
        timestamp: new Date(),
      };
      setMessages([welcomeMessage]);

      // Auto-analyze the lead
      analyzeLead();
    }
  }, [lead, isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const checkLLMStatus = async () => {
    try {
      const available = await llmService.checkStatus();
      setIsLLMAvailable(available);
      if (!available) {
        toast({
          title: "AI Service Unavailable",
          description:
            "The AI assistant is currently unavailable. You can still interact manually.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Failed to check LLM status:", error);
      setIsLLMAvailable(false);
    }
  };

  const analyzeLead = async () => {
    if (!lead) return;

    setIsAnalyzing(true);
    try {
      const analysis = await llmService.analyzeLead(lead);
      setLeadAnalysis(analysis);

      if (analysis.success) {
        // Add analysis message
        const analysisMessage: Message = {
          id: Date.now().toString(),
          content: `I've analyzed ${lead.name} for you:\n\n🎯 Priority: ${
            analysis.insights.priority
          }\n📊 Opportunity Score: ${(
            analysis.insights.opportunity_score * 100
          ).toFixed(0)}%\n💡 Approach: ${
            analysis.insights.suggested_approach
          }\n\nNext Steps:\n${analysis.insights.next_steps
            .map((step) => `• ${step}`)
            .join("\n")}`,
          sender: "ai",
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, analysisMessage]);
      }
    } catch (error) {
      console.error("Lead analysis failed:", error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !lead) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: newMessage,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setNewMessage("");
    setIsTyping(true);

    try {
      // Send to LLM
      const response: ChatResponse = await llmService.sendMessage(
        newMessage,
        lead,
        messages
      );

      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: response.response,
        sender: "ai",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiResponse]);

      if (!response.success) {
        toast({
          title: "AI Response Error",
          description: response.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Failed to get AI response:", error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content:
          "I apologize, but I encountered an error while processing your request. Please try again.",
        sender: "ai",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);

      toast({
        title: "Connection Error",
        description:
          "Failed to connect to AI service. Please check if the backend is running.",
        variant: "destructive",
      });
    } finally {
      setIsTyping(false);
    }
  };

  // Mock LLM responses for specific actions
  const handleMockAction = (action: string) => {
    if (!lead) return;

    let response = "";

    switch (action) {
      case "suggest-followup":
        response = `Email ${lead.name} at ${lead.email}.`;
        break;
      case "lead-details":
        response = `Name: ${lead.name}\nEmail: ${lead.email}\nPhone: ${lead.phone}\nStatus: ${lead.status}`;
        break;
      default:
        response = "Ask about follow-up or details.";
        break;
    }

    const aiResponse: Message = {
      id: Date.now().toString(),
      content: response,
      sender: "ai",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, aiResponse]);
  };

  const handleQuickSuggestion = (suggestion: string) => {
    setNewMessage(suggestion);
  };

  const clearChat = () => {
    if (!lead) return;

    const welcomeMessage: Message = {
      id: Date.now().toString(),
      content: `Chat cleared! How can I help with ${lead.name}?`,
      sender: "ai",
      timestamp: new Date(),
    };
    setMessages([welcomeMessage]);
  };

  if (!lead) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[700px] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">{lead.name}</h3>
                <p className="text-sm text-muted-foreground">{lead.email}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge
                className={
                  lead.status === "new" ? "badge-new" : "badge-contacted"
                }
              >
                {lead.status}
              </Badge>
              {isLLMAvailable && (
                <Badge
                  variant="secondary"
                  className="flex items-center space-x-1"
                >
                  <Brain className="h-3 w-3" />
                  <span>AI Ready</span>
                </Badge>
              )}
            </div>
          </DialogTitle>
        </DialogHeader>

        {/* LLM Status Alert */}
        {!isLLMAvailable && (
          <Alert className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              AI assistant is unavailable. Make sure the backend server is
              running and Groq API key is configured.
            </AlertDescription>
          </Alert>
        )}

        {/* All Action Buttons in One Line */}
        <div className="flex flex-wrap gap-2 flex-shrink-0 mb-4">
          <Button
            variant="outline"
            size="sm"
            onClick={analyzeLead}
            disabled={isAnalyzing}
            className="flex items-center space-x-2"
          >
            <Sparkles className="h-4 w-4" />
            <span>{isAnalyzing ? "Analyzing..." : "Analyze Lead"}</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={clearChat}
            className="flex items-center space-x-2"
          >
            <FileText className="h-4 w-4" />
            <span>Clear Chat</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => handleMockAction("suggest-followup")}
            className="flex items-center space-x-2"
          >
            <Lightbulb className="h-4 w-4" />
            <span>Suggest Follow-up</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => handleMockAction("lead-details")}
            className="flex items-center space-x-2"
          >
            <FileText className="h-4 w-4" />
            <span>Lead Details</span>
          </Button>
        </div>

        {/* Quick Suggestions */}
        <div className="flex flex-wrap gap-2 flex-shrink-0 mb-4">
          {llmService.getQuickSuggestions(lead).map((suggestion, index) => (
            <Button
              key={index}
              variant="ghost"
              size="sm"
              onClick={() => handleQuickSuggestion(suggestion)}
              className="text-xs"
            >
              {suggestion}
            </Button>
          ))}
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 pr-4">
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.sender === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    message.sender === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  <div className="flex items-start space-x-2">
                    {message.sender === "ai" && (
                      <Bot className="h-4 w-4 mt-0.5 text-primary" />
                    )}
                    <div className="flex-1">
                      <p className="text-sm whitespace-pre-line">
                        {message.content}
                      </p>
                      <div className="flex items-center mt-1 space-x-1">
                        <Clock className="h-3 w-3 opacity-50" />
                        <span className="text-xs opacity-50">
                          {message.timestamp.toLocaleTimeString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-muted rounded-lg p-3 max-w-[80%]">
                  <div className="flex items-center space-x-2">
                    <Bot className="h-4 w-4 text-primary" />
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                      <div className="w-2 h-2 bg-primary rounded-full animate-pulse delay-100"></div>
                      <div className="w-2 h-2 bg-primary rounded-full animate-pulse delay-200"></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Input */}
        <div className="flex space-x-2 flex-shrink-0 pt-4">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Ask me anything about this lead..."
            onKeyPress={(e) => e.key === "Enter" && sendMessage()}
            disabled={!isLLMAvailable}
          />
          <Button
            onClick={sendMessage}
            disabled={!newMessage.trim() || !isLLMAvailable}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
