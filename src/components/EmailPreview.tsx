import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { EmailPreview as EmailPreviewType, workflowService } from "@/services/workflowService";
import { Calendar, Eye, Mail, User } from "lucide-react";
import { useEffect, useState } from "react";

export const EmailPreview = () => {
  const [emailPreviews, setEmailPreviews] = useState<EmailPreviewType[]>([]);
  const [selectedEmail, setSelectedEmail] = useState<EmailPreviewType | null>(null);

  useEffect(() => {
    const updatePreviews = () => {
      setEmailPreviews(workflowService.getEmailPreviews());
    };

    updatePreviews();
    
    // Listen for workflow completions to update previews
    const handleWorkflowCompleted = () => {
      updatePreviews();
    };

    window.addEventListener("workflowCompleted", handleWorkflowCompleted);
    return () => window.removeEventListener("workflowCompleted", handleWorkflowCompleted);
  }, []);

  const formatEmailContent = (email: EmailPreviewType) => {
    return {
      subject: email.subject,
      body: email.body,
      recipient: email.to,
      template: email.template,
      timestamp: email.timestamp
    };
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            📧 Email Preview System
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground space-y-2">
            <p>
              • <strong>Real Email Templates:</strong> See exactly what emails will be sent
            </p>
            <p>
              • <strong>Dynamic Content:</strong> Personalized with lead information
            </p>
            <p>
              • <strong>Professional Format:</strong> Business-ready email templates
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Generated Email Previews</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px]">
            {emailPreviews.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                <Mail className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                <p>No email previews yet</p>
                <p className="text-xs">Execute a workflow with email actions to see previews</p>
              </div>
            ) : (
              <div className="space-y-4">
                {emailPreviews.map((email, index) => (
                  <div
                    key={index}
                    className="border rounded-lg p-4 hover:shadow-lg transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-lg truncate">
                          {email.subject}
                        </h3>
                        <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {email.to}
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {email.timestamp.toLocaleString()}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                          {email.template}
                        </Badge>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => setSelectedEmail(email)}
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              Preview
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>Email Preview</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              {/* Email Header */}
                              <div className="border-b pb-4">
                                <div className="grid grid-cols-1 gap-2 text-sm">
                                  <div>
                                    <strong>To:</strong> {email.to}
                                  </div>
                                  <div>
                                    <strong>Subject:</strong> {email.subject}
                                  </div>
                                  <div>
                                    <strong>Template:</strong> {email.template}
                                  </div>
                                  <div>
                                    <strong>Generated:</strong> {email.timestamp.toLocaleString()}
                                  </div>
                                </div>
                              </div>

                              {/* Email Body */}
                              <div className="bg-gray-50 rounded-lg p-4">
                                <div className="bg-white rounded border p-6 font-mono text-sm">
                                  <pre className="whitespace-pre-wrap font-sans">
                                    {email.body}
                                  </pre>
                                </div>
                              </div>

                              {/* Action Buttons */}
                              <div className="flex justify-end gap-2 pt-4">
                                <Button
                                  variant="outline"
                                  onClick={() => {
                                    const mailtoLink = `mailto:${email.to}?subject=${encodeURIComponent(
                                      email.subject
                                    )}&body=${encodeURIComponent(email.body)}`;
                                    window.open(mailtoLink, '_blank');
                                  }}
                                >
                                  <Mail className="h-4 w-4 mr-2" />
                                  Open in Email Client
                                </Button>
                                <Button
                                  variant="outline"
                                  onClick={() => {
                                    navigator.clipboard.writeText(
                                      `Subject: ${email.subject}\n\n${email.body}`
                                    );
                                  }}
                                >
                                  Copy Email Content
                                </Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>

                    {/* Email Preview Snippet */}
                    <div className="text-sm text-muted-foreground bg-gray-50 rounded p-3">
                      <p className="line-clamp-2">
                        {email.body.split('\n')[0]}...
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Email Template Examples */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">📝 Available Email Templates</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border rounded-lg p-4">
              <h4 className="font-medium mb-2">Welcome Email</h4>
              <p className="text-sm text-muted-foreground mb-3">
                Sent automatically when a new lead is created
              </p>
              <div className="bg-gray-50 rounded p-3 text-xs">
                <strong>Subject:</strong> Welcome to Our CRM, {"{name}"}!<br/>
                <strong>Content:</strong> Professional welcome message with next steps and contact information
              </div>
            </div>

            <div className="border rounded-lg p-4">
              <h4 className="font-medium mb-2">Follow-up Email</h4>
              <p className="text-sm text-muted-foreground mb-3">
                Sent as part of scheduled follow-up workflows
              </p>
              <div className="bg-gray-50 rounded p-3 text-xs">
                <strong>Subject:</strong> Following up on your inquiry<br/>
                <strong>Content:</strong> Personalized follow-up with specific next steps
              </div>
            </div>

            <div className="border rounded-lg p-4">
              <h4 className="font-medium mb-2">Meeting Confirmation</h4>
              <p className="text-sm text-muted-foreground mb-3">
                Sent when calendar events are created
              </p>
              <div className="bg-gray-50 rounded p-3 text-xs">
                <strong>Subject:</strong> Meeting Confirmed - {"{date}"}<br/>
                <strong>Content:</strong> Meeting details with calendar link
              </div>
            </div>

            <div className="border rounded-lg p-4">
              <h4 className="font-medium mb-2">Status Update</h4>
              <p className="text-sm text-muted-foreground mb-3">
                Sent when lead status changes
              </p>
              <div className="bg-gray-50 rounded p-3 text-xs">
                <strong>Subject:</strong> Update on your application<br/>
                <strong>Content:</strong> Status change notification with next steps
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}; 
