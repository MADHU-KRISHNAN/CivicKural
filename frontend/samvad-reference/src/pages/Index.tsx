import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/hooks/use-toast";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { Login } from "@/pages/Login";
import { ReportIssue } from "@/pages/ReportIssue";
import { CitizenDashboard } from "@/pages/CitizenDashboard";
import { AdminDashboard } from "@/pages/AdminDashboard";
import { mockReports } from "@/services/mockData";
import { apiService } from "@/services/apiService";
import { Report } from "@/types";

interface User {
  id: string;
  name: string;
  role: "citizen" | "staff";
}

// API base URL - use environment variable in production, fallback to localhost in development
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const Index = () => {
  const [currentPage, setCurrentPage] = useState<string>("home");
  const [user, setUser] = useState<User | null>(null);
  const [reports, setReports] = useState<Report[]>([]);
  const [communityReports, setCommunityReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();


  // Load user data from localStorage on component mount
  useEffect(() => {
    const loadUserData = async () => {
      try {
        // Check if user is already logged in
        if (apiService.isAuthenticated()) {
          const userData = apiService.getCurrentUser();
          if (userData) {
            setUser({
              id: userData._id || userData.id,
              name: userData.name,
              role: userData.role === "staff" ? "staff" : "citizen"
            });
            // Load reports if authenticated
            const userContext = {
              id: userData._id || userData.id,
              name: userData.name,
              role: userData.role === "staff" ? "staff" : "citizen"
            };
            await loadReports(userContext);
          }
        } else {
          // Not authenticated - show empty reports
          setReports([]);
        }
      } catch (error) {
        console.error('Error loading user data:', error);
        // Show empty data on error
        setReports([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadUserData();
  }, []);

  // Auto-refresh data when tab becomes active (useful for real-time updates)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && user) {
        // Tab became active and user is logged in - refresh data
        loadReports(user);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [user]);

  const loadReports = async (currentUser?: User) => {
    try {
      console.log('🔄 Loading reports from backend...');
      
      // Use passed user or the state user
      const userToCheck = currentUser || user;
      
      // Use different endpoints based on user role
      let response;
      if (userToCheck?.role === "citizen") {
        console.log('👤 Loading reports for CITIZEN - using /my endpoint');
        response = await fetch(`${API_BASE_URL}/reports/my`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
            'Content-Type': 'application/json'
          }
        });
        response = await response.json();
      } else if (userToCheck?.role === "staff") {
        console.log('👮 Loading reports for STAFF - using /admin endpoint');
        response = await fetch(`${API_BASE_URL}/reports/admin`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
            'Content-Type': 'application/json'
          }
        });
        response = await response.json();
      } else {
        console.log('📊 Loading public reports');
        response = await apiService.getReports({});
      }
      console.log('📊 Backend response:', response);
      
      // Always load community reports for citizens
      if (userToCheck?.role === "citizen") {
        try {
          console.log('🏠 Loading community issues for citizen...');
          const communityResponse = await fetch(`${API_BASE_URL}/reports/community`, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
              'Content-Type': 'application/json'
            }
          });
          const communityData = await communityResponse.json();
          
          if (communityData.success && communityData.reports) {
            console.log('✅ Community reports loaded:', communityData.reports.length, 'reports');
            const transformedCommunityReports = communityData.reports.map((report: any) => ({
              id: report.id,
              title: report.title,
              description: '', // Not provided for anonymized reports
              category: report.category,
              priority: report.priority,
              status: report.status,
              photoUrl: report.photoUrl ? `${API_BASE_URL.replace('/api', '')}${report.photoUrl}` : undefined,
              location: {
                lat: 0,
                lng: 0,
                address: report.location.address
              },
              citizenId: 'Anonymous',
              createdAt: new Date(report.createdAt),
              updatedAt: new Date(report.updatedAt)
            }));
            setCommunityReports(transformedCommunityReports);
          }
        } catch (error) {
          console.error('❌ Error loading community reports:', error);
          setCommunityReports([]);
        }
      }
      
      if (response.success && response.reports) {
        console.log('✅ Reports loaded:', response.reports.length, 'reports');
        // Transform backend data to frontend format
        const transformedReports = response.reports.map((report: any) => ({
          id: report._id || report.id,
          title: report.title,
          description: report.description,
          category: report.category,
          priority: report.priority,
          status: report.status,
          photoUrl: report.photos?.[0]?.url ? `${API_BASE_URL.replace('/api', '')}${report.photos[0].url}` : undefined,
          location: {
            lat: report.location?.coordinates?.[1] || 0,
            lng: report.location?.coordinates?.[0] || 0,
            address: report.location?.address || 'Unknown location'
          },
          citizenId: report.citizenId,
          createdAt: new Date(report.createdAt),
          updatedAt: new Date(report.updatedAt)
        }));
        
        console.log('🔄 Transformed reports:', transformedReports);
        console.log('📦 Setting reports state with', transformedReports.length, 'reports');
        setReports(transformedReports);
        
        // Additional debug - check if reports state was actually set
        setTimeout(() => {
          console.log('🗺 Current reports state after setting:', transformedReports.length);
        }, 100);
      } else {
        console.log('❌ No data in response, setting empty array');
        setReports([]);
      }
    } catch (error) {
      console.error('❌ Error loading reports:', error);
      console.error('❌ Error details:', error);
      // Set empty array instead of mock data to see the real issue
      setReports([]);
    }
  };

  const handleLogin = (userData: User) => {
    setUser(userData);
    // Load real reports after login
    loadReports(userData);
    
    if (userData.role === "citizen") {
      setCurrentPage("dashboard");
    } else {
      setCurrentPage("admin");
    }
    toast({
      title: "Welcome back!",
      description: `Signed in as ${userData.name}`,
    });
  };

  const handleNavigate = async (page: string) => {
    if (page === "home") {
      // Logout - clear authentication
      apiService.logout();
      setUser(null);
      setReports([]); // Clear reports on logout
      setCurrentPage("home");
    } else if ((page === "report" || page === "dashboard") && !user) {
      setCurrentPage("login");
    } else if (page === "admin" && user?.role !== "staff") {
      setCurrentPage("login");
    } else {
      // Refresh data when navigating to dashboard or admin
      if ((page === "dashboard" || page === "admin") && user) {
        await loadReports(user);
      }
      setCurrentPage(page);
    }
  };

  const handleReportSubmitted = async (newReport: Report) => {
    // Reload reports from backend to get latest data
    await loadReports(user);
    
    setCurrentPage("dashboard");
    toast({
      title: "Report Submitted Successfully!",
      description: `Your report has been submitted and saved to the database.`,
    });
  };

  const handleUpdateReport = async (reportId: string, updates: Partial<Report>) => {
    try {
      // Update report status
      if (updates.status) {
        const statusResponse = await fetch(`${API_BASE_URL}/staff/reports/${reportId}/status`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            status: updates.status
          })
        });

        if (!statusResponse.ok) {
          throw new Error('Failed to update report status');
        }

        const statusResult = await statusResponse.json();
        if (!statusResult.success) {
          throw new Error(statusResult.message || 'Failed to update status');
        }
      }

      // Add staff comment if provided
      if (updates.staffComment && updates.staffComment.trim()) {
        const commentResponse = await fetch(`${API_BASE_URL}/staff/reports/${reportId}/comment`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            comment: updates.staffComment.trim()
          })
        });

        if (!commentResponse.ok) {
          throw new Error('Failed to add staff comment');
        }

        const commentResult = await commentResponse.json();
        if (!commentResult.success) {
          throw new Error(commentResult.message || 'Failed to add comment');
        }
      }

      // Refresh data to get the latest state from backend
      await loadReports(user);
      
      toast({
        title: "Report Updated",
        description: `Report has been updated successfully.`,
      });

    } catch (error) {
      console.error('Error updating report:', error);
      toast({
        title: "Update Failed",
        description: error instanceof Error ? error.message : "Failed to update report. Please try again.",
        variant: "destructive"
      });
    }
  };

  const renderPage = () => {
    switch (currentPage) {
      case "login":
        return <Login onLogin={handleLogin} />;
      
      case "report":
        return user ? (
          <ReportIssue 
            userId={user.id} 
            onReportSubmitted={handleReportSubmitted}
          />
        ) : null;
      
      case "dashboard":
        console.log('📊 Rendering CitizenDashboard with', reports.length, 'reports');
        return user && user.role === "citizen" ? (
          <CitizenDashboard 
            reports={reports}
            communityReports={communityReports}
            userId={user.id}
            onNavigate={handleNavigate}
          />
        ) : null;
      
      case "admin":
        console.log('👮 Rendering AdminDashboard with', reports.length, 'reports');
        return user && user.role === "staff" ? (
          <AdminDashboard 
            reports={reports}
            onUpdateReport={handleUpdateReport}
          />
        ) : null;
      
      default:
        return <Hero onNavigate={handleNavigate} />;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading Samvad Civic Connect...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header 
        userRole={user?.role || null} 
        onNavigate={handleNavigate}
        currentPage={currentPage}
      />
      <main className="pb-8">
        {renderPage()}
      </main>
      <Toaster />
    </div>
  );
};

export default Index;
