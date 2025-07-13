import emailjs from '@emailjs/browser';

export interface EmailConfig {
  serviceId: string;
  templateId: string;
  publicKey: string;
  fromName: string;
  fromEmail: string;
}

export interface EmailData {
  to: string;
  toName: string;
  subject: string;
  message: string;
  fromName?: string;
  fromEmail?: string;
}

class EmailService {
  private config: EmailConfig | null = null;

  constructor() {
    this.loadConfig();
  }

  // Load email configuration from localStorage
  loadConfig(): EmailConfig | null {
    try {
      const saved = localStorage.getItem('crm-email-config');
      if (saved) {
        this.config = JSON.parse(saved);
        return this.config;
      }
    } catch (error) {
      console.error('Error loading email config:', error);
    }
    return null;
  }

  // Save email configuration to localStorage
  saveConfig(config: EmailConfig): void {
    try {
      localStorage.setItem('crm-email-config', JSON.stringify(config));
      this.config = config;
    } catch (error) {
      console.error('Error saving email config:', error);
      throw new Error('Failed to save email configuration');
    }
  }

  // Check if email is configured
  isConfigured(): boolean {
    return this.config !== null && 
           !!this.config.serviceId && 
           !!this.config.templateId && 
           !!this.config.publicKey;
  }

  // Get current configuration
  getConfig(): EmailConfig | null {
    return this.config;
  }

  // Send email using EmailJS
  async sendEmail(emailData: EmailData): Promise<boolean> {
    if (!this.isConfigured()) {
      console.error('Email service not configured');
      return false;
    }

    try {
      const templateParams = {
        to_email: emailData.to,
        to_name: emailData.toName,
        subject: emailData.subject,
        message: emailData.message,
        from_name: emailData.fromName || this.config!.fromName,
        from_email: emailData.fromEmail || this.config!.fromEmail,
      };

      const response = await emailjs.send(
        this.config!.serviceId,
        this.config!.templateId,
        templateParams,
        this.config!.publicKey
      );

      console.log('Email sent successfully:', response);
      return response.status === 200;
    } catch (error) {
      console.error('Failed to send email:', error);
      return false;
    }
  }

  // Test email configuration
  async testConfiguration(): Promise<boolean> {
    if (!this.isConfigured()) {
      return false;
    }

    try {
      const testEmail: EmailData = {
        to: this.config!.fromEmail,
        toName: 'Test User',
        subject: 'CRM Email Configuration Test',
        message: 'This is a test email to verify your CRM email configuration is working correctly.',
      };

      return await this.sendEmail(testEmail);
    } catch (error) {
      console.error('Email test failed:', error);
      return false;
    }
  }
}

export const emailService = new EmailService(); 
