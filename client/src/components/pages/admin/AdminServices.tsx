import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import {
  MoreHorizontal,
  Eye,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  Edit,
  Trash2,
  FileText,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { updatePropertyStatusAPI, deletePropertyAPI, getAllPropertyAPI } from "@/service/operations/property";
import { AdminEditServiceModal } from "./AdminEditServiceModal.tsx";
import * as XLSX from "xlsx";
import { RootState } from "@/redux/store.ts";
import { useSelector } from "react-redux";

interface Service {
  _id: string;
  title: string;
  category: string;
  type: string;
  price: string;
  description?: string;
  images?: Array<{ url: string; public_id: string }>;
  location: string;
  status?: string;
  vendor: {
    _id: string;
    name: string;
    company: string;
    phone: string;
  } | string;
  createdAt: string;
}

const AdminServices = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [serviceToDelete, setServiceToDelete] = useState<Service | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Custom Pagination state
  const [limit, setLimit] = useState(10);
  const [showCustomPageSize, setShowCustomPageSize] = useState(false);
  const [customPageSizeInput, setCustomPageSizeInput] = useState("");

  const { toast } = useToast();
  const { user } = useSelector((state: RootState) => state.auth);

  const fetchServices = async (
    page = currentPage,
    search = searchTerm,
    status = statusFilter,
    pageLimit = limit
  ) => {
    try {
      const isInitialLoad = services.length === 0;
      if (isInitialLoad) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }
      const result = await getAllPropertyAPI({
        page,
        limit: pageLimit,
        search: search || undefined,
        includeInactive: true,
      });

      // Handle paginated response
      if (result && result.pagination) {
        let fetchedServices = result.properties || [];
        // Client-side status filter (since backend includeInactive gives us all)
        if (status !== 'all') {
          fetchedServices = fetchedServices.filter((s: Service) => s.status === status);
        }
        setServices(fetchedServices);
        setTotalPages(result.pagination.totalPages);
        setTotalCount(result.pagination.total);
        setCurrentPage(result.pagination.page);
      } else {
        // Backward compatible: plain array
        const allServices = Array.isArray(result) ? result : [];
        setServices(allServices);
        setTotalPages(1);
        setTotalCount(allServices.length);
      }
    } catch (error) {
      console.error("Error fetching services:", error);
      toast({
        title: "Error",
        description: "Failed to fetch services",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchServices(1, "", "all");
  }, []);

  const handleSearch = () => {
    setCurrentPage(1);
    fetchServices(1, searchTerm, statusFilter);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchServices(page, searchTerm, statusFilter);
  };

  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value);
    setCurrentPage(1);
    fetchServices(1, searchTerm, value);
  };

  const handleStatusToggle = async (serviceId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';

    try {
      const result = await updatePropertyStatusAPI(serviceId, newStatus);
      if (result) {
        // Update local state
        setServices(services.map(service =>
          service._id === serviceId
            ? { ...service, status: newStatus }
            : service
        ));
        toast({
          title: "Success",
          description: `Service ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully!`,
        });
      }
    } catch (error) {
      console.error("Error updating service status:", error);
      toast({
        title: "Error",
        description: "Failed to update service status",
        variant: "destructive",
      });
    }
  };

  const handleEditService = (service: Service) => {
    setSelectedService(service);
    setEditModalOpen(true);
  };

  const handleSaveService = (_updatedService: Service) => {
    // Re-fetch from backend to get fresh data
    fetchServices(currentPage, searchTerm, statusFilter);
  };

  const handleDeleteService = (service: Service) => {
    setServiceToDelete(service);
    setDeleteDialogOpen(true);
  };

  const confirmDeleteService = async () => {
    if (!serviceToDelete) return;

    try {
      const result = await deletePropertyAPI(serviceToDelete._id);
      if (result) {
        // Remove service from local state
        setServices(services.filter(service => service._id !== serviceToDelete._id));
        toast({
          title: "Success",
          description: "Service deleted successfully!",
        });
      }
    } catch (error) {
      console.error("Error deleting service:", error);
      toast({
        title: "Error",
        description: "Failed to delete service",
        variant: "destructive",
      });
    } finally {
      setDeleteDialogOpen(false);
      setServiceToDelete(null);
    }
  };

  const getStatusBadge = (status: string) => {
    return status === 'active' ? (
      <Badge className="bg-green-100 text-green-800">
        <CheckCircle className="w-3 h-3 mr-1" />
        Active
      </Badge>
    ) : (
      <Badge className="bg-red-100 text-red-800">
        <XCircle className="w-3 h-3 mr-1" />
        Inactive
      </Badge>
    );
  };

  const handleDownloadExcel = () => {
    // Prepare comprehensive services data for Excel export (current page)
    const excelData = services.map((service) => ({
      "Service ID": service._id,
      "Service Title": service.title,
      "Category": service.category?.name || service.category,
      "Type": service.type,
      "Price": service.price,
      "Description": service.description || "",
      "Location": service.location,
      "Status": service.status || "active",
      "Vendor Name": typeof service.vendor === 'object' ? service.vendor?.name || "" : "",
      "Vendor Company": typeof service.vendor === 'object' ? service.vendor?.company || "" : "",
      "Vendor Phone": typeof service.vendor === 'object' ? service.vendor?.phone || "" : "",
      "Vendor ID": typeof service.vendor === 'object' ? service.vendor?._id || "" : service.vendor || "",
      "Images Count": service.images ? service.images.length : 0,
      "Created Date": new Date(service.createdAt).toLocaleDateString(),
      "Created Time": new Date(service.createdAt).toLocaleTimeString(),
    }));

    // Create workbook and worksheet
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(excelData);

    // Set column widths for better readability
    const columnWidths = [
      { wch: 25 }, // Service ID
      { wch: 30 }, // Service Title
      { wch: 20 }, // Category
      { wch: 15 }, // Type
      { wch: 15 }, // Price
      { wch: 40 }, // Description
      { wch: 20 }, // Location
      { wch: 12 }, // Status
      { wch: 20 }, // Vendor Name
      { wch: 25 }, // Vendor Company
      { wch: 15 }, // Vendor Phone
      { wch: 25 }, // Vendor ID
      { wch: 12 }, // Images Count
      { wch: 15 }, // Created Date
      { wch: 15 }, // Created Time
    ];

    worksheet['!cols'] = columnWidths;

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, "Services");

    // Generate filename with current date
    const currentDate = new Date().toISOString().split('T')[0];
    const filename = `Services_Complete_Details_${currentDate}.xlsx`;

    // Save the file
    XLSX.writeFile(workbook, filename);

    // Show success toast
    toast({
      title: "Success",
      description: `Downloaded ${services.length} services to Excel file`,
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <div className="flex flex-col items-center gap-4">

          {/* Spinner */}
          <div className="w-14 h-14 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>

          {/* Text */}
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-800">
              Loading Services...
            </h2>

            <p className="text-sm text-gray-500 mt-1">
              Please wait while we fetch the services
            </p>
          </div>
        </div>
      </div>
    );
  }
  if (!user?.isManageService) {
    return (
      <div className="text-red-600 text-center p-4 font-semibold">
        You do not have permission to view this page.
      </div>
    );
  }

  return (
    <div className="w-full max-w-full px-1 sm:px-4 py-0 md:pr-6 md:ml-4 space-y-6 min-h-screen flex flex-col font-inter overflow-x-hidden">
      {refreshing && (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center">
          <div className="bg-white rounded-xl shadow-lg px-8 py-6 flex flex-col items-center gap-3">
            <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
            <p className="text-sm text-gray-600 font-medium">Loading services...</p>
          </div>
        </div>
      )}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">

        {/* Left Side */}
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">
            Services Management
          </h1>

          <p className="text-sm sm:text-base text-gray-600 mt-1">
            Manage all services across the platform
          </p>
        </div>

        {/* Right Side Buttons */}
        <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto">

          <button
            onClick={handleDownloadExcel}
            className="w-full sm:w-auto px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center justify-center gap-2"
          >
            <FileText className="w-4 h-4" />
            Download Excel
          </button>

          <Button
            variant="outline"
            onClick={() =>
              fetchServices(currentPage, searchTerm, statusFilter)
            }
            disabled={loading}
            className="w-full sm:w-auto flex items-center justify-center gap-2"
          >
            <RefreshCw
              className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>

        </div>
      </div>
      {/* Filters */}
      <Card className="shadow-sm border border-gray-200">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <Filter className="w-5 h-5 text-blue-600" />
            Filters
          </CardTitle>
        </CardHeader>

        <CardContent>
          <div className="flex flex-col lg:flex-row gap-4">

            {/* Search Section */}
            <div className="flex-1">
              <div className="flex flex-col sm:flex-row gap-3">

                {/* Input */}
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />

                  <Input
                    placeholder="Search services, vendors, or categories..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleSearch();
                    }}
                    className="pl-10 h-11 text-sm"
                  />
                </div>

                {/* Search Button */}
                <Button
                  onClick={handleSearch}
                  className="w-full sm:w-auto h-11 px-6 bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center gap-2"
                >
                  <Search className="w-4 h-4" />
                  Search
                </Button>
              </div>
            </div>

            {/* Status Filter */}
            <div className="w-full lg:w-56">
              <select
                value={statusFilter}
                onChange={(e) =>
                  handleStatusFilterChange(e.target.value)
                }
                className="w-full h-11 px-3 border border-gray-300 rounded-md bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Services Table */}
      <Card className="w-full shadow-sm overflow-hidden mb-6">
        <CardHeader>
          <CardTitle>
            Services ({totalCount}){searchTerm && <span className="text-sm font-normal text-gray-500 ml-2">— results for "{searchTerm}"</span>}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="w-full overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Service</TableHead>
                  <TableHead>Vendor</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {services.map((service) => (
                  <TableRow key={service._id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        {service.images && service.images[0] && (
                          <img
                            src={service.images[0].url}
                            alt={service.title}
                            className="w-10 h-10 rounded object-cover"
                          />
                        )}
                        <div>
                          <p className="font-medium">{service.title}</p>
                          <p className="text-sm text-gray-500 capitalize">{service.type}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">
                          {typeof service.vendor === 'object' ? service.vendor?.name : 'Unknown Vendor'}
                        </p>
                        <p className="text-sm text-gray-500">
                          {typeof service.vendor === 'object' ? service.vendor?.company : 'No Company'}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{service.category?.name || service.category}</Badge>
                    </TableCell>
                    <TableCell>{service.location}</TableCell>
                    <TableCell>{getStatusBadge(service.status || 'active')}</TableCell>
                    <TableCell>
                      {new Date(service.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEditService(service)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Edit Service</p>
                          </TooltipContent>
                        </Tooltip>

                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              size="sm"
                              variant={service.status === 'active' ? 'destructive' : 'default'}
                              onClick={() => handleStatusToggle(service._id, service.status || 'active')}
                              className={service.status === 'active' ? '' : 'bg-green-600 hover:bg-green-700'}
                            >
                              {service.status === 'active' ? (
                                <XCircle className="w-4 h-4" />
                              ) : (
                                <CheckCircle className="w-4 h-4" />
                              )}
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{service.status === 'active' ? 'Deactivate Service' : 'Activate Service'}</p>
                          </TooltipContent>
                        </Tooltip>

                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDeleteService(service)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Delete Service</p>
                          </TooltipContent>
                        </Tooltip>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => window.open(`/service/${service._id}`, '_blank')}
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleEditService(service)}
                            >
                              <Edit className="mr-2 h-4 w-4" />
                              Edit Service
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleStatusToggle(service._id, service.status || 'active')}
                              className={service.status === 'active' ? 'text-red-600' : 'text-green-600'}
                            >
                              {service.status === 'active' ? (
                                <>
                                  <XCircle className="mr-2 h-4 w-4" />
                                  Deactivate
                                </>
                              ) : (
                                <>
                                  <CheckCircle className="mr-2 h-4 w-4" />
                                  Activate
                                </>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDeleteService(service)}
                              className="text-red-600"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete Service
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {services.length === 0 && !loading && (
            <div className="text-center py-8">
              <p className="text-gray-500">No services found matching your criteria.</p>
            </div>
          )}

          {/* Pagination Controls */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-4 pt-4 border-t">
            {/* Left Info */}
            <p className="text-sm text-gray-600 text-center sm:text-left order-2 sm:order-1">
              Page {currentPage} of {totalPages} &bull; {totalCount} total services
            </p>

            {/* Center: Pagination buttons */}
            {totalPages > 1 && (
              <div className="flex items-center gap-1.5 order-1 sm:order-2">
                {/* Previous */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage <= 1 || loading}
                  className="h-8 px-2.5"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span className="hidden sm:inline ml-1">Previous</span>
                </Button>

                {/* Page Numbers */}
                <div className="flex gap-1">
                  {(() => {
                    const pages: number[] = [];
                    const maxVisible = 5;

                    let start = Math.max(
                      1,
                      currentPage - Math.floor(maxVisible / 2)
                    );

                    let end = Math.min(
                      totalPages,
                      start + maxVisible - 1
                    );

                    if (end - start + 1 < maxVisible) {
                      start = Math.max(1, end - maxVisible + 1);
                    }

                    for (let i = start; i <= end; i++) {
                      pages.push(i);
                    }

                    return pages.map((p) => (
                      <Button
                        key={p}
                        variant={p === currentPage ? "default" : "outline"}
                        size="sm"
                        onClick={() => handlePageChange(p)}
                        disabled={loading}
                        className={`w-8 h-8 p-0 text-xs ${p === currentPage
                          ? "bg-blue-600 text-white"
                          : ""
                          }`}
                      >
                        {p}
                      </Button>
                    ));
                  })()}
                </div>

                {/* Next */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage >= totalPages || loading}
                  className="h-8 px-2.5"
                >
                  <span className="hidden sm:inline mr-1">Next</span>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            )}

            {/* Right: Rows per page dropdown */}
            <div className="flex items-center gap-2 order-3">
              <span className="text-sm text-gray-500 whitespace-nowrap">Rows per page:</span>
              <Select
                value={showCustomPageSize ? "custom" : (limit >= 99999 ? "all" : String(limit))}
                onValueChange={(value) => {
                  if (value === "custom") {
                    setShowCustomPageSize(true);
                  } else if (value === "all") {
                    setShowCustomPageSize(false);
                    setCustomPageSizeInput("");
                    setLimit(99999);
                    setCurrentPage(1);
                    fetchServices(1, searchTerm, statusFilter, 99999);
                  } else {
                    setShowCustomPageSize(false);
                    setCustomPageSizeInput("");
                    const size = parseInt(value);
                    if (limit !== size) {
                      setLimit(size);
                      setCurrentPage(1);
                      fetchServices(1, searchTerm, statusFilter, size);
                    }
                  }
                }}
              >
                <SelectTrigger className="w-[90px] h-8 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>
              {showCustomPageSize && (
                <div className="flex items-center gap-1.5">
                  <Input
                    type="number"
                    min="1"
                    max="500"
                    placeholder="e.g. 25"
                    value={customPageSizeInput}
                    onChange={(e) => setCustomPageSizeInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        const val = parseInt(customPageSizeInput);
                        if (val && val > 0 && val <= 500) {
                          setLimit(val);
                          setCurrentPage(1);
                          setShowCustomPageSize(false);
                          fetchServices(1, searchTerm, statusFilter, val);
                        }
                      }
                    }}
                    className="h-8 w-20 text-sm"
                  />
                  <Button
                    size="sm"
                    className="h-8 px-3 text-xs"
                    onClick={() => {
                      const val = parseInt(customPageSizeInput);
                      if (val && val > 0 && val <= 500) {
                        setLimit(val);
                        setCurrentPage(1);
                        setShowCustomPageSize(false);
                        fetchServices(1, searchTerm, statusFilter, val);
                      }
                    }}
                  >
                    Go
                  </Button>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Edit Service Modal */}
      <AdminEditServiceModal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        service={selectedService}
        onSave={handleSaveService}
        fetchServices={fetchServices}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Service</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{serviceToDelete?.title}"? This action cannot be undone.
              The service will be permanently removed from the system.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteService}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete Service
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminServices;