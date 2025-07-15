
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { backendEmailService } from "@/services/backendEmailService";
import { Eye, EyeOff, Mail, Save, TestTube } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

interface EmailFormData {
  email: string;
  password: string;
  name: string;
}

export const Settings = () => {
  const [isTestingEmail, setIsTestingEmail] = useState(false);
  const [emailConfigured, setEmailConfigured] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register: registerEmail,
    handleSubmit: handleEmailSubmit,
    formState: { errors: emailErrors },
    setValue: setEmailValue,
    reset: resetEmailForm,
  } = useForm<EmailFormData>();

  useEffect(() => {
    // Check if email is configured on component mount
    setEmailConfigured(backendEmailService.isConfigured());

    // Load existing configuration if available
    const config = backendEmailService.getConfig();
    if (config) {
      setEmailValue("email", config.email);
      setEmailValue("password", config.password);
      setEmailValue("name", config.name);
    }
  }, [setEmailValue]);

  const onEmailConfigSubmit = async (data: EmailFormData) => {
    try {
      const success = await backendEmailService.configureEmail({
        email: data.email,
        password: data.password,
        name: data.name,
      });

      if (success) {
        setEmailConfigured(true);
        toast({
          title: "✅ Email Configuration Saved",
          description: "Your SMTP email settings have been saved successfully.",
          duration: 3000,
        });
      } else {
        toast({
          title: "❌ Configuration Failed",
          description:
            "Failed to save email configuration. Please check your credentials.",
          variant: "destructive",
        });
      }
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
      console.log("🧪 Testing backend email configuration...");
      console.log("🧪 Current config:", backendEmailService.getConfig());
      console.log("🧪 Is configured:", backendEmailService.isConfigured());

      const success = await backendEmailService.testConfiguration();
      if (success) {
        toast({
          title: "✅ Email Test Successful",
          description:
            "SMTP connection test successful! Your email is configured correctly.",
          duration: 4000,
        });
      } else {
        toast({
          title: "❌ Email Test Failed",
          description:
            "Failed to test email connection. Please check your credentials and ensure the backend is running.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("🧪 Email test error:", error);
      toast({
        title: "❌ Email Test Failed",
        description: `An error occurred while testing email configuration: ${error}`,
        variant: "destructive",
      });
    } finally {
      setIsTestingEmail(false);
    }
  };

  const debugEmailConfig = () => {
    const config = backendEmailService.getConfig();
    console.log("🔍 Backend Email Configuration Debug:");
    console.log("Config:", config);
    console.log("Is Configured:", backendEmailService.isConfigured());
    console.log(
      "LocalStorage:",
      localStorage.getItem("crm-backend-email-config")
    );

    toast({
      title: "🔍 Debug Info",
      description:
        "Check browser console for detailed email configuration info",
      duration: 3000,
    });
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Email Settings</h1>
          <p className="text-muted-foreground mt-2">
            Configure SMTP email sending for your workflows.
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
            SMTP Email Configuration
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Configure SMTP to send real emails from your workflows.
            {emailConfigured ? (
              <span className="text-green-600 font-medium">
                {" "}
                ✅ Email is configured and ready!
              </span>
            ) : (
              <span className="text-orange-600 font-medium">
                {" "}
                ⚠️ Email not configured - workflows will only simulate sending.
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
                <Label htmlFor="email">Gmail Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@gmail.com"
                  {...registerEmail("email", {
                    required: "Email is required",
                    pattern: {
                      value: /^\S+@\S+$/i,
                      message: "Invalid email address",
                    },
                  })}
                />
                {emailErrors.email && (
                  <p className="text-sm text-destructive">
                    {emailErrors.email.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">App Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Your Gmail app password"
                    {...registerEmail("password", {
                      required: "App password is required",
                    })}
                  />
                  <button
                    type="button"
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    tabIndex={-1}
                    onClick={() => setShowPassword((v) => !v)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
                {emailErrors.password && (
                  <p className="text-sm text-destructive">
                    {emailErrors.password.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">From Name</Label>
                <Input
                  id="name"
                  placeholder="Piazza CRM"
                  {...registerEmail("name", {
                    required: "From name is required",
                  })}
                />
                {emailErrors.name && (
                  <p className="text-sm text-destructive">
                    {emailErrors.name.message}
                  </p>
                )}
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
                      Test Connection
                    </>
                  )}
                </Button>
              )}

              <Button
                type="button"
                variant="outline"
                onClick={debugEmailConfig}
              >
                🔍 Debug
              </Button>
            </div>
          </form>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">
              📧 How to Set Up Gmail SMTP:
            </h4>
            <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
              <li>
                Go to your{" "}
                <a
                  href="https://myaccount.google.com/security"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline"
                >
                  Google Account settings
                </a>
              </li>
              <li>Enable 2-Step Verification if not already enabled</li>
              <li>
                Go to{" "}
                <a
                  href="https://myaccount.google.com/apppasswords"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline"
                >
                  App passwords
                </a>{" "}
                and generate a new app password
              </li>
              <li>Select "Mail" as the app and "Other" as the device</li>
              <li>
                Copy the 16-character app password (not your regular Gmail
                password)
              </li>
              <li>
                Use your Gmail address and the generated app password here
              </li>
              <li>Make sure the backend server is running on port 8000</li>
              <li>Test the connection to ensure emails are working</li>
            </ol>

            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
              <h5 className="font-medium text-yellow-800 mb-1">
                ⚠️ Important:
              </h5>
              <ul className="text-sm text-yellow-700 space-y-1">
                <li>• Use an App Password, NOT your regular Gmail password</li>
                <li>• The app password is 16 characters long</li>
                <li>• 2-Step Verification must be enabled first</li>
                <li>• Backend server must be running on localhost:8000</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
