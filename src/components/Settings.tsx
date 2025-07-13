
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import { EmailConfig, emailService } from "@/services/emailService";
import {
  Bell,
  Database,
  Download,
  Eye,
  EyeOff,
  Mail,
  Moon,
  Palette,
  Save,
  Shield,
  Sun,
  TestTube,
  Upload,
  User,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

interface ProfileFormData {
  name: string;
  email: string;
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface EmailFormData {
  serviceId: string;
  templateId: string;
  publicKey: string;
  fromName: string;
  fromEmail: string;
}

export const Settings = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [notifications, setNotifications] = useState({
    email: true,
    browser: false,
    marketing: false,
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [isTestingEmail, setIsTestingEmail] = useState(false);
  const [emailConfigured, setEmailConfigured] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<ProfileFormData>({
    defaultValues: {
      name: "John Doe",
      email: "john@company.com",
    },
  });

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

  const onProfileSubmit = (data: ProfileFormData) => {
    // Handle profile update
    toast({
      title: "Profile Updated",
      description: "Your profile has been updated successfully.",
    });
  };

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

  const handleExportData = () => {
    // Handle data export
    toast({
      title: "Data Export Started",
      description: "Your data export will begin shortly.",
    });
  };

  const handleNotificationChange = (
    type: keyof typeof notifications,
    checked: boolean
  ) => {
    setNotifications((prev) => ({ ...prev, [type]: checked }));
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground mt-2">
          Manage your account settings and preferences.
        </p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="email" className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            Email
          </TabsTrigger>
          <TabsTrigger
            value="notifications"
            className="flex items-center gap-2"
          >
            <Bell className="h-4 w-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="appearance" className="flex items-center gap-2">
            <Palette className="h-4 w-4" />
            Appearance
          </TabsTrigger>
          <TabsTrigger value="data" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            Data
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Security
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center space-x-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src="/placeholder-avatar.jpg" alt="Profile" />
                  <AvatarFallback className="bg-primary text-primary-foreground text-xl">
                    JD
                  </AvatarFallback>
                </Avatar>
                <div>
                  <Button variant="outline" size="sm">
                    Change Photo
                  </Button>
                  <p className="text-sm text-muted-foreground mt-1">
                    JPG, PNG up to 5MB
                  </p>
                </div>
              </div>

              <form
                onSubmit={handleSubmit(onProfileSubmit)}
                className="space-y-4"
              >
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      {...register("name", { required: "Name is required" })}
                    />
                    {errors.name && (
                      <p className="text-sm text-destructive">
                        {errors.name.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      {...register("email", {
                        required: "Email is required",
                        pattern: {
                          value: /^\S+@\S+$/i,
                          message: "Invalid email address",
                        },
                      })}
                    />
                    {errors.email && (
                      <p className="text-sm text-destructive">
                        {errors.email.message}
                      </p>
                    )}
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Change Password</h3>
                  <div className="grid grid-cols-1 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="currentPassword">Current Password</Label>
                      <div className="relative">
                        <Input
                          id="currentPassword"
                          type={showCurrentPassword ? "text" : "password"}
                          {...register("currentPassword")}
                          className="pr-10"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() =>
                            setShowCurrentPassword(!showCurrentPassword)
                          }
                        >
                          {showCurrentPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="newPassword">New Password</Label>
                        <div className="relative">
                          <Input
                            id="newPassword"
                            type={showNewPassword ? "text" : "password"}
                            {...register("newPassword", {
                              minLength: {
                                value: 6,
                                message:
                                  "Password must be at least 6 characters",
                              },
                            })}
                            className="pr-10"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                          >
                            {showNewPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                        {errors.newPassword && (
                          <p className="text-sm text-destructive">
                            {errors.newPassword.message}
                          </p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="confirmPassword">
                          Confirm Password
                        </Label>
                        <Input
                          id="confirmPassword"
                          type="password"
                          {...register("confirmPassword", {
                            validate: (value) => {
                              const newPassword = watch("newPassword");
                              return (
                                !newPassword ||
                                value === newPassword ||
                                "Passwords do not match"
                              );
                            },
                          })}
                        />
                        {errors.confirmPassword && (
                          <p className="text-sm text-destructive">
                            {errors.confirmPassword.message}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <Button type="submit" className="w-full">
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="email" className="space-y-6">
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
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive notifications via email
                  </p>
                </div>
                <Switch
                  checked={notifications.email}
                  onCheckedChange={(checked) =>
                    handleNotificationChange("email", checked)
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Browser Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive push notifications in your browser
                  </p>
                </div>
                <Switch
                  checked={notifications.browser}
                  onCheckedChange={(checked) =>
                    handleNotificationChange("browser", checked)
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Marketing Communications</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive updates about new features and tips
                  </p>
                </div>
                <Switch
                  checked={notifications.marketing}
                  onCheckedChange={(checked) =>
                    handleNotificationChange("marketing", checked)
                  }
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appearance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Appearance Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Dark Mode</Label>
                  <p className="text-sm text-muted-foreground">
                    Toggle between light and dark themes
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <Sun className="h-4 w-4" />
                  <Switch
                    checked={isDarkMode}
                    onCheckedChange={setIsDarkMode}
                  />
                  <Moon className="h-4 w-4" />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="data" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Data Management</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium mb-2">Export Data</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Download all your CRM data as a CSV file
                  </p>
                  <Button onClick={handleExportData} variant="outline">
                    <Download className="mr-2 h-4 w-4" />
                    Export All Data
                  </Button>
                </div>

                <Separator />

                <div>
                  <h3 className="font-medium mb-2">Import Data</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Upload a CSV file to import leads
                  </p>
                  <Button variant="outline">
                    <Upload className="mr-2 h-4 w-4" />
                    Import CSV
                  </Button>
                </div>
              </div>

              <div className="p-4 bg-muted/50 rounded-lg">
                <h4 className="font-medium mb-2">Data Export</h4>
                <p className="text-sm text-muted-foreground">
                  Export all your leads, workflows, and settings as a JSON file.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium mb-2">
                    Two-Factor Authentication
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Add an extra layer of security to your account
                  </p>
                  <Button variant="outline">Enable 2FA</Button>
                </div>

                <Separator />

                <div>
                  <h3 className="font-medium mb-2">Active Sessions</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Manage your active sessions across different devices
                  </p>
                  <Button variant="outline">View Sessions</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
