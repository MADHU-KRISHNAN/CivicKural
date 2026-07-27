import { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  MessageSquare, 
  User, 
  Settings, 
  LogOut, 
  Menu,
  X
} from "lucide-react";
import { cn } from "@/lib/utils";

interface HeaderProps {
  userRole?: "citizen" | "staff" | null;
  onNavigate: (page: string) => void;
  currentPage: string;
}

export const Header = ({ userRole, onNavigate, currentPage }: HeaderProps) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="bg-card border-b border-border shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div 
            className="flex items-center gap-3 cursor-pointer" 
            onClick={() => onNavigate("home")}
          >
            <div className="w-8 h-8 bg-gradient-hero rounded-lg flex items-center justify-center">
              <MessageSquare className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-foreground">Samvad</span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            {userRole === "citizen" && (
              <>
                <Button
                  variant={currentPage === "report" ? "civic" : "ghost"}
                  size="sm"
                  onClick={() => onNavigate("report")}
                >
                  Report Issue
                </Button>
                <Button
                  variant={currentPage === "dashboard" ? "civic" : "ghost"}
                  size="sm"
                  onClick={() => onNavigate("dashboard")}
                >
                  My Reports
                </Button>
              </>
            )}
            {userRole === "staff" && (
              <Button
                variant={currentPage === "admin" ? "civic" : "ghost"}
                size="sm"
                onClick={() => onNavigate("admin")}
              >
                Admin Dashboard
              </Button>
            )}
          </nav>

          {/* User Menu */}
          <div className="flex items-center gap-3">
            {userRole ? (
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground capitalize hidden sm:block">
                  {userRole}
                </span>
                <Button variant="ghost" size="icon">
                  <User className="h-5 w-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onNavigate("home")}
                  className="hidden sm:flex"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </Button>
              </div>
            ) : (
              <Button variant="civic" size="sm" onClick={() => onNavigate("login")}>
                Login
              </Button>
            )}

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-border py-4 space-y-2">
            {userRole === "citizen" && (
              <>
                <Button
                  variant={currentPage === "report" ? "civic" : "ghost"}
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => {
                    onNavigate("report");
                    setIsMobileMenuOpen(false);
                  }}
                >
                  Report Issue
                </Button>
                <Button
                  variant={currentPage === "dashboard" ? "civic" : "ghost"}
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => {
                    onNavigate("dashboard");
                    setIsMobileMenuOpen(false);
                  }}
                >
                  My Reports
                </Button>
              </>
            )}
            {userRole === "staff" && (
              <Button
                variant={currentPage === "admin" ? "civic" : "ghost"}
                size="sm"
                className="w-full justify-start"
                onClick={() => {
                  onNavigate("admin");
                  setIsMobileMenuOpen(false);
                }}
              >
                Admin Dashboard
              </Button>
            )}
            {userRole && (
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start text-destructive hover:text-destructive"
                onClick={() => {
                  onNavigate("home");
                  setIsMobileMenuOpen(false);
                }}
              >
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            )}
          </div>
        )}
      </div>
    </header>
  );
};