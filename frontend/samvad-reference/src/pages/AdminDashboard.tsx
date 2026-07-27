import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  AlertTriangle, 
  Clock, 
  CheckCircle, 
  Users,
  Search,
  Filter,
  MapPin,
  Calendar,
  TrendingUp,
  Eye,
  MessageSquare
} from "lucide-react";
import { Report } from "@/types";
import { cn } from "@/lib/utils";

interface AdminDashboardProps {
  reports: Report[];
  onUpdateReport: (reportId: string, updates: Partial<Report>) => void;
}

export const AdminDashboard = ({ reports, onUpdateReport }: AdminDashboardProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [filteredReports, setFilteredReports] = useState<Report[]>([]);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [newStatus, setNewStatus] = useState<string>("");
  const [staffComment, setStaffComment] = useState("");
  const [realtimeCount, setRealtimeCount] = useState(reports.length);

  // Mock real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate new reports coming in
      const shouldUpdate = Math.random() > 0.7; // 30% chance every 10 seconds
      if (shouldUpdate) {
        setRealtimeCount(prev => prev + Math.floor(Math.random() * 2));
      }
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    let filtered = [...reports].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    // Filter by search term
    if (searchTerm.trim()) {
      filtered = filtered.filter(report =>
        report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter(report => report.status === statusFilter);
    }

    // Filter by priority
    if (priorityFilter !== "all") {
      filtered = filtered.filter(report => report.priority === parseInt(priorityFilter));
    }

    setFilteredReports(filtered);
  }, [searchTerm, statusFilter, priorityFilter, reports]);

  const handleUpdateReport = () => {
    if (!selectedReport || !newStatus) return;

    const updates: Partial<Report> = {
      status: newStatus as Report["status"],
      updatedAt: new Date(),
    };

    if (staffComment.trim()) {
      updates.staffComment = staffComment.trim();
      updates.assignedStaffId = "staff1";
    }

    onUpdateReport(selectedReport.id, updates);
    setSelectedReport(null);
    setNewStatus("");
    setStaffComment("");
  };

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

  const stats = {
    total: reports.length,
    pending: reports.filter(r => r.status === "Submitted").length,
    assigned: reports.filter(r => r.status === "Assigned").length,
    inProgress: reports.filter(r => r.status === "In Progress").length,
    resolved: reports.filter(r => r.status === "Resolved").length,
    highPriority: reports.filter(r => r.priority >= 4).length
  };

  return (
    <div className="max-w-7xl mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage and respond to civic issue reports</p>
        </div>
        <div className="flex items-center gap-2 bg-primary-light rounded-lg p-3">
          <TrendingUp className="h-5 w-5 text-primary" />
          <div>
            <p className="text-sm font-semibold text-primary">Live Updates</p>
            <p className="text-xs text-muted-foreground">{realtimeCount} total reports</p>
          </div>
        </div>
      </div>

      {/* Stats Dashboard */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary-light rounded-lg flex items-center justify-center">
                <AlertTriangle className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.total}</p>
                <p className="text-xs text-muted-foreground">Total</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-muted rounded-lg flex items-center justify-center">
                <Clock className="h-4 w-4 text-muted-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.pending}</p>
                <p className="text-xs text-muted-foreground">Pending</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary-light rounded-lg flex items-center justify-center">
                <Users className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.assigned}</p>
                <p className="text-xs text-muted-foreground">Assigned</p>
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
                <p className="text-2xl font-bold text-foreground">{stats.inProgress}</p>
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
                <p className="text-2xl font-bold text-foreground">{stats.resolved}</p>
                <p className="text-xs text-muted-foreground">Resolved</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-destructive-light rounded-lg flex items-center justify-center">
                <AlertTriangle className="h-4 w-4 text-destructive" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.highPriority}</p>
                <p className="text-xs text-muted-foreground">High Priority</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by ID, title, category..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="Submitted">Submitted</SelectItem>
                  <SelectItem value="Assigned">Assigned</SelectItem>
                  <SelectItem value="In Progress">In Progress</SelectItem>
                  <SelectItem value="Resolved">Resolved</SelectItem>
                </SelectContent>
              </Select>
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priority</SelectItem>
                  <SelectItem value="5">P5 - Critical</SelectItem>
                  <SelectItem value="4">P4 - High</SelectItem>
                  <SelectItem value="3">P3 - Medium</SelectItem>
                  <SelectItem value="2">P2 - Low</SelectItem>
                  <SelectItem value="1">P1 - Very Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reports Table */}
      <Card>
        <CardHeader>
          <CardTitle>Reports ({filteredReports.length})</CardTitle>
          <CardDescription>
            All civic issue reports sorted by creation date
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b bg-muted/50">
                <tr>
                  <th className="text-left p-4 font-medium">Report ID</th>
                  <th className="text-left p-4 font-medium">Title</th>
                  <th className="text-left p-4 font-medium">Category</th>
                  <th className="text-left p-4 font-medium">Priority</th>
                  <th className="text-left p-4 font-medium">Status</th>
                  <th className="text-left p-4 font-medium">Date</th>
                  <th className="text-left p-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredReports.map((report) => (
                  <tr key={report.id} className="border-b hover:bg-accent/50">
                    <td className="p-4">
                      <span className="font-mono text-sm">{report.id}</span>
                    </td>
                    <td className="p-4">
                      <div className="max-w-xs">
                        <p className="font-medium truncate">{report.title}</p>
                        <p className="text-sm text-muted-foreground truncate">
                          {report.description}
                        </p>
                      </div>
                    </td>
                    <td className="p-4">
                      <Badge variant="outline" className="text-xs">
                        {report.category}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <span className={cn("font-medium", getPriorityColor(report.priority))}>
                        P{report.priority}
                      </span>
                    </td>
                    <td className="p-4">
                      <Badge className={cn("text-xs", getStatusColor(report.status))}>
                        {getStatusIcon(report.status)}
                        {report.status}
                      </Badge>
                    </td>
                    <td className="p-4 text-sm text-muted-foreground">
                      {formatDate(report.createdAt)}
                    </td>
                    <td className="p-4">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              setSelectedReport(report);
                              setNewStatus(report.status);
                              setStaffComment(report.staffComment || "");
                            }}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                          {selectedReport && (
                            <>
                              <DialogHeader>
                                <DialogTitle className="flex items-center gap-2">
                                  <span>Report #{selectedReport.id}</span>
                                  <Badge className={cn("text-xs", getStatusColor(selectedReport.status))}>
                                    {selectedReport.status}
                                  </Badge>
                                </DialogTitle>
                                <DialogDescription>
                                  Submitted by citizen on {formatDate(selectedReport.createdAt)}
                                </DialogDescription>
                              </DialogHeader>
                              
                              <div className="space-y-6">
                                {/* Report Details */}
                                <div className="space-y-4">
                                  <div>
                                    <h3 className="font-semibold text-foreground mb-2">Issue Details</h3>
                                    <h4 className="font-medium text-lg">{selectedReport.title}</h4>
                                    <p className="text-muted-foreground mt-1">{selectedReport.description}</p>
                                  </div>

                                  {selectedReport.photoUrl && (
                                    <div>
                                      <h4 className="font-medium mb-2">Photo Evidence</h4>
                                      <img 
                                        src={selectedReport.photoUrl} 
                                        alt="Issue photo" 
                                        className="w-full h-48 object-cover rounded-lg border"
                                      />
                                    </div>
                                  )}

                                  <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                      <span className="font-medium">Category:</span>
                                      <p className="text-muted-foreground">{selectedReport.category}</p>
                                    </div>
                                    <div>
                                      <span className="font-medium">Priority:</span>
                                      <p className={cn("font-medium", getPriorityColor(selectedReport.priority))}>
                                        P{selectedReport.priority}
                                      </p>
                                    </div>
                                    <div className="col-span-2">
                                      <span className="font-medium">Location:</span>
                                      <p className="text-muted-foreground">{selectedReport.location.address}</p>
                                      <p className="text-xs text-muted-foreground">
                                        {selectedReport.location.lat.toFixed(4)}, {selectedReport.location.lng.toFixed(4)}
                                      </p>
                                    </div>
                                  </div>
                                </div>

                                {/* Update Form */}
                                <div className="space-y-4 pt-4 border-t">
                                  <h3 className="font-semibold text-foreground">Update Status</h3>
                                  
                                  <div className="space-y-2">
                                    <Label htmlFor="status">New Status</Label>
                                    <Select value={newStatus} onValueChange={setNewStatus}>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select status" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="Submitted">Submitted</SelectItem>
                                        <SelectItem value="Assigned">Assigned</SelectItem>
                                        <SelectItem value="In Progress">In Progress</SelectItem>
                                        <SelectItem value="Resolved">Resolved</SelectItem>
                                        <SelectItem value="Closed">Closed</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>

                                  <div className="space-y-2">
                                    <Label htmlFor="comment">Staff Comment</Label>
                                    <Textarea
                                      id="comment"
                                      placeholder="Add a comment about the status update..."
                                      value={staffComment}
                                      onChange={(e) => setStaffComment(e.target.value)}
                                      rows={3}
                                    />
                                  </div>

                                  <Button 
                                    variant="civic" 
                                    onClick={handleUpdateReport}
                                    className="w-full"
                                    disabled={!newStatus || newStatus === selectedReport.status}
                                  >
                                    <MessageSquare className="h-4 w-4 mr-2" />
                                    Update Report
                                  </Button>
                                </div>
                              </div>
                            </>
                          )}
                        </DialogContent>
                      </Dialog>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};