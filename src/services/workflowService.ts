import { toast } from "@/hooks/use-toast";
import { Lead } from "./dataService";

export interface WorkflowAction {
  id: string;
  type: "send_email" | "update_status" | "create_task";
  label: string;
  config?: Record<string, unknown>;
}

export interface WorkflowExecution {
  id: string;
  leadId: string;
  leadName: string;
  actions: WorkflowAction[];
  status: "running" | "completed" | "failed";
  startTime: Date;
  endTime?: Date;
  results: WorkflowResult[];
  progress: number;
}

export interface WorkflowResult {
  actionId: string;
  actionType: string;
  actionLabel: string;
  status: "success" | "failed" | "skipped";
  message: string;
  timestamp: Date;
  data?: Record<string, unknown>;
}

export interface WorkflowTask {
  id: string;
  title: string;
  description: string;
  leadId: string;
  dueDate: Date;
  status: "pending" | "completed" | "cancelled";
  priority: "low" | "medium" | "high";
  createdAt: Date;
}

export interface FollowUpTask {
  id: string;
  leadId: string;
  leadName: string;
  scheduledDate: Date;
  type: "email" | "call" | "meeting";
  status: "scheduled" | "completed" | "cancelled";
  createdAt: Date;
}

export interface WorkflowNode {
  id: string;
  data: {
    label: string;
  };
}

export interface SavedWorkflow {
  nodes: WorkflowNode[];
  edges: unknown[];
}

class WorkflowService {
  private executions: WorkflowExecution[] = [];

  private followUpTasks: FollowUpTask[] = [];
  private progressCallbacks: Map<
    string,
    (progress: number, message: string) => void
  > = new Map();

  // Execute workflow for a specific lead
  async executeWorkflowForLead(
    leadId: string,
    actions: WorkflowAction[],
    progressCallback?: (progress: number, message: string) => void
  ): Promise<WorkflowExecution> {
    const leadData = await this.getLeadById(leadId);
    if (!leadData) {
      throw new Error(`Lead ${leadId} not found`);
    }

    const execution: WorkflowExecution = {
      id: `exec_${Date.now()}`,
      leadId,
      leadName: leadData.name,
      actions,
      status: "running",
      startTime: new Date(),
      results: [],
      progress: 0,
    };

    this.executions.push(execution);

    if (progressCallback) {
      this.progressCallbacks.set(execution.id, progressCallback);
    }

    console.log(
      `🚀 Starting workflow execution for lead ${leadData.name} (${leadId})`
    );
    this.updateProgress(
      execution.id,
      0,
      `Starting workflow for ${leadData.name}`
    );

    try {
      // Execute each action in sequence
      for (let i = 0; i < actions.length; i++) {
        const action = actions[i];
        const progress = ((i + 1) / actions.length) * 100;

        this.updateProgress(
          execution.id,
          progress,
          `Executing: ${action.label}`
        );

        const result = await this.executeAction(action, leadData, execution);
        execution.results.push(result);

        // Add delay between actions to show progress
        await new Promise((resolve) => setTimeout(resolve, 1500));
      }

      execution.status = "completed";
      execution.endTime = new Date();
      execution.progress = 100;

      this.updateProgress(execution.id, 100, `Workflow completed successfully`);

      console.log(`✅ Workflow completed for ${leadData.name}`);

      toast({
        title: "🎉 Workflow Executed Successfully",
        description: `Completed ${actions.length} actions for ${leadData.name}`,
        duration: 5000,
      });

      // Trigger UI update
      this.notifyWorkflowComplete(execution);
    } catch (error) {
      execution.status = "failed";
      execution.endTime = new Date();

      const errorResult: WorkflowResult = {
        actionId: "error",
        actionType: "error",
        actionLabel: "Workflow Error",
        status: "failed",
        message: `❌ Error: ${error}`,
        timestamp: new Date(),
      };

      execution.results.push(errorResult);

      this.updateProgress(
        execution.id,
        execution.progress,
        `Workflow failed: ${error}`
      );

      console.error(`❌ Workflow failed:`, error);

      toast({
        title: "❌ Workflow Failed",
        description: `Error executing workflow: ${error}`,
        variant: "destructive",
        duration: 5000,
      });
    } finally {
      this.progressCallbacks.delete(execution.id);
    }

    return execution;
  }

  // Update workflow progress
  private updateProgress(
    executionId: string,
    progress: number,
    message: string
  ): void {
    const callback = this.progressCallbacks.get(executionId);
    if (callback) {
      callback(progress, message);
    }

    // Update execution progress
    const execution = this.executions.find((e) => e.id === executionId);
    if (execution) {
      execution.progress = progress;
    }
  }

  // Execute individual action
  private async executeAction(
    action: WorkflowAction,
    lead: Lead,
    execution: WorkflowExecution
  ): Promise<WorkflowResult> {
    console.log(`🔄 Executing action: ${action.label} for ${lead.name}`);

    const result: WorkflowResult = {
      actionId: action.id,
      actionType: action.type,
      actionLabel: action.label,
      status: "success",
      message: "",
      timestamp: new Date(),
    };

    try {
      switch (action.type) {
        case "send_email":
          await this.sendEmail(lead, result);
          break;

        case "update_status":
          await this.updateLeadStatus(lead, result);
          break;

        case "create_task":
          await this.createTask(lead, result);
          break;

        default:
          throw new Error(`Unknown action type: ${action.type}`);
      }
    } catch (error) {
      result.status = "failed";
      result.message = `Failed: ${error}`;
    }

    return result;
  }

  // Send email action with preview
  private async sendEmail(lead: Lead, result: WorkflowResult): Promise<void> {
    const emailTemplate = this.getEmailTemplate(lead);
    const subject = emailTemplate.subject.replace("{{name}}", lead.name);
    const body = emailTemplate.body
      .replace("{{name}}", lead.name)
      .replace("{{email}}", lead.email)
      .replace("{{date}}", new Date().toLocaleDateString());

    // In a real app, this would send the email via API
    // For demo purposes, we'll simulate sending
    result.message = `📧 Email sent: "${subject}" → ${lead.email}`;
    result.data = { subject, body, to: lead.email };

    console.log(`📧 Email sent for ${lead.name}:`, { subject, to: lead.email });

    // Show toast notification for email sent
    const { toast } = await import("@/hooks/use-toast");
    toast({
      title: "📧 Email Sent",
      description: `Welcome email sent to ${lead.name}`,
      duration: 3000,
    });
  }

  // Update lead status action
  private async updateLeadStatus(
    lead: Lead,
    result: WorkflowResult
  ): Promise<void> {
    const { updateLead } = await import("./dataService");

    const newStatus = "contacted";
    updateLead(lead.id, { status: newStatus });

    result.message = `🔄 Status updated: ${
      lead.name
    } → ${newStatus.toUpperCase()}`;
    result.data = { oldStatus: lead.status, newStatus };

    // Trigger UI update event
    window.dispatchEvent(
      new CustomEvent("leadUpdated", {
        detail: { leadId: lead.id, updates: { status: newStatus } },
      })
    );

    // Show toast notification for status update
    const { toast } = await import("@/hooks/use-toast");
    toast({
      title: "🔄 Status Updated",
      description: `${lead.name} status changed to ${newStatus.toUpperCase()}`,
      duration: 3000,
    });
  }

  // Create task action
  private async createTask(lead: Lead, result: WorkflowResult): Promise<void> {
    const task: WorkflowTask = {
      id: `task_${Date.now()}`,
      title: `Follow up with ${lead.name}`,
      description: `Contact ${lead.name} regarding their inquiry`,
      leadId: lead.id,
      dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
      status: "pending",
      priority: "medium",
      createdAt: new Date(),
    };

    result.message = `📋 Task created: "${
      task.title
    }" (Due: ${task.dueDate.toLocaleDateString()})`;
    result.data = { task };

    // Show toast notification for task creation
    const { toast } = await import("@/hooks/use-toast");
    toast({
      title: "📋 Task Created",
      description: `Follow-up task created for ${lead.name}`,
      duration: 3000,
    });
  }

  // Schedule follow-up action
  private async scheduleFollowup(
    lead: Lead,
    result: WorkflowResult
  ): Promise<void> {
    const followUpDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 1 week from now
    const followUp: FollowUpTask = {
      id: `followup_${Date.now()}`,
      leadId: lead.id,
      leadName: lead.name,
      scheduledDate: followUpDate,
      type: "email",
      status: "scheduled",
      createdAt: new Date(),
    };

    this.followUpTasks.push(followUp);

    result.message = `📅 Follow-up scheduled: ${
      lead.name
    } on ${followUpDate.toLocaleDateString()}`;
    result.data = { followUp };
  }

  // Assign representative action
  private async assignRep(lead: Lead, result: WorkflowResult): Promise<void> {
    const { updateLead } = await import("./dataService");

    // Assign to a random rep (in real app, this would be based on territories, availability, etc.)
    const reps = ["Sarah Johnson", "Mike Chen", "Emma Williams", "David Brown"];
    const assignedRep = reps[Math.floor(Math.random() * reps.length)];

    // Note: In a real app, assignedRep would be part of the Lead interface
    // For demo purposes, we'll store it in the lead data
    updateLead(lead.id, { source: `${lead.source} | Rep: ${assignedRep}` });

    result.message = `👤 Representative assigned: ${assignedRep} → ${lead.name}`;
    result.data = { assignedRep };
  }

  // Send SMS action
  private async sendSMS(lead: Lead, result: WorkflowResult): Promise<void> {
    const smsMessage = `Hi ${lead.name}, thanks for your interest! We'll be in touch soon. - CRM Team`;

    // In real app, this would send via SMS API
    result.message = `📱 SMS prepared: "${smsMessage}" → ${lead.phone}`;
    result.data = { message: smsMessage, phone: lead.phone };
  }

  // Create calendar event action
  private async createCalendarEvent(
    lead: Lead,
    result: WorkflowResult
  ): Promise<void> {
    const eventDate = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000); // 3 days from now
    const event = {
      id: `event_${Date.now()}`,
      title: `Initial call with ${lead.name}`,
      description: `First contact call with potential customer ${lead.name}`,
      startTime: eventDate,
      endTime: new Date(eventDate.getTime() + 30 * 60 * 1000), // 30 minutes
      attendees: [lead.email],
      location: "Video Call",
      leadId: lead.id,
    };

    result.message = `📅 Calendar event created: "${
      event.title
    }" on ${eventDate.toLocaleDateString()}`;
    result.data = { event };
  }

  // Get email template based on lead
  private getEmailTemplate(lead: Lead): {
    name: string;
    subject: string;
    body: string;
  } {
    // In real app, this would be more sophisticated
    return {
      name: "Welcome Email",
      subject: "Welcome to Our CRM, {{name}}!",
      body: `Hi {{name}},

Thank you for your interest in our services! We're excited to help you achieve your goals.

Here's what happens next:
• One of our representatives will contact you within 24 hours
• We'll schedule a consultation to understand your needs
• You'll receive a custom proposal tailored to your requirements

If you have any immediate questions, feel free to reply to this email or call us at (555) 123-4567.

Best regards,
Sales Team
CRM Company

---
This email was sent to {{email}} on {{date}}.`,
    };
  }

  // Get lead by ID
  private async getLeadById(leadId: string): Promise<Lead | null> {
    // Import dynamically to avoid circular dependency
    const { loadData } = await import("./dataService");
    const data = loadData();
    return data.leads.find((lead: Lead) => lead.id === leadId) || null;
  }

  // Auto-trigger workflow when new lead is created
  async autoTriggerWorkflow(leadId: string): Promise<void> {
    const savedWorkflow = this.getSavedWorkflow();
    if (savedWorkflow && savedWorkflow.nodes.length > 1) {
      console.log(`🤖 Auto-triggering workflow for new lead: ${leadId}`);

      // Extract actions from saved workflow
      const actions = this.extractActionsFromWorkflow(savedWorkflow);

      if (actions.length > 0) {
        // Add small delay to ensure lead is saved
        setTimeout(() => {
          this.executeWorkflowForLead(leadId, actions);
        }, 1000);
      }
    }
  }

  // Extract actions from saved workflow
  public extractActionsFromWorkflow(workflow: SavedWorkflow): WorkflowAction[] {
    const actions: WorkflowAction[] = [];

    // Find action nodes (exclude trigger nodes)
    const actionNodes = workflow.nodes.filter(
      (node: WorkflowNode) =>
        node.id !== "1" && !node.data.label.includes("Lead Created")
    );

    actionNodes.forEach((node: WorkflowNode) => {
      const label = node.data.label;

      if (label.includes("Send Email")) {
        actions.push({
          id: node.id,
          type: "send_email",
          label: "Send Welcome Email",
        });
      } else if (label.includes("Update Status")) {
        actions.push({
          id: node.id,
          type: "update_status",
          label: "Update Lead Status",
        });
      } else if (label.includes("Create Task")) {
        actions.push({
          id: node.id,
          type: "create_task",
          label: "Create Follow-up Task",
        });
      }
    });

    return actions;
  }

  // Get saved workflow from localStorage
  private getSavedWorkflow(): SavedWorkflow | null {
    try {
      const saved = localStorage.getItem("crm-workflow");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  }

  public getCurrentWorkflow(): SavedWorkflow | null {
    return this.getSavedWorkflow();
  }

  // Notify workflow completion
  private notifyWorkflowComplete(execution: WorkflowExecution): void {
    window.dispatchEvent(
      new CustomEvent("workflowCompleted", {
        detail: execution,
      })
    );
  }

  // Get execution history
  getExecutionHistory(): WorkflowExecution[] {
    return [...this.executions].reverse();
  }

  // Get email previews

  // Get follow-up tasks
  getFollowUpTasks(): FollowUpTask[] {
    return [...this.followUpTasks].reverse();
  }

  // Execute current workflow manually
  async executeCurrentWorkflow(): Promise<void> {
    const savedWorkflow = this.getSavedWorkflow();
    if (!savedWorkflow) {
      toast({
        title: "No Workflow Found",
        description: "Please create and save a workflow first",
        variant: "destructive",
      });
      return;
    }

    // Get the most recent lead to demonstrate with
    const { loadData } = await import("./dataService");
    const data = loadData();

    if (data.leads.length === 0) {
      toast({
        title: "No Leads Found",
        description: "Please create a lead first to test the workflow",
        variant: "destructive",
      });
      return;
    }

    const latestLead = data.leads[0];
    const actions = this.extractActionsFromWorkflow(savedWorkflow);

    if (actions.length === 0) {
      toast({
        title: "No Actions Found",
        description: "Please add actions to your workflow",
        variant: "destructive",
      });
      return;
    }

    // Show progress toast
    toast({
      title: "🚀 Executing Workflow",
      description: `Running ${actions.length} actions for ${latestLead.name}`,
      duration: 3000,
    });

    await this.executeWorkflowForLead(latestLead.id, actions);
  }

  // Get workflow performance metrics
  getWorkflowMetrics(): {
    totalExecutions: number;
    completedExecutions: number;
    failedExecutions: number;
    successRate: number;
    avgExecutionTime: number;
    emailsSent: number;
    tasksCreated: number;
    followUpsScheduled: number;
  } {
    const completedExecutions = this.executions.filter(
      (e) => e.status === "completed"
    );
    const failedExecutions = this.executions.filter(
      (e) => e.status === "failed"
    );

    const avgExecutionTime =
      completedExecutions.length > 0
        ? completedExecutions.reduce((sum, e) => {
            const duration = e.endTime
              ? e.endTime.getTime() - e.startTime.getTime()
              : 0;
            return sum + duration;
          }, 0) / completedExecutions.length
        : 0;

    return {
      totalExecutions: this.executions.length,
      completedExecutions: completedExecutions.length,
      failedExecutions: failedExecutions.length,
      successRate:
        this.executions.length > 0
          ? (completedExecutions.length / this.executions.length) * 100
          : 0,
      avgExecutionTime: Math.round(avgExecutionTime / 1000), // Convert to seconds
      emailsSent: this.executions.reduce(
        (sum, e) =>
          sum + e.results.filter((r) => r.actionType === "send_email").length,
        0
      ),
      tasksCreated: this.executions.reduce(
        (sum, e) =>
          sum + e.results.filter((r) => r.actionType === "create_task").length,
        0
      ),
      followUpsScheduled: this.followUpTasks.length,
    };
  }
}

export const workflowService = new WorkflowService();
