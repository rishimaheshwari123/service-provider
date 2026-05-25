"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, Briefcase } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "@/redux/store";
import {
  getVendorPropertyAPI,
  deletePropertyAPI,
  updatePropertyStatusAPI,
} from "@/service/operations/property";
import { toast } from "sonner";
import { EditServiceModal } from "./edit-property-modal";

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
  vendor: string;
}

const VendorServices = () => {
  const navigate = useNavigate();
  const user = useSelector((state: RootState) => state.auth?.user ?? null);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);

  const fetchServices = async () => {
    if (!user?._id) return;

    try {
      setLoading(true);
      const vendorServices = await getVendorPropertyAPI({ vendor: user._id });
      setServices(vendorServices);
    } catch (error) {
      console.error("Error fetching services:", error);
      toast.error("Failed to fetch services");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, [user]);

  const handleToggleStatus = async (
    serviceId: string,
    currentStatus: string,
  ) => {
    const newStatus = currentStatus === "active" ? "inactive" : "active";

    try {
      const result = await updatePropertyStatusAPI(serviceId, newStatus);
      if (result) {
        // Update local state
        setServices(
          services.map((service) =>
            service._id === serviceId
              ? { ...service, status: newStatus }
              : service,
          ),
        );
        toast.success(
          `Service ${newStatus === "active" ? "activated" : "deactivated"} successfully!`,
        );
      }
    } catch (error) {
      console.error("Error updating service status:", error);
      toast.error("Failed to update service status");
    }
  };

  const handleDelete = async (serviceId: string) => {
    setServices(services.filter((s) => s._id !== serviceId));
    await deletePropertyAPI(serviceId);
    toast.success("Service deleted successfully!");
  };

  const handleEditService = (service: Service) => {
    setSelectedService(service);
    setEditModalOpen(true);
  };

  const handleSaveService = (updatedService: Service) => {
    setServices(
      services.map((s) => (s._id === updatedService._id ? updatedService : s)),
    );
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Services</h1>
            <p className="text-gray-600">Loading your services...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
        <div className="text-center md:text-left">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            My Services
          </h1>

          <p className="text-sm md:text-base text-gray-600 mt-1">
            Manage your offered services
          </p>
        </div>

        <Button
          onClick={() => navigate("/vendor/services")}
          className="w-full md:w-auto gradient-gold text-white flex items-center justify-center"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Service
        </Button>
      </div>

      {services.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="space-y-4">
              <Briefcase className="w-16 h-16 mx-auto text-gray-400" />
              <div>
                <h3 className="text-lg font-medium text-gray-900">
                  No services yet
                </h3>
                <p className="text-gray-500">
                  Start by adding your first service listing
                </p>
              </div>
              <Button
                onClick={() => navigate("/vendor/services")}
                className="gradient-gold text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Service
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service) => (
            <Card key={service._id} className="overflow-hidden">
              {service.images && service.images.length > 0 && (
                <div className="aspect-video relative">
                  <img
                    src={service.images[0]?.url || "/placeholder.svg"}
                    alt={service.title}
                    className="w-full h-full object-cover"
                  />
                  <Badge
                    className={`absolute top-2 right-2 ${
                      service.status === "active"
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {service.status === "active" ? "Active" : "Inactive"}
                  </Badge>
                </div>
              )}
              <CardHeader>
                <CardTitle className="text-lg">{service.title}</CardTitle>
                <div className="flex items-center justify-between">
                  {/* <span className="text-2xl font-bold text-green-600">
                    ₹{service.price}
                  </span> */}
                  <span className="text-sm text-gray-500 capitalize">
                    {service.category?.name || service.category}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 mb-4">
                  {service.location && (
                    <p className="text-sm text-gray-600">{service.location}</p>
                  )}
                  <p className="text-sm text-gray-500 capitalize">
                    Type: {service.type}
                  </p>
                  {service.description && (
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {service.description}
                    </p>
                  )}
                </div>
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    variant={
                      service.status === "active" ? "destructive" : "default"
                    }
                    onClick={() =>
                      handleToggleStatus(
                        service._id,
                        service.status || "active",
                      )
                    }
                    className={
                      service.status === "active"
                        ? ""
                        : "bg-green-600 hover:bg-green-700"
                    }
                  >
                    {service.status === "active" ? "Deactivate" : "Activate"}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEditService(service)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDelete(service._id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <EditServiceModal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        service={selectedService}
        fetchServices={fetchServices}
      />
    </div>
  );
};

export default VendorServices;
