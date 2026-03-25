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
} from "lucide-react";
import { updatePropertyStatusAPI, deletePropertyAPI } from "@/service/operations/property";
import { AdminEditServiceModal } from "./AdminEditServiceModal.tsx";
import { BASE_URL } from "@/service/apis";
import * as XLSX from "xlsx";

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
  const [filteredServices, setFilteredServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [serviceToDelete, setServiceToDelete] = useState<Service | null>(null);
  const { toast } = useToast();

  const fetchServices = async () => {
    try {
      setLoading(true);
      // For admin, we need to fetch all services (active and inactive)
      // We'll modify the API call to include inactive services for admin
      const response = await fetch(`${BASE_URL}/property/getAll?includeInactive=true`);
      const data = await response.json();
      
      if (data.success) {
        setServices(data.properties || []);
        setFilteredServices(data.properties || []);
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
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  useEffect(() => {
    let filtered = services;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (service) =>
          service.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (typeof service.vendor === 'object' && service.vendor?.name?.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (typeof service.vendor === 'object' && service.vendor?.company?.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (service.category?.name || service.category || '').toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter((service) => service.status === statusFilter);
    }

    setFilteredServices(filtered);
  }, [services, searchTerm, statusFilter]);

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

  const handleSaveService = (updatedService: Service) => {
    setServices(
      services.map((s) => (s._id === updatedService._id ? updatedService : s))
    );
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
    // Prepare comprehensive services data for Excel export
    const excelData = filteredServices.map((service) => ({
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
      description: `Downloaded ${filteredServices.length} services to Excel file`,
    });
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Services Management</h1>
            <p className="text-gray-600">Loading services...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Services Management</h1>
          <p className="text-gray-600">Manage all services across the platform</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleDownloadExcel}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition flex items-center gap-2"
          >
            <FileText className="w-4 h-4" />
            Download Excel
          </button>
          <Button
            variant="outline"
            onClick={fetchServices}
            disabled={loading}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search services, vendors, or categories..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="w-full md:w-48">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
      <Card>
        <CardHeader>
          <CardTitle>
            Services ({filteredServices.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
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
                {filteredServices.map((service) => (
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
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEditService(service)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
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
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDeleteService(service)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
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
          
          {filteredServices.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">No services found matching your criteria.</p>
            </div>
          )}
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