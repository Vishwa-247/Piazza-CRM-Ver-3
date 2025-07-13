import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Activity,
  ArrowDown,
  ArrowUp,
  Calendar,
  Download,
  Edit,
  Mail,
  MessageSquare,
  MoreHorizontal,
  Phone,
  Plus,
  Search,
  Trash2,
  TrendingUp,
  Users,
} from "lucide-react";
import { useMemo, useState } from "react";
import { InteractionModal } from "./InteractionModal";

export interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: "new" | "contacted";
  source: string;
  createdAt: Date;
}

interface DashboardProps {
  leads: Lead[];
  onLeadUpdate: (id: string, updates: Partial<Lead>) => void;
  onLeadDelete: (id: string) => void;
  onCreateLead: () => void;
  growthPercentage: number;
}

export const Dashboard = ({
  leads,
  onLeadUpdate,
  onLeadDelete,
  onCreateLead,
  growthPercentage,
}: DashboardProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "new" | "contacted">(
    "all"
  );
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [isInteractionModalOpen, setIsInteractionModalOpen] = useState(false);

  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      const matchesSearch =
        lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.phone.includes(searchTerm);

      const matchesStatus =
        statusFilter === "all" || lead.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [leads, searchTerm, statusFilter]);

  const statusCounts = useMemo(() => {
    return {
      all: leads.length,
      new: leads.filter((l) => l.status === "new").length,
      contacted: leads.filter((l) => l.status === "contacted").length,
    };
  }, [leads]);

  const getStatusBadge = (status: Lead["status"]) => {
    const variants = {
      new: "bg-emerald-100 text-emerald-800 border-emerald-200",
      contacted: "bg-amber-100 text-amber-800 border-amber-200",
    };

    return (
      <Badge className={`${variants[status]} border font-medium`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const handleInteract = (lead: Lead) => {
    setSelectedLead(lead);
    setIsInteractionModalOpen(true);
  };

  const handleStatusChange = (leadId: string, newStatus: Lead["status"]) => {
    onLeadUpdate(leadId, { status: newStatus });
  };

  const exportData = () => {
    const csv = [
      ["Name", "Email", "Phone", "Status", "Source", "Created At"],
      ...filteredLeads.map((lead) => [
        lead.name,
        lead.email,
        lead.phone,
        lead.status,
        lead.source,
        lead.createdAt.toLocaleDateString(),
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "leads-export.csv";
    a.click();
  };

  return (
    <div className="space-y-8">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-slate-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Total Leads
                </p>
                <p className="text-3xl font-bold text-slate-900">
                  {statusCounts.all}
                </p>
                <div
                  className={`flex items-center mt-2 text-sm ${
                    growthPercentage >= 0 ? "text-emerald-600" : "text-red-600"
                  }`}
                >
                  {growthPercentage >= 0 ? (
                    <ArrowUp className="h-4 w-4 mr-1" />
                  ) : (
                    <ArrowDown className="h-4 w-4 mr-1" />
                  )}
                  <span>
                    {growthPercentage >= 0 ? "+" : ""}
                    {growthPercentage}% from last month
                  </span>
                </div>
              </div>
              <div className="h-12 w-12 rounded-lg bg-slate-100 flex items-center justify-center">
                <Users className="h-6 w-6 text-slate-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">New Leads</p>
                <p className="text-3xl font-bold text-emerald-600">
                  {statusCounts.new}
                </p>
                <div className="flex items-center mt-2 text-sm text-slate-500">
                  <span>Ready for contact</span>
                </div>
              </div>
              <div className="h-12 w-12 rounded-lg bg-emerald-100 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">Contacted</p>
                <p className="text-3xl font-bold text-amber-600">
                  {statusCounts.contacted}
                </p>
                <div className="flex items-center mt-2 text-sm text-slate-500">
                  <span>In progress</span>
                </div>
              </div>
              <div className="h-12 w-12 rounded-lg bg-amber-100 flex items-center justify-center">
                <Activity className="h-6 w-6 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lead Management Section */}
      <Card className="border-slate-200">
        <CardHeader className="border-b border-slate-200 bg-slate-50/50">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div>
              <CardTitle className="text-2xl text-slate-900">
                Lead Management
              </CardTitle>
              <p className="text-slate-600 mt-1">
                Manage and track your leads efficiently
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                <Input
                  placeholder="Search leads..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64 border-slate-300"
                />
              </div>
              <Button
                variant="outline"
                onClick={exportData}
                className="border-slate-300 text-slate-700 hover:bg-slate-50"
              >
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
              <Button
                onClick={onCreateLead}
                className="bg-slate-900 hover:bg-slate-800 text-white"
              >
                <Plus className="mr-2 h-4 w-4" />
                Create Lead
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {/* Filter Buttons */}
          <div className="p-6 pb-0">
            <div className="flex flex-wrap gap-2">
              {(["all", "new", "contacted"] as const).map((status) => (
                <Button
                  key={status}
                  variant={statusFilter === status ? "default" : "outline"}
                  size="sm"
                  onClick={() => setStatusFilter(status)}
                  className={`${
                    statusFilter === status
                      ? "bg-slate-900 text-white hover:bg-slate-800"
                      : "border-slate-300 text-slate-700 hover:bg-slate-50"
                  } transition-all duration-200`}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                  <span className="ml-2 px-1.5 py-0.5 text-xs rounded-full bg-white/20">
                    {status === "all" ? statusCounts.all : statusCounts[status]}
                  </span>
                </Button>
              ))}
            </div>
          </div>

          {/* Lead Cards */}
          <div className="p-6">
            {filteredLeads.length === 0 ? (
              <div className="text-center py-12">
                <div className="mx-auto h-24 w-24 rounded-full bg-slate-100 flex items-center justify-center mb-4">
                  <Users className="h-12 w-12 text-slate-400" />
                </div>
                <h3 className="text-lg font-medium text-slate-900 mb-2">
                  No leads found
                </h3>
                <p className="text-slate-500 mb-4">
                  Start by creating your first lead
                </p>
                <Button
                  onClick={onCreateLead}
                  className="bg-slate-900 hover:bg-slate-800 text-white"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Create First Lead
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredLeads.map((lead) => (
                  <Card
                    key={lead.id}
                    className="group hover:shadow-lg transition-all duration-200 border-slate-200"
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg mb-2 text-slate-900">
                            {lead.name}
                          </h3>
                          {getStatusBadge(lead.status)}
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-slate-600"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() =>
                                handleStatusChange(lead.id, "contacted")
                              }
                            >
                              Mark as Contacted
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-slate-600">
                              <Edit className="mr-2 h-4 w-4" />
                              Edit Lead
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              onClick={() => onLeadDelete(lead.id)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete Lead
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                      <div className="space-y-3 mb-4">
                        <div className="flex items-center text-sm text-slate-600">
                          <Mail className="h-4 w-4 mr-2 text-slate-400" />
                          {lead.email}
                        </div>
                        <div className="flex items-center text-sm text-slate-600">
                          <Phone className="h-4 w-4 mr-2 text-slate-400" />
                          {lead.phone}
                        </div>
                        <div className="flex items-center text-sm text-slate-600">
                          <Calendar className="h-4 w-4 mr-2 text-slate-400" />
                          {lead.createdAt.toLocaleDateString()}
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                        <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded">
                          {lead.source}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleInteract(lead)}
                          className="border-slate-300 text-slate-700 hover:bg-slate-50"
                        >
                          <MessageSquare className="mr-2 h-4 w-4" />
                          Interact
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Interaction Modal */}
      <InteractionModal
        lead={selectedLead}
        isOpen={isInteractionModalOpen}
        onClose={() => setIsInteractionModalOpen(false)}
      />
    </div>
  );
};
