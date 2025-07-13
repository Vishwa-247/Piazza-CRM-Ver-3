import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { WorkflowExecution, workflowService } from "@/services/workflowService";
import {
  addEdge,
  Background,
  BackgroundVariant,
  Connection,
  Controls,
  Edge,
  MiniMap,
  Node,
  ReactFlow,
  useEdgesState,
  useNodesState,
} from "@xyflow/react";
import { Download, Loader2, Play, Plus, Save, Upload, Zap } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import "@xyflow/react/dist/style.css";

const initialNodes: Node[] = [
  {
    id: "1",
    type: "input",
    data: { label: "📋 Lead Created" },
    position: { x: 100, y: 100 },
    className: "node-trigger",
    deletable: false,
  },
];

const initialEdges: Edge[] = [];

export const WorkflowDesigner = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedAction, setSelectedAction] = useState<string>("");
  const [executions, setExecutions] = useState<WorkflowExecution[]>([]);
  const [isExecuting, setIsExecuting] = useState(false);

  // Load executions and workflow on mount
  useEffect(() => {
    setExecutions(workflowService.getExecutionHistory());

    // Load saved workflow on mount
    const savedWorkflow = localStorage.getItem("crm-workflow");
    if (savedWorkflow) {
      try {
        const workflow = JSON.parse(savedWorkflow);
        setNodes(workflow.nodes || initialNodes);
        setEdges(workflow.edges || initialEdges);
      } catch (error) {
        console.error("Failed to load saved workflow:", error);
      }
    }
  }, []);

  // Listen for workflow completion
  useEffect(() => {
    const handleWorkflowCompleted = (event: CustomEvent) => {
      const execution = event.detail as WorkflowExecution;
      setExecutions(workflowService.getExecutionHistory());
      setIsExecuting(false);

      toast({
        title: "✅ Workflow Completed",
        description: `Successfully executed workflow for ${execution.leadName}`,
        duration: 4000,
      });
    };

    const handleLeadUpdated = () => {
      setExecutions(workflowService.getExecutionHistory());
    };

    window.addEventListener(
      "workflowCompleted",
      handleWorkflowCompleted as EventListener
    );
    window.addEventListener("leadUpdated", handleLeadUpdated);

    return () => {
      window.removeEventListener(
        "workflowCompleted",
        handleWorkflowCompleted as EventListener
      );
      window.removeEventListener("leadUpdated", handleLeadUpdated);
    };
  }, []);

  const actionOptions = [
    { value: "send_email", label: "📧 Send Email", color: "bg-blue-500" },
    {
      value: "update_status",
      label: "🔄 Update Status",
      color: "bg-orange-500",
    },
    { value: "create_task", label: "📋 Create Task", color: "bg-purple-500" },
  ];

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const addActionNode = () => {
    if (!selectedAction) {
      toast({
        title: "No Action Selected",
        description: "Please select an action type first",
        variant: "destructive",
      });
      return;
    }

    const actionOption = actionOptions.find(
      (opt) => opt.value === selectedAction
    );
    if (!actionOption) return;

    const newNode: Node = {
      id: `action_${Date.now()}`,
      type: "default",
      position: { x: 300 + (nodes.length - 1) * 200, y: 100 },
      data: { label: actionOption.label },
      className: "node-action",
    };

    setNodes((nds) => [...nds, newNode]);
    setSelectedAction("");

    toast({
      title: "Action Added",
      description: `${actionOption.label} added to workflow`,
    });
  };

  const onNodesDelete = useCallback(
    (nodesToDelete: Node[]) => {
      const nodeIds = nodesToDelete.map((node) => node.id);

      // Don't allow deleting the trigger node
      const triggerNode = nodesToDelete.find((node) => node.id === "1");
      if (triggerNode) {
        toast({
          title: "Cannot Delete Trigger",
          description: "The 'Lead Created' trigger cannot be deleted",
          variant: "destructive",
        });
        return;
      }

      // Remove connected edges when deleting nodes
      setEdges((edges) =>
        edges.filter(
          (edge) =>
            !nodeIds.includes(edge.source) && !nodeIds.includes(edge.target)
        )
      );

      if (nodesToDelete.length > 0) {
        toast({
          title: "Nodes Deleted",
          description: `Deleted ${nodesToDelete.length} node(s)`,
        });
      }
    },
    [setEdges]
  );

  const onEdgesDelete = useCallback((edgesToDelete: Edge[]) => {
    if (edgesToDelete.length > 0) {
      toast({
        title: "Connections Removed",
        description: `Removed ${edgesToDelete.length} connection(s)`,
      });
    }
  }, []);

  const saveWorkflow = () => {
    const workflow = { nodes, edges };
    localStorage.setItem("crm-workflow", JSON.stringify(workflow));
    toast({
      title: "✅ Workflow Saved",
      description:
        "Your workflow has been saved and will auto-trigger for new leads",
      duration: 3000,
    });
  };

  const loadWorkflow = () => {
    const savedWorkflow = localStorage.getItem("crm-workflow");
    if (savedWorkflow) {
      try {
        const workflow = JSON.parse(savedWorkflow);
        setNodes(workflow.nodes || initialNodes);
        setEdges(workflow.edges || initialEdges);
        toast({
          title: "✅ Workflow Loaded",
          description: "Your saved workflow has been loaded successfully",
        });
      } catch (error) {
        toast({
          title: "Load Failed",
          description: "Failed to load saved workflow",
          variant: "destructive",
        });
      }
    } else {
      toast({
        title: "No Saved Workflow",
        description: "No saved workflow found",
        variant: "destructive",
      });
    }
  };

  const clearWorkflow = () => {
    setNodes(initialNodes);
    setEdges(initialEdges);

    toast({
      title: "Workflow Cleared",
      description: "Workflow has been reset to initial state",
    });
  };

  const executeWorkflow = async () => {
    setIsExecuting(true);

    toast({
      title: "🚀 Starting Workflow",
      description: "Preparing workflow execution...",
      duration: 2000,
    });

    // Create progress callback for toast messages
    const progressCallback = (progress: number, message: string) => {
      toast({
        title: `⚡ Workflow Progress (${Math.round(progress)}%)`,
        description: message,
        duration: 1500,
      });
    };

    // Get the most recent lead to demonstrate with
    const { loadData } = await import("@/services/dataService");
    const data = loadData();

    if (data.leads.length === 0) {
      setIsExecuting(false);
      toast({
        title: "No Leads Found",
        description: "Please create a lead first to test the workflow",
        variant: "destructive",
      });
      return;
    }

    const latestLead = data.leads[0];
    const savedWorkflow = localStorage.getItem("crm-workflow");

    if (!savedWorkflow) {
      setIsExecuting(false);
      toast({
        title: "No Workflow Found",
        description: "Please create and save a workflow first",
        variant: "destructive",
      });
      return;
    }

    const workflow = JSON.parse(savedWorkflow);
    const actions = workflowService.extractActionsFromWorkflow(workflow);

    if (actions.length === 0) {
      setIsExecuting(false);
      toast({
        title: "❌ No Actions Found",
        description: "Please add actions to your workflow",
        variant: "destructive",
      });
      return;
    }

    try {
      await workflowService.executeWorkflowForLead(
        latestLead.id,
        actions,
        progressCallback
      );
      setExecutions(workflowService.getExecutionHistory());

      toast({
        title: "✅ Workflow Executed Successfully",
        description: `Completed workflow for ${latestLead.name}`,
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: "❌ Workflow Execution Failed",
        description: `Error: ${error}`,
        variant: "destructive",
      });
      console.error("Workflow execution failed:", error);
    } finally {
      setIsExecuting(false);
    }
  };

  const getStatusBadge = (status: WorkflowExecution["status"]) => {
    const variants = {
      completed: "bg-green-500 text-white",
      running: "bg-blue-500 text-white",
      failed: "bg-red-500 text-white",
    };

    return (
      <Badge className={variants[status]}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Controls */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>🤖 Workflow Automation</CardTitle>
            <div className="flex space-x-2">
              <Button variant="outline" onClick={loadWorkflow}>
                <Upload className="mr-2 h-4 w-4" />
                Load
              </Button>
              <Button variant="outline" onClick={saveWorkflow}>
                <Save className="mr-2 h-4 w-4" />
                Save
              </Button>
              <Button variant="outline" onClick={clearWorkflow}>
                <Download className="mr-2 h-4 w-4" />
                Clear
              </Button>
              <Button
                onClick={executeWorkflow}
                disabled={isExecuting}
                className="bg-green-600 hover:bg-green-700"
              >
                {isExecuting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Executing...
                  </>
                ) : (
                  <>
                    <Play className="mr-2 h-4 w-4" />
                    Execute Now
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground space-y-2">
            <p>
              • <strong>Real Automation:</strong> Actions will actually execute
              on your leads
            </p>
            <p>
              • <strong>Auto-Trigger:</strong> Saved workflows run automatically
              for new leads
            </p>
            <p>
              • <strong>3 Core Actions:</strong> Send Email, Update Status,
              Create Task
            </p>
            <p>
              • <strong>Progress Tracking:</strong> Real-time execution with
              live progress updates
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Action Selector */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">Add Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <Select value={selectedAction} onValueChange={setSelectedAction}>
                <SelectTrigger>
                  <SelectValue placeholder="Select action type" />
                </SelectTrigger>
                <SelectContent>
                  {actionOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button
                onClick={addActionNode}
                className="w-full"
                disabled={!selectedAction}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Action
              </Button>
            </div>

            <div className="pt-4 border-t">
              <h4 className="text-sm font-medium mb-2 text-green-600">
                🔄 Trigger (Always Present)
              </h4>
              <div className="p-2 border rounded-lg bg-green-50">
                <div className="flex items-center space-x-2">
                  <Zap className="h-4 w-4 text-green-600" />
                  <span className="text-sm">📋 Lead Created</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Workflow Canvas */}
        <Card className="lg:col-span-2">
          <CardContent className="p-0">
            <div className="h-[500px] w-full">
              <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                onNodesDelete={onNodesDelete}
                onEdgesDelete={onEdgesDelete}
                fitView
                className="bg-muted/50"
                deleteKeyCode={["Backspace", "Delete"]}
              >
                <Controls />
                <MiniMap />
                <Background
                  variant={BackgroundVariant.Dots}
                  gap={12}
                  size={1}
                />
              </ReactFlow>
            </div>
          </CardContent>
        </Card>

        {/* Execution History */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">🚀 Execution History</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px]">
              <div className="space-y-3">
                {executions.length === 0 ? (
                  <div className="text-center text-muted-foreground py-8">
                    <p>No executions yet</p>
                    <p className="text-xs">Execute a workflow to see history</p>
                  </div>
                ) : (
                  executions.map((execution) => (
                    <div
                      key={execution.id}
                      className="p-3 border rounded-lg space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">
                          {execution.leadName}
                        </span>
                        {getStatusBadge(execution.status)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        <div>Lead ID: {execution.leadId}</div>
                        <div>{execution.startTime.toLocaleString()}</div>
                        <div>{execution.actions.length} actions</div>
                      </div>
                      <div className="text-xs space-y-1">
                        {execution.results.map((result, index) => (
                          <div
                            key={index}
                            className="bg-muted p-2 rounded text-xs"
                          >
                            {result.message}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
