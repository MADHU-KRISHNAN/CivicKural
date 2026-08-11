import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  Search,
  Filter,
  MapPin,
  Camera,
  Plus
} from "lucide-react";
import { Report } from "@/types";
import { cn } from "@/lib/utils";

interface CitizenDashboardProps {
  reports: Report[];
  communityReports?: Report[];
  userId: string;
  onNavigate: (page: string) => void;
}

export const CitizenDashboard = ({ reports, communityReports = [], userId, onNavigate }: CitizenDashboardProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [filteredReports, setFilteredReports] = useState<Report[]>([]);

  const userReports = useMemo(() => {
    // No need to filter since /my endpoint already returns user-specific reports
    return reports;
  }, [reports]);

  useEffect(() => {
    let filtered = userReports;

    // Filter by search term
    if (searchTerm.trim()) {
      filtered = filtered.filter(report =>
        report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter(report => report.status === statusFilter);
    }

    setFilteredReports(filtered);
  }, [searchTerm, statusFilter, userReports]);

  const getStatusIcon = (status: Report["status"]) => {
    switch (status) {
      case "Resolved":
        return <CheckCircle className="h-4 w-4 text-success" />;
      case "In Progress":
        return <Clock className="h-4 w-4 text-warning" />;
      case "Assigned":
        return <Clock className="h-4 w-4 text-primary" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusColor = (status: Report["status"]) => {
    switch (status) {
      case "Resolved":
        return "bg-success text-success-foreground";
      case "In Progress":
        return "bg-warning text-warning-foreground";
      case "Assigned":
        return "bg-primary text-primary-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getPriorityColor = (priority: number) => {
    if (priority >= 4) return "text-destructive";
    if (priority >= 3) return "text-warning";
    return "text-success";
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const renderReportsList = (reportsToShow: Report[], isMyReports = true) => (
    <>
      {/* Stats Cards - Only show for My Reports */}
      {isMyReports && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-primary-light rounded-lg flex items-center justify-center">
                  <AlertTriangle className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{userReports.length}</p>
                  <p className="text-xs text-muted-foreground">Total Reports</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-warning-light rounded-lg flex items-center justify-center">
                  <Clock className="h-4 w-4 text-warning" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">
                    {userReports.filter(r => r.status === "In Progress").length}
                  </p>
                  <p className="text-xs text-muted-foreground">In Progress</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-success-light rounded-lg flex items-center justify-center">
                  <CheckCircle className="h-4 w-4 text-success" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">
                    {userReports.filter(r => r.status === "Resolved").length}
                  </p>
                  <p className="text-xs text-muted-foreground">Resolved</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-muted rounded-lg flex items-center justify-center">
                  <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">
                    {userReports.filter(r => r.status === "Submitted").length}
                  </p>
                  <p className="text-xs text-muted-foreground">Pending</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search reports..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex gap-2">
              {["all", "Submitted", "Assigned", "In Progress", "Resolved"].map((status) => (
                <Button
                  key={status}
                  variant={statusFilter === status ? "civic" : "outline"}
                  size="sm"
                  onClick={() => setStatusFilter(status)}
                >
                  {status === "all" ? "All" : status}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reports List */}
      <div className="space-y-4">
        {reportsToShow.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {isMyReports ? "No reports found" : "No community issues found"}
              </h3>
              <p className="text-muted-foreground mb-4">
                {isMyReports 
                  ? (userReports.length === 0
                      ? "You haven't submitted any reports yet."
                      : "No reports match your search criteria.")
                  : "No community issues match your search criteria."}
              </p>
              {isMyReports && userReports.length === 0 && (
                <Button variant="civic" onClick={() => onNavigate("report")}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Report
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          reportsToShow.map((report) => (
            <Card key={report.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row gap-4">
                  {/* Report Image */}
                  {report.photoUrl && (
                    <div className="lg:w-32 lg:h-24">
                      <img
                        src={report.photoUrl}
                        alt="Report"
                        className="w-full h-24 lg:h-full object-cover rounded-lg"
                      />
                    </div>
                  )}

                  {/* Report Details */}
                  <div className="flex-1 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-mono text-muted-foreground">#{report.id}</span>
                          <Badge variant="outline" className="text-xs">{report.category}</Badge>
                          {!isMyReports && (
                            <Badge variant="secondary" className="text-xs">Community</Badge>
                          )}
                        </div>
                        <h3 className="text-lg font-semibold text-foreground">{report.title}</h3>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={cn("text-xs", getStatusColor(report.status))}>
                          {getStatusIcon(report.status)}
                          {report.status}
                        </Badge>
                        <span className={cn("text-sm font-medium", getPriorityColor(report.priority))}>
                          P{report.priority}
                        </span>
                      </div>
                    </div>

                    <p className="text-muted-foreground text-sm line-clamp-2">
                      {report.description || "Description not available for community issues"}
                    </p>

                    <div className="flex flex-col sm:flex-row sm:items-center gap-3 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        <span className="truncate">{report.location.address}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>Submitted {formatDate(report.createdAt)}</span>
                      </div>
                    </div>

                    {isMyReports && report.staffComment && (
                      <div className="bg-primary-light rounded-lg p-3 mt-3">
                        <p className="text-sm font-medium text-primary mb-1">Staff Update:</p>
                        <p className="text-sm text-foreground">{report.staffComment}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Updated {formatDate(report.updatedAt)}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </>
  );

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Citizen Dashboard</h1>
          <p className="text-muted-foreground">Track your reports and community issues</p>
        </div>
        <Button variant="civic" onClick={() => onNavigate("report")}>
          <Plus className="h-4 w-4 mr-2" />
          New Report
        </Button>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="my-reports" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="my-reports">My Reports ({userReports.length})</TabsTrigger>
          <TabsTrigger value="community">Community Issues ({communityReports.length})</TabsTrigger>
        </TabsList>
        
        <TabsContent value="my-reports">
          {renderReportsList(filteredReports, true)}
        </TabsContent>
        
        <TabsContent value="community">
          {renderReportsList(communityReports, false)}
        </TabsContent>
      </Tabs>
    </div>
  );
};