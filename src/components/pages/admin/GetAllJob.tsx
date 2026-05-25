"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  MoreHorizontal,
  ArrowUpDown,
  Filter,
  Download,
  RefreshCw,
  Briefcase,
  CheckCircle,
  FileText,
  Layers,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Calendar,
  RotateCcw
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getJobsAPI } from "@/service/operations/job";
import { RootState } from "@/redux/store";
import { useSelector } from "react-redux";
import * as XLSX from "xlsx";

interface Job {
  _id: string;
  title: string;
  location: string;
  type: string;
  department: string;
  experience: string;
  salary: string;
  description: string;
  responsibilities: string[];
  requirements: string[];
  benefits: string[];
  postedDate: string;
  deadline: string;
  status: string;
  applicationsCount: number;
  createdAt?: string;
}

type SortField =
  | "title"
  | "department"
  | "type"
  | "postedDate"
  | "deadline"
  | "applicationsCount";
type SortOrder = "asc" | "desc";

export default function GetAllJob() {
  const { toast } = useToast();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortField, setSortField] = useState<SortField>("postedDate");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const user = useSelector((state: RootState) => state.auth?.user ?? null);

  const fetchAllJobs = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getJobsAPI();
      setJobs(response);
    } catch (err: any) {
      console.error("Error fetching jobs:", err);
      setError("Failed to load job listings. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllJobs();
  }, []);

  useEffect(() => {
    filterAndSortJobs();
  }, [
    jobs,
    searchTerm,
    departmentFilter,
    typeFilter,
    statusFilter,
    sortField,
    sortOrder,
  ]);

  const filterAndSortJobs = () => {
    let filtered = [...jobs];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (job) =>
          job?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          job?.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          job?.department?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply category filters
    if (departmentFilter !== "all") {
      filtered = filtered.filter((job) => job?.department === departmentFilter);
    }

    if (typeFilter !== "all") {
      filtered = filtered.filter((job) => job?.type === typeFilter);
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((job) => job?.status === statusFilter);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: any = a[sortField];
      let bValue: any = b[sortField];

      if (sortField === "postedDate" || sortField === "deadline") {
        aValue = new Date(aValue).getTime();
        bValue = new Date(bValue).getTime();
      }

      if (typeof aValue === "string") {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredJobs(filtered);
    setCurrentPage(1); // Reset page to 1 on filters change
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchTerm(searchInput);
  };

  const clearFilters = () => {
    setSearchInput("");
    setSearchTerm("");
    setDepartmentFilter("all");
    setTypeFilter("all");
    setStatusFilter("all");
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const downloadExcel = () => {
    const data = filteredJobs.map((job) => ({
      "Job Title": job.title || "N/A",
      "Department": job.department || "N/A",
      "Job Type": job.type || "N/A",
      "Location": job.location || "N/A",
      "Salary Range": job.salary || "N/A",
      "Experience Req": job.experience || "N/A",
      "Status": job.status || "Draft",
      "Applications": job.applicationsCount || 0,
      "Posted Date": formatDate(job.createdAt),
      "Deadline": formatDate(job.deadline),
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Jobs List");
    
    // Auto-size columns
    const maxWidth = 25;
    const colWidths = Object.keys(data[0] || {}).map(() => ({ wch: maxWidth }));
    worksheet["!cols"] = colWidths;

    XLSX.writeFile(workbook, `jobs-listings-${Date.now()}.xlsx`);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString("en-IN", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return "Invalid date";
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case "Active":
        return "bg-green-100 text-green-800 border-green-200";
      case "Closed":
        return "bg-red-100 text-red-800 border-red-200";
      case "Draft":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getTypeColor = (type?: string) => {
    switch (type) {
      case "Full-time":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "Part-time":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "Contract":
        return "bg-orange-100 text-orange-800 border-orange-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  // Pagination bounds
  const totalPages = Math.ceil(filteredJobs.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentJobs = filteredJobs.slice(startIndex, endIndex);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const SortButton = ({
    field,
    children,
  }: {
    field: SortField;
    children: React.ReactNode;
  }) => (
    <Button
      variant="ghost"
      size="sm"
      className="h-8 p-0 font-bold hover:bg-gray-150 transition-colors flex items-center"
      onClick={() => handleSort(field)}
    >
      {children}
      <ArrowUpDown className="ml-1.5 h-3.5 w-3.5 text-gray-400" />
    </Button>
  );

  if (loading && jobs.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="w-14 h-14 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
          <div>
            <h2 className="text-xl font-bold text-gray-800">Loading Jobs...</h2>
            <p className="text-sm text-gray-500 mt-1">Please wait while we fetch the job postings</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user?.isJob) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8 bg-white rounded-2xl shadow-lg border border-gray-200 max-w-md">
          <div className="text-red-500 text-6xl mb-4">🚫</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Access Denied</h2>
          <p className="text-gray-600 text-sm">You do not have permission to manage platform job openings.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Responsive Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
            
            {/* Left Content */}
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight flex items-center">
                <Briefcase className="w-8 h-8 mr-2.5 text-indigo-600" />
                Job Management
              </h1>
              <p className="mt-2 text-sm text-gray-600">
                Displaying {filteredJobs.length} of {jobs.length} postings. Route application listings dynamically.
              </p>
            </div>

            {/* Right Side Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
              <Button
                variant="outline"
                onClick={fetchAllJobs}
                className="w-full sm:w-auto h-11 px-4 hover:bg-gray-50 active:bg-gray-150 flex items-center justify-center gap-2 text-sm font-semibold border-gray-300 shadow-sm"
              >
                <RefreshCw className="h-4 w-4 text-gray-500" />
                Refresh
              </Button>
              
              <Button
                variant="outline"
                onClick={downloadExcel}
                disabled={filteredJobs.length === 0}
                className="w-full sm:w-auto h-11 px-4 hover:bg-gray-50 active:bg-gray-150 flex items-center justify-center gap-2 text-sm font-semibold border-gray-300 shadow-sm"
              >
                <Download className="h-4 w-4 text-gray-500" />
                Export Excel
              </Button>

              <Link to="/admin/add-job" className="w-full sm:w-auto">
                <Button className="w-full h-11 px-5 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-semibold flex items-center justify-center gap-2 shadow-sm rounded-lg">
                  <Plus className="h-5 w-5" />
                  Create New Job
                </Button>
              </Link>
            </div>

          </div>
        </div>

        {/* Dynamic Metric cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center space-x-4 hover:shadow-md transition-shadow duration-200">
            <div className="p-3 bg-indigo-50 rounded-lg text-indigo-600">
              <Briefcase className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{jobs.length}</div>
              <div className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Total Positions</div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center space-x-4 hover:shadow-md transition-shadow duration-200">
            <div className="p-3 bg-green-50 rounded-lg text-green-600">
              <CheckCircle className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">
                {jobs.filter((j) => j.status === "Active").length}
              </div>
              <div className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Active Postings</div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center space-x-4 hover:shadow-md transition-shadow duration-200">
            <div className="p-3 bg-blue-50 rounded-lg text-blue-600">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600">
                {jobs.reduce((sum, job) => sum + (job.applicationsCount || 0), 0)}
              </div>
              <div className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Total Applications</div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center space-x-4 hover:shadow-md transition-shadow duration-200">
            <div className="p-3 bg-amber-50 rounded-lg text-amber-600">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-bold text-amber-600">
                {new Set(jobs.map((j) => j.department).filter(Boolean)).size}
              </div>
              <div className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Departments</div>
            </div>
          </div>
        </div>

        {/* Search & Filters */}
        <Card className="shadow-sm border border-gray-200">
          <CardContent className="p-5">
            <div className="flex flex-col lg:flex-row gap-4">
              
              {/* Search Block */}
              <div className="flex-1">
                <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Search className="h-5 w-5 text-gray-400" />
                    </span>
                    <Input
                      placeholder="Search jobs by title, location, or department..."
                      value={searchInput}
                      onChange={(e) => setSearchInput(e.target.value)}
                      className="pl-10 h-11 text-black placeholder:text-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white text-sm"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      type="submit"
                      className="w-full sm:w-auto h-11 px-6 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold"
                    >
                      Search
                    </Button>
                    {(searchTerm || searchInput || departmentFilter !== "all" || typeFilter !== "all" || statusFilter !== "all") && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={clearFilters}
                        className="h-11 px-4 hover:bg-gray-100 flex items-center gap-1.5"
                      >
                        <RotateCcw className="w-4 h-4 text-gray-500" />
                        Clear
                      </Button>
                    )}
                  </div>
                </form>
              </div>

              {/* Select Filters Dropdown List */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full lg:w-auto">
                <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                  <SelectTrigger className="w-full sm:w-[170px] h-11 text-sm bg-white border-gray-300">
                    <SelectValue placeholder="Department" />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    <SelectItem value="all">All Departments</SelectItem>
                    <SelectItem value="Sales">Sales</SelectItem>
                    <SelectItem value="Operations">Operations</SelectItem>
                    <SelectItem value="Marketing">Marketing</SelectItem>
                    <SelectItem value="Creative">Creative</SelectItem>
                    <SelectItem value="HR">HR</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-full sm:w-[150px] h-11 text-sm bg-white border-gray-300">
                    <SelectValue placeholder="Job Type" />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="Full-time">Full-time</SelectItem>
                    <SelectItem value="Part-time">Part-time</SelectItem>
                    <SelectItem value="Contract">Contract</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full sm:w-[150px] h-11 text-sm bg-white border-gray-300">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Closed">Closed</SelectItem>
                    <SelectItem value="Draft">Draft</SelectItem>
                  </SelectContent>
                </Select>
              </div>

            </div>
          </CardContent>
        </Card>

        {/* Jobs List Grid */}
        <Card className="shadow-sm border border-gray-200 overflow-hidden">
          <CardContent className="p-0 sm:p-6">
            
            {/* Desktop Table View (hidden on small viewports) */}
            <div className="hidden md:block border border-gray-200 rounded-xl overflow-hidden">
              <Table>
                <TableHeader className="bg-gray-50/70">
                  <TableRow>
                    <TableHead className="font-bold text-gray-700 py-3.5">
                      <SortButton field="title">Job Title</SortButton>
                    </TableHead>
                    <TableHead className="font-bold text-gray-700">
                      <SortButton field="department">Department</SortButton>
                    </TableHead>
                    <TableHead className="font-bold text-gray-700">
                      <SortButton field="type">Type</SortButton>
                    </TableHead>
                    <TableHead className="font-bold text-gray-700">Location</TableHead>
                    <TableHead className="font-bold text-gray-700">
                      <SortButton field="postedDate">Posted</SortButton>
                    </TableHead>
                    <TableHead className="font-bold text-gray-700">
                      <SortButton field="deadline">Deadline</SortButton>
                    </TableHead>
                    <TableHead className="font-bold text-gray-700">Status</TableHead>
                    <TableHead className="font-bold text-gray-700 text-right pr-6">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentJobs.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="h-44 text-center">
                        <div className="flex flex-col items-center justify-center space-y-2">
                          <Filter className="h-8 w-8 text-gray-300" />
                          <p className="text-gray-500 font-medium">No job postings found matching your active criteria.</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    currentJobs.map((job) => (
                      <TableRow key={job._id} className="hover:bg-gray-50/50">
                        <TableCell className="py-4 pl-6 font-medium">
                          <div>
                            <div className="font-bold text-gray-900 text-sm">{job.title || "N/A"}</div>
                            <div className="text-xs text-gray-500 mt-1 max-w-[240px] truncate" title={job.description}>
                              {job.description || "No description provided"}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs bg-gray-50/50">
                            {job.department || "N/A"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${getTypeColor(job.type)}`}>
                            {job.type || "N/A"}
                          </span>
                        </TableCell>
                        <TableCell className="text-sm text-gray-600 font-medium">
                          <span className="flex items-center">
                            <MapPin className="w-3.5 h-3.5 mr-1 text-gray-400 flex-shrink-0" />
                            {job.location || "N/A"}
                          </span>
                        </TableCell>
                        <TableCell className="text-sm text-gray-500 font-medium">
                          {formatDate(job.createdAt)}
                        </TableCell>
                        <TableCell className="text-sm text-gray-500 font-semibold">
                          {formatDate(job.deadline)}
                        </TableCell>
                        <TableCell>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold border ${getStatusColor(job.status)}`}>
                            {job.status || "Draft"}
                          </span>
                        </TableCell>
                        <TableCell className="text-right pr-6">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0 rounded-full hover:bg-gray-100">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4 text-gray-500" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="bg-white">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => window.open(`/job/${job._id}`, '_blank')}
                                className="flex items-center text-gray-700 cursor-pointer"
                              >
                                <Eye className="mr-2 h-4 w-4 text-gray-400" />
                                View Posting
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Mobile Card Timeline (shown only on small viewports) */}
            <div className="block md:hidden p-4 space-y-4">
              {currentJobs.length === 0 ? (
                <div className="text-center py-12 space-y-2">
                  <Filter className="h-8 w-8 text-gray-300 mx-auto" />
                  <p className="text-gray-500 text-sm">No job postings found matching criteria.</p>
                </div>
              ) : (
                currentJobs.map((job) => (
                  <div 
                    key={job._id} 
                    className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 hover:border-indigo-100 space-y-3"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-bold text-gray-900 text-sm leading-snug">{job.title || "N/A"}</h3>
                        <p className="text-xs text-gray-500 line-clamp-2 mt-1">{job.description || "No description provided"}</p>
                      </div>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border flex-shrink-0 ${getStatusColor(job.status)}`}>
                        {job.status || "Draft"}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5">
                      <Badge variant="outline" className="text-[10px] bg-gray-50">{job.department || "N/A"}</Badge>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${getTypeColor(job.type)}`}>
                        {job.type || "N/A"}
                      </span>
                      <span className="inline-flex items-center text-[10px] text-gray-600 bg-gray-100/70 border border-gray-200/50 px-2 py-0.5 rounded-md">
                        <MapPin className="w-3 h-3 mr-0.5 text-gray-400" />
                        {job.location || "N/A"}
                      </span>
                    </div>

                    <div className="border-t pt-3 flex items-center justify-between text-[11px] text-gray-500">
                      <div className="space-y-0.5">
                        <span className="flex items-center gap-1 text-[10px]">
                          <Calendar className="w-3.5 h-3.5 text-gray-400" />
                          Posted: {formatDate(job.createdAt)}
                        </span>
                        <span className="flex items-center gap-1 text-[10px] font-semibold text-red-500">
                          <Calendar className="w-3.5 h-3.5 text-red-400" />
                          Deadline: {formatDate(job.deadline)}
                        </span>
                      </div>
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-full hover:bg-gray-100">
                            <MoreHorizontal className="h-4 w-4 text-gray-400" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-white">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => window.open(`/job/${job._id}`, '_blank')}
                            className="flex items-center cursor-pointer text-gray-700"
                          >
                            <Eye className="mr-2 h-4 w-4 text-gray-400" />
                            View Posting
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pt-4 border-t border-gray-200 p-4">
                <div className="text-sm text-gray-500 text-center lg:text-left">
                  Showing <span className="font-semibold text-gray-900">{startIndex + 1}</span> to{" "}
                  <span className="font-semibold text-gray-900">{Math.min(endIndex, filteredJobs.length)}</span> of{" "}
                  <span className="font-semibold text-gray-900">{filteredJobs.length}</span> jobs
                </div>
                <div className="flex flex-wrap items-center justify-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="flex items-center gap-1.5 h-9"
                  >
                    <ChevronLeft className="w-4 h-4 text-gray-500" />
                    <span className="hidden sm:inline">Previous</span>
                  </Button>
                  
                  <div className="flex flex-wrap items-center justify-center gap-1.5">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                      <Button
                        key={pageNum}
                        variant={currentPage === pageNum ? "default" : "outline"}
                        size="sm"
                        onClick={() => handlePageChange(pageNum)}
                        className={`w-9 h-9 p-0 font-bold ${
                          currentPage === pageNum
                            ? "bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
                            : ""
                        }`}
                      >
                        {pageNum}
                      </Button>
                    ))}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="flex items-center gap-1.5 h-9"
                  >
                    <span className="hidden sm:inline">Next</span>
                    <ChevronRight className="w-4 h-4 text-gray-500" />
                  </Button>
                </div>
              </div>
            )}

          </CardContent>
        </Card>

      </div>
    </div>
  );
}
