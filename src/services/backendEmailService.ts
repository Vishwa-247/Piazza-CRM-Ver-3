export interface EmailConfig {
  email: string;
  password: string;
  name: string;
}

export interface EmailData {
  to: string;
  toName: string;
  subject: string;
  message: string;
}

class BackendEmailService {
  private config: EmailConfig | null = null;
  private backendUrl = "http://localhost:8000"; // Backend URL

  constructor() {
    this.loadConfig();
  }

  // Load email configuration from localStorage
  loadConfig(): EmailConfig | null {
    try {
      const saved = localStorage.getItem('crm-backend-email-config');
      if (saved) {
        this.config = JSON.parse(saved);
        return this.config;
      }
    } catch (error) {
      console.error('Error loading backend email config:', error);
    }
    return null;
  }

  // Save email configuration to localStorage
  saveConfig(config: EmailConfig): void {
    try {
      localStorage.setItem('crm-backend-email-config', JSON.stringify(config));
      this.config = config;
    } catch (error) {
      console.error('Error saving backend email config:', error);
      throw new Error('Failed to save email configuration');
    }
  }

  // Check if email is configured
  isConfigured(): boolean {
    return this.config !== null && 
           !!this.config.email && 
           !!this.config.password;
  }

  // Get current configuration
  getConfig(): EmailConfig | null {
    return this.config;
  }

  // Configure email with backend
  async configureEmail(config: EmailConfig): Promise<boolean> {
    try {
      const response = await fetch(`${this.backendUrl}/api/email/configure`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: config.email,
          password: config.password,
          name: config.name,
        }),
      });

      if (response.ok) {
        this.saveConfig(config);
        console.log('✅ Backend email configuration saved');
        return true;
      } else {
        const error = await response.json();
        console.error('❌ Backend email configuration failed:', error);
        return false;
      }
    } catch (error) {
      console.error('❌ Backend email configuration error:', error);
      return false;
    }
  }

  // Send email using backend SMTP
  async sendEmail(emailData: EmailData): Promise<boolean> {
    if (!this.isConfigured()) {
      console.error('Backend email service not configured');
      return false;
    }

    try {
      console.log('📧 Sending email via backend SMTP:', {
        to: emailData.to,
        toName: emailData.toName,
        subject: emailData.subject,
      });

      const response = await fetch(`${this.backendUrl}/api/email/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to_email: emailData.to,
          to_name: emailData.toName,
          subject: emailData.subject,
          message: emailData.message,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Email sent successfully via backend:', result);
        return true;
      } else {
        const error = await response.json();
        console.error('❌ Backend email sending failed:', error);
        return false;
      }
    } catch (error) {
      console.error('❌ Backend email sending error:', error);
      return false;
    }
  }

  // Test email configuration with backend
  async testConfiguration(): Promise<boolean> {
    if (!this.isConfigured()) {
      console.error('Backend email service not configured');
      return false;
    }

    try {
      console.log('🧪 Testing backend email configuration...');
      
      const response = await fetch(`${this.backendUrl}/api/email/test`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Backend email test successful:', result);
        return true;
      } else {
        const error = await response.json();
        console.error('❌ Backend email test failed:', error);
        return false;
      }
    } catch (error) {
      console.error('❌ Backend email test error:', error);
      return false;
    }
  }
}

export const backendEmailService = new BackendEmailService(); 
