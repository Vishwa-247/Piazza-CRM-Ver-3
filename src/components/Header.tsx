import { Button } from "@/components/ui/button";
import { Menu, Plus } from "lucide-react";
import { useState } from "react";

interface HeaderProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onLogout?: () => void;
}

export const Header = ({ activeTab, onTabChange, onLogout }: HeaderProps) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Add the missing toggleMobileMenu function
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen((prev) => !prev);
  };

  const tabs = [
    { id: "dashboard", label: "Dashboard" },
    { id: "create", label: "Create Lead" },
    { id: "workflows", label: "Workflows" },
    { id: "analytics", label: "Analytics" },
    { id: "emails", label: "Email Preview" },
  ];

  return (
    <header className="bg-white border-b border-slate-200">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <button
            onClick={() => onTabChange("landing")}
            className="flex items-center hover:opacity-80 transition-opacity"
          >
            <div className="h-10 w-10 rounded-lg bg-slate-900 flex items-center justify-center mr-4">
              <span className="text-white font-bold text-sm">MC</span>
            </div>
            <span className="text-xl font-semibold text-slate-900">
              Mini-CRM
            </span>
          </button>

          <nav className="hidden md:flex items-center space-x-8">
            <Button
              variant={activeTab === "dashboard" ? "default" : "ghost"}
              className={`px-4 ${
                activeTab === "dashboard"
                  ? "bg-slate-900 text-white"
                  : "text-slate-600"
              }`}
              onClick={() => onTabChange("dashboard")}
            >
              Dashboard
            </Button>
            <Button
              variant={activeTab === "create" ? "default" : "ghost"}
              className={`px-4 ${
                activeTab === "create"
                  ? "bg-slate-900 text-white"
                  : "text-slate-600"
              }`}
              onClick={() => onTabChange("create")}
            >
              Create Lead
            </Button>
            <Button
              variant={activeTab === "workflows" ? "default" : "ghost"}
              className={`px-4 ${
                activeTab === "workflows"
                  ? "bg-slate-900 text-white"
                  : "text-slate-600"
              }`}
              onClick={() => onTabChange("workflows")}
            >
              Workflows
            </Button>
            <Button
              variant={activeTab === "analytics" ? "default" : "ghost"}
              className={`px-4 ${
                activeTab === "analytics"
                  ? "bg-slate-900 text-white"
                  : "text-slate-600"
              }`}
              onClick={() => onTabChange("analytics")}
            >
              Analytics
            </Button>
            <Button
              variant={activeTab === "emails" ? "default" : "ghost"}
              className={`px-4 ${
                activeTab === "emails"
                  ? "bg-slate-900 text-white"
                  : "text-slate-600"
              }`}
              onClick={() => onTabChange("emails")}
            >
              Email Preview
            </Button>
          </nav>

          <div className="flex items-center">
            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={toggleMobileMenu}
            >
              <Menu className="h-6 w-6" />
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 py-4 px-4 bg-white">
          <nav className="flex flex-col space-y-3">
            {tabs.map((tab) => (
              <Button
                key={tab.id}
                variant={activeTab === tab.id ? "default" : "ghost"}
                className={`justify-start ${
                  activeTab === tab.id
                    ? "bg-slate-900 text-white"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                }`}
                onClick={() => {
                  onTabChange(tab.id);
                  setIsMobileMenuOpen(false);
                }}
              >
                {tab.id === "create" && <Plus className="mr-2 h-4 w-4" />}
                {tab.label}
              </Button>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
};
