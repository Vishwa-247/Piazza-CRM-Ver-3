// // import { useState, useRef, useEffect } from 'react';
// // import { Send, Bot, User, Clock, Lightbulb, FileText } from 'lucide-react';
// // import { Button } from '@/components/ui/button';
// // import { Input } from '@/components/ui/input';
// // import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
// // import { Badge } from '@/components/ui/badge';
// // import { ScrollArea } from '@/components/ui/scroll-area';
// // import { Lead } from './Dashboard';

// // interface Message {
// //   id: string;
// //   content: string;
// //   sender: 'user' | 'ai';
// //   timestamp: Date;
// // }

// // interface InteractionModalProps {
// //   lead: Lead | null;
// //   isOpen: boolean;
// //   onClose: () => void;
// // }

// // export const InteractionModal = ({ lead, isOpen, onClose }: InteractionModalProps) => {
// //   const [messages, setMessages] = useState<Message[]>([]);
// //   const [newMessage, setNewMessage] = useState('');
// //   const [isTyping, setIsTyping] = useState(false);
// //   const messagesEndRef = useRef<HTMLDivElement>(null);

// //   useEffect(() => {
// //     if (lead && isOpen) {
// //       // Initialize with a welcome message
// //       const welcomeMessage: Message = {
// //         id: '1',
// //         content: `Hello! I'm here to help you manage your interaction with ${lead.name}. How can I assist you today?`,
// //         sender: 'ai',
// //         timestamp: new Date(),
// //       };
// //       setMessages([welcomeMessage]);
// //     }
// //   }, [lead, isOpen]);

// //   useEffect(() => {
// //     messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
// //   }, [messages]);

// //   const sendMessage = async () => {
// //     if (!newMessage.trim() || !lead) return;

// //     const userMessage: Message = {
// //       id: Date.now().toString(),
// //       content: newMessage,
// //       sender: 'user',
// //       timestamp: new Date(),
// //     };

// //     setMessages(prev => [...prev, userMessage]);
// //     setNewMessage('');
// //     setIsTyping(true);

// //     // Simulate AI response
// //     setTimeout(() => {
// //       const aiResponse: Message = {
// //         id: (Date.now() + 1).toString(),
// //         content: generateAIResponse(newMessage, lead),
// //         sender: 'ai',
// //         timestamp: new Date(),
// //       };
// //       setMessages(prev => [...prev, aiResponse]);
// //       setIsTyping(false);
// //     }, 1500);
// //   };

// //   const generateAIResponse = (userInput: string, lead: Lead): string => {
// //     const responses = [
// //       `Based on ${lead.name}'s profile, I suggest reaching out via email first since they seem to prefer written communication.`,
// //       `I notice ${lead.name} is in the ${lead.status} status. Here are some next steps you could take...`,
// //       `For ${lead.name}, I recommend following up within 24-48 hours. Would you like me to draft a personalized message?`,
// //       `I can see that ${lead.name} came from ${lead.source}. This gives us insight into their interests and how to approach them.`,
// //       `Let me analyze ${lead.name}'s interaction history and suggest the best communication strategy.`,
// //     ];
// //     return responses[Math.floor(Math.random() * responses.length)];
// //   };

// //   const quickActions = [
// //     {
// //       label: 'Suggest Follow-up',
// //       icon: Lightbulb,
// //       action: () => {
// //         const suggestion: Message = {
// //           id: Date.now().toString(),
// //           content: `Based on ${lead?.name}'s profile and status, I recommend sending a personalized follow-up email focusing on their potential pain points. Would you like me to draft one?`,
// //           sender: 'ai',
// //           timestamp: new Date(),
// //         };
// //         setMessages(prev => [...prev, suggestion]);
// //       }
// //     },
// //     {
// //       label: 'Lead Details',
// //       icon: FileText,
// //       action: () => {
// //         if (!lead) return;
// //         const details: Message = {
// //           id: Date.now().toString(),
// //           content: `Here are the key details for ${lead.name}:\n• Email: ${lead.email}\n• Phone: ${lead.phone}\n• Status: ${lead.status}\n• Source: ${lead.source}\n• Created: ${lead.createdAt.toLocaleDateString()}`,
// //           sender: 'ai',
// //           timestamp: new Date(),
// //         };
// //         setMessages(prev => [...prev, details]);
// //       }
// //     }
// //   ];

// //   if (!lead) return null;

// //   return (
// //     <Dialog open={isOpen} onOpenChange={onClose}>
// //       <DialogContent className="max-w-2xl h-[600px] flex flex-col">
// //         <DialogHeader className="flex-shrink-0">
// //           <DialogTitle className="flex items-center justify-between">
// //             <div className="flex items-center space-x-3">
// //               <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
// //                 <User className="h-5 w-5 text-primary" />
// //               </div>
// //               <div>
// //                 <h3 className="font-semibold">{lead.name}</h3>
// //                 <p className="text-sm text-muted-foreground">{lead.email}</p>
// //               </div>
// //             </div>
// //             <Badge className={lead.status === 'new' ? 'badge-new' : lead.status === 'contacted' ? 'badge-contacted' : 'badge-converted'}>
// //               {lead.status}
// //             </Badge>
// //           </DialogTitle>
// //         </DialogHeader>

// //         {/* Quick Actions */}
// //         <div className="flex space-x-2 flex-shrink-0">
// //           {quickActions.map((action, index) => (
// //             <Button
// //               key={index}
// //               variant="outline"
// //               size="sm"
// //               onClick={action.action}
// //               className="flex items-center space-x-2"
// //             >
// //               <action.icon className="h-4 w-4" />
// //               <span>{action.label}</span>
// //             </Button>
// //           ))}
// //         </div>

// //         {/* Messages */}
// //         <ScrollArea className="flex-1 pr-4">
// //           <div className="space-y-4">
// //             {messages.map((message) => (
// //               <div
// //                 key={message.id}
// //                 className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
// //               >
// //                 <div
// //                   className={`max-w-[80%] rounded-lg p-3 ${
// //                     message.sender === 'user'
// //                       ? 'bg-primary text-primary-foreground'
// //                       : 'bg-muted text-muted-foreground'
// //                   }`}
// //                 >
// //                   <div className="flex items-start space-x-2">
// //                     {message.sender === 'ai' && (
// //                       <Bot className="h-4 w-4 mt-0.5 text-primary" />
// //                     )}
// //                     <div className="flex-1">
// //                       <p className="text-sm whitespace-pre-line">{message.content}</p>
// //                       <div className="flex items-center mt-1 space-x-1">
// //                         <Clock className="h-3 w-3 opacity-50" />
// //                         <span className="text-xs opacity-50">
// //                           {message.timestamp.toLocaleTimeString()}
// //                         </span>
// //                       </div>
// //                     </div>
// //                   </div>
// //                 </div>
// //               </div>
// //             ))}

// //             {/* Typing Indicator */}
// //             {isTyping && (
// //               <div className="flex justify-start">
// //                 <div className="bg-muted rounded-lg p-3 max-w-[80%]">
// //                   <div className="flex items-center space-x-2">
// //                     <Bot className="h-4 w-4 text-primary" />
// //                     <div className="flex space-x-1">
// //                       <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
// //                       <div className="w-2 h-2 bg-primary rounded-full animate-pulse delay-100"></div>
// //                       <div className="w-2 h-2 bg-primary rounded-full animate-pulse delay-200"></div>
// //                     </div>
// //                   </div>
// //                 </div>
// //               </div>
// //             )}
// //             <div ref={messagesEndRef} />
// //           </div>
// //         </ScrollArea>

// //         {/* Message Input */}
// //         <div className="flex space-x-2 flex-shrink-0">
// //           <Input
// //             value={newMessage}
// //             onChange={(e) => setNewMessage(e.target.value)}
// //             placeholder="Type your message..."
// //             onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
// //             className="flex-1"
// //           />
// //           <Button onClick={sendMessage} className="btn-brand">
// //             <Send className="h-4 w-4" />
// //           </Button>
// //         </div>
// //       </DialogContent>
// //     </Dialog>
// //   );
// // };


// import { useState, useRef, useEffect } from "react";
// import {
//   Send,
//   Bot,
//   User,
//   Clock,
//   Lightbulb,
//   FileText,
//   Mail,
// } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
// } from "@/components/ui/dialog";
// import { Badge } from "@/components/ui/badge";
// import { ScrollArea } from "@/components/ui/scroll-area";
// import { Lead } from "./Dashboard";

// interface Message {
//   id: string;
//   content: string;
//   sender: "user" | "ai";
//   timestamp: Date;
// }

// interface InteractionModalProps {
//   lead: Lead | null;
//   isOpen: boolean;
//   onClose: () => void;
// }

// export const InteractionModal = ({
//   lead,
//   isOpen,
//   onClose,
// }: InteractionModalProps) => {
//   const [messages, setMessages] = useState<Message[]>([]);
//   const [newMessage, setNewMessage] = useState("");
//   const [isTyping, setIsTyping] = useState(false);
//   const messagesEndRef = useRef<HTMLDivElement>(null);

//   useEffect(() => {
//     if (lead && isOpen) {
//       // Initialize with a welcome message
//       const welcomeMessage: Message = {
//         id: "1",
//         content: `Hello! I'm here to help you manage your interaction with ${lead.name}. How can I assist you today?`,
//         sender: "ai",
//         timestamp: new Date(),
//       };
//       setMessages([welcomeMessage]);
//     }
//   }, [lead, isOpen]);

//   useEffect(() => {
//     messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
//   }, [messages]);

//   const getSimpleMockResponse = (userMessage: string, lead: Lead): string => {
//     const message = userMessage.toLowerCase();

//     if (message.includes("follow") || message.includes("suggest")) {
//       return `Email ${lead.name} at ${lead.email}.`;
//     }

//     if (message.includes("detail") || message.includes("info")) {
//       return `Name: ${lead.name}, Email: ${lead.email}, Status: ${lead.status}.`;
//     }

//     return "Ask about follow-up or details.";
//   };

//   const sendMessage = async () => {
//     if (!newMessage.trim() || !lead) return;

//     const userMessage: Message = {
//       id: Date.now().toString(),
//       content: newMessage,
//       sender: "user",
//       timestamp: new Date(),
//     };

//     setMessages((prev) => [...prev, userMessage]);
//     setNewMessage("");
//     setIsTyping(true);

//     // Simulate AI response with simplified logic
//     setTimeout(() => {
//       const aiResponse: Message = {
//         id: (Date.now() + 1).toString(),
//         content: getSimpleMockResponse(newMessage, lead),
//         sender: "ai",
//         timestamp: new Date(),
//       };
//       setMessages((prev) => [...prev, aiResponse]);
//       setIsTyping(false);
//     }, 1000);
//   };

//   const openEmailClient = () => {
//     if (lead?.email) {
//       const subject = encodeURIComponent(`Follow-up with ${lead.name}`);
//       const body = encodeURIComponent(
//         `Hi ${lead.name},\n\nI wanted to follow up on our recent conversation.\n\nBest regards`
//       );
//       window.open(`mailto:${lead.email}?subject=${subject}&body=${body}`);
//     }
//   };

//   const quickActions = [
//     {
//       label: "Suggest Follow-up",
//       icon: Lightbulb,
//       action: () => {
//         const suggestion: Message = {
//           id: Date.now().toString(),
//           content: `Email ${lead?.name} at ${lead?.email}.`,
//           sender: "ai",
//           timestamp: new Date(),
//         };
//         setMessages((prev) => [...prev, suggestion]);
//       },
//     },
//     {
//       label: "Lead Details",
//       icon: FileText,
//       action: () => {
//         if (!lead) return;
//         const details: Message = {
//           id: Date.now().toString(),
//           content: `Name: ${lead.name}, Email: ${lead.email}, Status: ${lead.status}.`,
//           sender: "ai",
//           timestamp: new Date(),
//         };
//         setMessages((prev) => [...prev, details]);
//       },
//     },
//     {
//       label: "Open Email",
//       icon: Mail,
//       action: openEmailClient,
//     },
//   ];

//   if (!lead) return null;

//   return (
//     <Dialog open={isOpen} onOpenChange={onClose}>
//       <DialogContent className="max-w-2xl h-[600px] flex flex-col">
//         <DialogHeader className="flex-shrink-0">
//           <DialogTitle className="flex items-center justify-between">
//             <div className="flex items-center space-x-3">
//               <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
//                 <User className="h-5 w-5 text-primary" />
//               </div>
//               <div>
//                 <h3 className="font-semibold">{lead.name}</h3>
//                 <p className="text-sm text-muted-foreground">{lead.email}</p>
//               </div>
//             </div>
//             <div className="flex items-center space-x-2">
//               <Button
//                 variant="outline"
//                 size="sm"
//                 onClick={openEmailClient}
//                 className="flex items-center space-x-2"
//               >
//                 <Mail className="h-4 w-4" />
//                 <span>Email</span>
//               </Button>
//               <Badge
//                 className={
//                   lead.status === "new"
//                     ? "badge-new"
//                     : lead.status === "contacted"
//                     ? "badge-contacted"
//                     : "badge-converted"
//                 }
//               >
//                 {lead.status}
//               </Badge>
//             </div>
//           </DialogTitle>
//         </DialogHeader>

//         {/* Quick Actions */}
//         <div className="flex space-x-2 flex-shrink-0">
//           {quickActions.map((action, index) => (
//             <Button
//               key={index}
//               variant="outline"
//               size="sm"
//               onClick={action.action}
//               className="flex items-center space-x-2"
//             >
//               <action.icon className="h-4 w-4" />
//               <span>{action.label}</span>
//             </Button>
//           ))}
//         </div>

//         {/* Messages */}
//         <ScrollArea className="flex-1 pr-4">
//           <div className="space-y-4">
//             {messages.map((message) => (
//               <div
//                 key={message.id}
//                 className={`flex ${
//                   message.sender === "user" ? "justify-end" : "justify-start"
//                 }`}
//               >
//                 <div
//                   className={`max-w-[80%] rounded-lg p-3 ${
//                     message.sender === "user"
//                       ? "bg-primary text-primary-foreground"
//                       : "bg-muted text-muted-foreground"
//                   }`}
//                 >
//                   <div className="flex items-start space-x-2">
//                     {message.sender === "ai" && (
//                       <Bot className="h-4 w-4 mt-0.5 text-primary" />
//                     )}
//                     <div className="flex-1">
//                       <p className="text-sm whitespace-pre-line">
//                         {message.content}
//                       </p>
//                       <div className="flex items-center mt-1 space-x-1">
//                         <Clock className="h-3 w-3 opacity-50" />
//                         <span className="text-xs opacity-50">
//                           {message.timestamp.toLocaleTimeString()}
//                         </span>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             ))}

//             {/* Typing Indicator */}
//             {isTyping && (
//               <div className="flex justify-start">
//                 <div className="bg-muted rounded-lg p-3 max-w-[80%]">
//                   <div className="flex items-center space-x-2">
//                     <Bot className="h-4 w-4 text-primary" />
//                     <div className="flex space-x-1">
//                       <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
//                       <div className="w-2 h-2 bg-primary rounded-full animate-pulse delay-100"></div>
//                       <div className="w-2 h-2 bg-primary rounded-full animate-pulse delay-200"></div>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             )}
//             <div ref={messagesEndRef} />
//           </div>
//         </ScrollArea>

//         {/* Message Input */}
//         <div className="flex space-x-2 flex-shrink-0">
//           <Input
//             value={newMessage}
//             onChange={(e) => setNewMessage(e.target.value)}
//             placeholder="Type your message..."
//             onKeyPress={(e) => e.key === "Enter" && sendMessage()}
//             className="flex-1"
//           />
//           <Button onClick={sendMessage} className="btn-brand">
//             <Send className="h-4 w-4" />
//           </Button>
//         </div>
//       </DialogContent>
//     </Dialog>
//   );
// };


import { useState, useRef, useEffect } from "react";
import {
  Send,
  Bot,
  User,
  Clock,
  Lightbulb,
  FileText,
  Mail,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Lead } from "./Dashboard";

interface Message {
  id: string;
  content: string;
  sender: "user" | "ai";
  timestamp: Date;
}

interface InteractionModalProps {
  lead: Lead | null;
  isOpen: boolean;
  onClose: () => void;
}

const CHAT_STORAGE_KEY = "crm-chat-history";

export const InteractionModal = ({
  lead,
  isOpen,
  onClose,
}: InteractionModalProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load chat history when modal opens
  useEffect(() => {
    if (lead && isOpen) {
      const savedChats = localStorage.getItem(CHAT_STORAGE_KEY);
      const chatHistory = savedChats ? JSON.parse(savedChats) : {};

      if (chatHistory[lead.id]) {
        // Restore previous chat
        const restoredMessages = chatHistory[lead.id].map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp),
        }));
        setMessages(restoredMessages);
      } else {
        // Initialize with welcome message
        const welcomeMessage: Message = {
          id: "1",
          content: `Hello! I'm here to help you manage your interaction with ${lead.name}. How can I assist you today?`,
          sender: "ai",
          timestamp: new Date(),
        };
        setMessages([welcomeMessage]);
      }
    }
  }, [lead, isOpen]);

  // Save chat history whenever messages change
  useEffect(() => {
    if (lead && messages.length > 0) {
      const savedChats = localStorage.getItem(CHAT_STORAGE_KEY);
      const chatHistory = savedChats ? JSON.parse(savedChats) : {};
      chatHistory[lead.id] = messages;
      localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(chatHistory));
    }
  }, [messages, lead]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const getDetailedLeadInfo = (lead: Lead): string => {
    const createdDate = new Date(lead.createdAt).toLocaleString();
    return `Here are the key details for ${lead.name}:
• Email: ${lead.email}
• Phone: ${lead.phone}
• Status: ${lead.status}
• Source: ${lead.source}
• Created: ${createdDate}`;
  };

  const getSimpleMockResponse = (userMessage: string, lead: Lead): string => {
    const message = userMessage.toLowerCase();

    if (message.includes("follow") || message.includes("suggest")) {
      return `Email ${lead.name} at ${lead.email}.`;
    }

    if (message.includes("detail") || message.includes("info")) {
      return getDetailedLeadInfo(lead);
    }

    return "Ask about follow-up or details.";
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

    // Simulate AI response with improved logic
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: getSimpleMockResponse(newMessage, lead),
        sender: "ai",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiResponse]);
      setIsTyping(false);
    }, 1000);
  };

  const openEmailClient = () => {
    if (lead?.email) {
      const subject = encodeURIComponent(`Follow-up with ${lead.name}`);
      const body = encodeURIComponent(
        `Hi ${lead.name},\n\nI wanted to follow up on our recent conversation.\n\nBest regards`
      );
      window.open(`mailto:${lead.email}?subject=${subject}&body=${body}`);
    }
  };

  const clearChat = () => {
    if (lead) {
      const savedChats = localStorage.getItem(CHAT_STORAGE_KEY);
      const chatHistory = savedChats ? JSON.parse(savedChats) : {};
      delete chatHistory[lead.id];
      localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(chatHistory));

      // Reset to welcome message
      const welcomeMessage: Message = {
        id: "1",
        content: `Hello! I'm here to help you manage your interaction with ${lead.name}. How can I assist you today?`,
        sender: "ai",
        timestamp: new Date(),
      };
      setMessages([welcomeMessage]);
    }
  };

  const quickActions = [
    {
      label: "Suggest Follow-up",
      icon: Lightbulb,
      action: () => {
        const suggestion: Message = {
          id: Date.now().toString(),
          content: `Email ${lead?.name} at ${lead?.email}.`,
          sender: "ai",
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, suggestion]);
      },
    },
    {
      label: "Lead Details",
      icon: FileText,
      action: () => {
        if (!lead) return;
        const details: Message = {
          id: Date.now().toString(),
          content: getDetailedLeadInfo(lead),
          sender: "ai",
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, details]);
      },
    },
    {
      label: "Open Email",
      icon: Mail,
      action: openEmailClient,
    },
    {
      label: "Clear Chat",
      icon: Trash2,
      action: clearChat,
    },
  ];

  if (!lead) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl h-[600px] flex flex-col">
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
              <Button
                variant="outline"
                size="sm"
                onClick={openEmailClient}
                className="flex items-center space-x-2"
              >
                <Mail className="h-4 w-4" />
                <span>Email</span>
              </Button>
              <Badge
                className={
                  lead.status === "new"
                    ? "badge-new"
                    : lead.status === "contacted"
                    ? "badge-contacted"
                    : "badge-converted"
                }
              >
                {lead.status}
              </Badge>
            </div>
          </DialogTitle>
        </DialogHeader>

        {/* Quick Actions */}
        <div className="flex space-x-2 flex-shrink-0 flex-wrap">
          {quickActions.map((action, index) => (
            <Button
              key={index}
              variant="outline"
              size="sm"
              onClick={action.action}
              className="flex items-center space-x-2 mb-2"
            >
              <action.icon className="h-4 w-4" />
              <span>{action.label}</span>
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

        {/* Message Input */}
        <div className="flex space-x-2 flex-shrink-0">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            onKeyPress={(e) => e.key === "Enter" && sendMessage()}
            className="flex-1"
          />
          <Button onClick={sendMessage} className="btn-brand">
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
