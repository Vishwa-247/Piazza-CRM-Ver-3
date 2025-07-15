import { Analytics } from "@/components/Analytics";
import { Dashboard } from "@/components/Dashboard";
import { Header } from "@/components/Header";
import { LandingPage } from "@/components/LandingPage";
import { LeadCreation } from "@/components/LeadCreation";
import { Settings } from "@/components/Settings";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { workflowService } from "@/services/workflowService";
import { Loader2 } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

const Index = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [leads, setLeads] = useState<Lead[]>([]);
  const [growthPercentage, setGrowthPercentage] = useState(0);
  const [showRunWorkflowModal, setShowRunWorkflowModal] = useState(false);
  const [pendingWorkflowLeadId, setPendingWorkflowLeadId] = useState<
    string | null
  >(null);
  const [isRunningWorkflow, setIsRunningWorkflow] = useState(false);
  const pendingWorkflowAfterLeadCreate = useRef(false);

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

      // If coming from workflow modal, show workflow execution prompt for this lead
      if (pendingWorkflowAfterLeadCreate.current) {
        setPendingWorkflowLeadId(newLead.id);
        setShowRunWorkflowModal(true);
        pendingWorkflowAfterLeadCreate.current = false;
      }
      setActiveTab("dashboard");
      toast({
        title: "Lead Created Successfully",
        description: `${leadData.name} has been added.`,
      });
    },
    [leads]
  );

  const handleRunWorkflowForNewLead = async () => {
    if (!pendingWorkflowLeadId) return;
    setIsRunningWorkflow(true);
    await workflowService.executeWorkflowForLead(pendingWorkflowLeadId);
    setIsRunningWorkflow(false);
    setShowRunWorkflowModal(false);
    setPendingWorkflowLeadId(null);
    toast({
      title: "Workflow Executed",
      description: "Workflow executed for the new lead.",
    });
  };

  const handleSeeWorkflow = () => {
    setShowRunWorkflowModal(false);
    setActiveTab("workflows");
  };

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

  const handleCreateNewLead = () => {
    setShowLeadModal(false);
    setShouldReopenModal(true);
    pendingWorkflowAfterLeadCreate.current = true;
    setActiveTab("create");
  };

  const renderContent = () => {
    switch (activeTab) {
      case "landing":
        return <LandingPage onGetStarted={() => setActiveTab("dashboard")} />;
      case "create":
        return <LeadCreation onLeadCreate={handleLeadCreate} />;
      case "workflows":
        return (
          <WorkflowDesigner
            onCreateLeadRequest={() => setActiveTab("create")}
          />
        );
      case "analytics":
        return <Analytics leads={leads} />;
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
            onRefreshLeads={() => {
              const data = loadData();
              setLeads(data.leads);
              setGrowthPercentage(calculateGrowthPercentage(data.leads));
              toast({
                title: "Leads Refreshed",
                description: "Lead list has been updated.",
              });
            }}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header activeTab={activeTab} onTabChange={setActiveTab} />
      <main className="container mx-auto px-4 py-8">{renderContent()}</main>
      <Dialog
        open={showRunWorkflowModal}
        onOpenChange={(open) => setShowRunWorkflowModal(open)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Run Workflow for New Lead?</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>Do you want to run the workflow for this new lead?</p>
          </div>
          <DialogFooter>
            <Button variant="secondary" onClick={handleSeeWorkflow}>
              See the Workflow
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setShowRunWorkflowModal(false);
                setPendingWorkflowLeadId(null);
              }}
            >
              No, Maybe Later
            </Button>
            <Button
              onClick={handleRunWorkflowForNewLead}
              disabled={isRunningWorkflow}
            >
              {isRunningWorkflow ? (
                <Loader2 className="animate-spin h-4 w-4 mr-2" />
              ) : null}
              Yes, Run Workflow
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Index;
