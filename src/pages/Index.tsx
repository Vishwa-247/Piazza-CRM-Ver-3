import { Analytics } from "@/components/Analytics";
import { Dashboard } from "@/components/Dashboard";
import { EmailPreview } from "@/components/EmailPreview";
import { Header } from "@/components/Header";
import { LandingPage } from "@/components/LandingPage";
import { LeadCreation } from "@/components/LeadCreation";
import { Settings } from "@/components/Settings";
import { WorkflowDesigner } from "@/components/WorkflowDesigner";
import { toast } from "@/hooks/use-toast";
import {
  addLead,
  calculateGrowthPercentage,
  deleteLead,
  Lead,
  loadData,
  updateLead,
} from "@/services/dataService";
import { useCallback, useEffect, useState } from "react";

const Index = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [leads, setLeads] = useState<Lead[]>([]);
  const [growthPercentage, setGrowthPercentage] = useState(0);

  // Load data on component mount
  useEffect(() => {
    const data = loadData();
    setLeads(data.leads);
    setGrowthPercentage(calculateGrowthPercentage(data.leads));
  }, []);

  const handleLeadCreate = useCallback(
    (leadData: {
      name: string;
      email: string;
      phone: string;
      source: string;
    }) => {
      const newLead = addLead({
        ...leadData,
        status: "new",
      });
      setLeads((prev) => [newLead, ...prev]);
      setGrowthPercentage(calculateGrowthPercentage([newLead, ...leads]));

      // 🤖 AUTO-TRIGGER WORKFLOW FOR NEW LEAD
      import("@/services/workflowService").then(({ workflowService }) => {
        workflowService.autoTriggerWorkflow(newLead.id);
      });

      // Auto-navigate to dashboard after creating lead
      setActiveTab("dashboard");

      toast({
        title: "Lead Created Successfully",
        description: `${leadData.name} has been added and workflow triggered automatically.`,
      });
    },
    [leads]
  );

  const handleLeadUpdate = useCallback((id: string, updates: Partial<Lead>) => {
    updateLead(id, updates);
    setLeads((prev) =>
      prev.map((lead) => (lead.id === id ? { ...lead, ...updates } : lead))
    );
    toast({
      title: "Lead updated",
      description: "Changes have been saved successfully.",
    });
  }, []);

  const handleLeadDelete = useCallback(
    (id: string) => {
      deleteLead(id);
      const updatedLeads = leads.filter((lead) => lead.id !== id);
      setLeads(updatedLeads);
      setGrowthPercentage(calculateGrowthPercentage(updatedLeads));
      toast({
        title: "Lead removed",
        description: "Lead has been deleted from the system.",
        variant: "destructive",
      });
    },
    [leads]
  );

  const renderContent = () => {
    switch (activeTab) {
      case "landing":
        return <LandingPage onGetStarted={() => setActiveTab("dashboard")} />;
      case "create":
        return <LeadCreation onLeadCreate={handleLeadCreate} />;
      case "workflows":
        return <WorkflowDesigner />;
      case "analytics":
        return <Analytics leads={leads} />;
      case "emails":
        return <EmailPreview />;
      case "settings":
        return <Settings />;
      default:
        return (
          <Dashboard
            leads={leads}
            onLeadUpdate={handleLeadUpdate}
            onLeadDelete={handleLeadDelete}
            onCreateLead={() => setActiveTab("create")}
            growthPercentage={growthPercentage}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header activeTab={activeTab} onTabChange={setActiveTab} />
      <main className="container mx-auto px-4 py-8">{renderContent()}</main>
    </div>
  );
};

export default Index;
