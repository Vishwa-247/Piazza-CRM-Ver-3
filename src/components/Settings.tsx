
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/hooks/use-toast";
import { EmailConfig, emailService } from "@/services/emailService";
import { Mail, Save, TestTube } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

interface EmailFormData {
  serviceId: string;
  templateId: string;
  publicKey: string;
  fromName: string;
  fromEmail: string;
}

export const Settings = () => {
  const [isTestingEmail, setIsTestingEmail] = useState(false);
  const [emailConfigured, setEmailConfigured] = useState(false);

  const {
    register: registerEmail,
    handleSubmit: handleEmailSubmit,
    formState: { errors: emailErrors },
    setValue: setEmailValue,
    reset: resetEmailForm,
  } = useForm<EmailFormData>();

  useEffect(() => {
    // Check if email is configured on component mount
    setEmailConfigured(emailService.isConfigured());

    // Load existing configuration if available
    const config = emailService.getConfig();
    if (config) {
      setEmailValue("serviceId", config.serviceId);
      setEmailValue("templateId", config.templateId);
      setEmailValue("publicKey", config.publicKey);
      setEmailValue("fromName", config.fromName);
      setEmailValue("fromEmail", config.fromEmail);
    }
  }, [setEmailValue]);

  const onEmailConfigSubmit = async (data: EmailFormData) => {
    try {
      const config: EmailConfig = {
        serviceId: data.serviceId,
        templateId: data.templateId,
        publicKey: data.publicKey,
        fromName: data.fromName,
        fromEmail: data.fromEmail,
      };

      emailService.saveConfig(config);
      setEmailConfigured(true);

      toast({
        title: "✅ Email Configuration Saved",
        description: "Your email settings have been saved successfully.",
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: "❌ Configuration Failed",
        description: "Failed to save email configuration. Please try again.",
        variant: "destructive",
      });
    }
  };

  const testEmailConfiguration = async () => {
    setIsTestingEmail(true);
    try {
      const success = await emailService.testConfiguration();
      if (success) {
        toast({
          title: "✅ Email Test Successful",
          description: "Test email sent successfully! Check your inbox.",
          duration: 4000,
        });
      } else {
        toast({
          title: "❌ Email Test Failed",
          description:
            "Failed to send test email. Please check your configuration.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "❌ Email Test Failed",
        description: "An error occurred while testing email configuration.",
        variant: "destructive",
      });
    } finally {
      setIsTestingEmail(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Email Settings</h1>
          <p className="text-muted-foreground mt-2">
            Configure email sending for your workflows.
          </p>
        </div>
        <div className="flex items-center justify-center w-12 h-12 bg-primary/10 rounded-full">
          <Mail className="h-6 w-6 text-primary" />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Email Configuration
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Configure EmailJS to send real emails from your workflows.
            {emailConfigured ? (
              <span className="text-green-600 font-medium">
                {" "}
                ✅ Email is configured and ready!
              </span>
            ) : (
              <span className="text-orange-600 font-medium">
                {" "}
                ⚠️ Email not configured - workflows will only simulate
                sending.
              </span>
            )}
          </p>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={handleEmailSubmit(onEmailConfigSubmit)}
            className="space-y-4"
          >
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="serviceId">EmailJS Service ID</Label>
                <Input
                  id="serviceId"
                  placeholder="service_xxxxxxx"
                  {...registerEmail("serviceId", {
                    required: "Service ID is required",
                  })}
                />
                {emailErrors.serviceId && (
                  <p className="text-sm text-destructive">
                    {emailErrors.serviceId.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="templateId">EmailJS Template ID</Label>
                <Input
                  id="templateId"
                  placeholder="template_xxxxxxx"
                  {...registerEmail("templateId", {
                    required: "Template ID is required",
                  })}
                />
                {emailErrors.templateId && (
                  <p className="text-sm text-destructive">
                    {emailErrors.templateId.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="publicKey">EmailJS Public Key</Label>
                <Input
                  id="publicKey"
                  placeholder="Your public key"
                  {...registerEmail("publicKey", {
                    required: "Public key is required",
                  })}
                />
                {emailErrors.publicKey && (
                  <p className="text-sm text-destructive">
                    {emailErrors.publicKey.message}
                  </p>
                )}
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fromName">From Name</Label>
                  <Input
                    id="fromName"
                    placeholder="Your CRM System"
                    {...registerEmail("fromName", {
                      required: "From name is required",
                    })}
                  />
                  {emailErrors.fromName && (
                    <p className="text-sm text-destructive">
                      {emailErrors.fromName.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fromEmail">From Email</Label>
                  <Input
                    id="fromEmail"
                    type="email"
                    placeholder="your@email.com"
                    {...registerEmail("fromEmail", {
                      required: "From email is required",
                      pattern: {
                        value: /^\S+@\S+$/i,
                        message: "Invalid email address",
                      },
                    })}
                  />
                  {emailErrors.fromEmail && (
                    <p className="text-sm text-destructive">
                      {emailErrors.fromEmail.message}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button type="submit" className="flex-1">
                <Save className="mr-2 h-4 w-4" />
                Save Email Configuration
              </Button>

              {emailConfigured && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={testEmailConfiguration}
                  disabled={isTestingEmail}
                >
                  {isTestingEmail ? (
                    <>
                      <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      Testing...
                    </>
                  ) : (
                    <>
                      <TestTube className="mr-2 h-4 w-4" />
                      Test Email
                    </>
                  )}
                </Button>
              )}
            </div>
          </form>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">
              📧 How to Set Up EmailJS:
            </h4>
            <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
              <li>
                Go to{" "}
                <a
                  href="https://emailjs.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline"
                >
                  emailjs.com
                </a>{" "}
                and create a free account
              </li>
              <li>Create a new service (Gmail, Outlook, etc.)</li>
              <li>
                Create an email template with variables: to_email, to_name,
                subject, message, from_name, from_email
              </li>
              <li>
                Copy your Service ID, Template ID, and Public Key here
              </li>
              <li>Test the configuration to ensure emails are working</li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
