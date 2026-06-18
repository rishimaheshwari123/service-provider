"use client";

import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "@/redux/store";
import { getVendorContactAPI } from "@/service/operations/contact";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Search,
  Mail,
  Phone,
  Calendar,
  User,
  MessageSquare,
  AlertCircle,
  Eye,
  Reply,
} from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
// Types
interface Property {
  _id: string;
  title: string;
  description: string;
  type: string;
  location: string;
  price: string;
  area: string;
  bedrooms: string;
  bathrooms: string;
  image: string;
  vendor: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

interface Inquiry {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  message: string;
  property: Property;
  vendor: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

const VendorGetInquiry = () => {
  const user = useSelector((state: RootState) => state.auth?.user ?? null);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchInput, setSearchInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);

  const fetchInquiries = async () => {
    if (!user?._id) {
      setError("User not found");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await getVendorContactAPI(user._id);
      setInquiries(response || []);
      setError(null);
    } catch (err) {
      setError("Failed to fetch inquiries");
      console.error("Error fetching inquiries:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInquiries();
  }, [user?._id]);

  // Filter inquiries based on search
  const filteredInquiries =
    inquiries?.filter((inquiry) => {
      const matchesSearch =
        inquiry?.name?.toLowerCase()?.includes(searchTerm?.toLowerCase()) ||
        inquiry?.message?.toLowerCase()?.includes(searchTerm?.toLowerCase()) ||
        inquiry?.email?.toLowerCase()?.includes(searchTerm?.toLowerCase()) ||
        inquiry?.property?.title
          ?.toLowerCase()
          ?.includes(searchTerm?.toLowerCase()) ||
        inquiry?.property?.location
          ?.toLowerCase()
          ?.includes(searchTerm?.toLowerCase()) ||
        inquiry?.property?.type
          ?.toLowerCase()
          ?.includes(searchTerm?.toLowerCase());

      return matchesSearch;
    }) || [];

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleDownloadPDF = () => {
    const doc = new jsPDF();

    // Title
    doc.text("Property Inquiries", 14, 10);

    // Table data
    const tableColumn = [
      "Property Name",
      "Customer Name",
      "Email",
      "Phone",
      "Type",
      "Message",
    ];
    const tableRows = filteredInquiries.map((inquiry) => [
      inquiry?.property?.title,
      inquiry?.name,
      inquiry.email,
      inquiry.phone,
      inquiry.property?.type,
      inquiry.message,
    ]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 20,
      styles: { fontSize: 8 },
    });

    doc.save("inquiries.pdf");
  };

  const formatPrice = (price: string) => {
    return price ? `₹${price}` : "N/A";
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="flex items-center justify-center h-64">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                Error Loading Inquiries
              </h3>
              <p className="text-muted-foreground mb-4">{error}</p>
              <Button onClick={fetchInquiries}>Try Again</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="md:ml-8">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
        <div className="text-center md:text-left">
          <h1 className="text-2xl md:text-3xl font-bold">Customer Inquiries</h1>

          <p className="text-sm md:text-base text-muted-foreground mt-1">
            Manage and respond to customer inquiries and support requests
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
          <button
            onClick={handleDownloadPDF}
            className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          >
            Download PDF
          </button>

          <Badge
            variant="outline"
            className="w-full sm:w-auto justify-center text-sm py-2"
          >
            {filteredInquiries?.length || 0} inquiries
          </Badge>

          <Button
            onClick={fetchInquiries}
            variant="outline"
            size="sm"
            className="w-full sm:w-auto"
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setSearchTerm(searchInput);
            }}
            className="flex gap-2 relative"
          >
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by customer name, email, service title, location, or type..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="pl-10 pr-10 h-10 text-sm"
              />
              {searchInput && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchInput("");
                    setSearchTerm("");
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs font-bold"
                >
                  ✕
                </button>
              )}
            </div>
            <Button
              type="submit"
              className="px-4 h-10 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-lg shadow-sm transition duration-150 flex-shrink-0 flex items-center justify-center gap-1.5"
            >
              <Search className="w-4 h-4" />
              Search
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Inquiries Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            All Inquiries
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {filteredInquiries.length === 0 ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  No Inquiries Found
                </h3>
                <p className="text-muted-foreground">
                  {searchTerm
                    ? "Try adjusting your search terms"
                    : "You haven't received any inquiries yet"}
                </p>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[100px]">Customer</TableHead>
                    <TableHead>Contact Info</TableHead>
                    <TableHead>Message</TableHead>
                    <TableHead>Services</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredInquiries.map((inquiry) => (
                    <TableRow key={inquiry._id} className="hover:bg-muted/50">
                      {/* Customer */}
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Avatar className="h-8 w-8">
                            <AvatarImage
                              src={
                                inquiry?.property?.image ||
                                `/placeholder.svg?height=32&width=32`
                              }
                            />
                            <AvatarFallback className="text-xs">
                              {inquiry?.name
                                ?.split(" ")
                                ?.map((n) => n?.[0])
                                ?.join("")
                                ?.toUpperCase() || "?"}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-sm">
                              {inquiry?.name || "Unknown"}
                            </p>
                            <Badge variant="outline" className="text-xs">
                              {inquiry?.property?.type || "N/A"}
                            </Badge>
                          </div>
                        </div>
                      </TableCell>

                      {/* Contact Info */}
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-1 text-xs">
                            <Mail className="h-3 w-3" />
                            <span
                              className="truncate max-w-[150px]"
                              title={inquiry?.email}
                            >
                              {inquiry?.email || "No email"}
                            </span>
                          </div>
                          {inquiry?.phone && (
                            <div className="flex items-center gap-1 text-xs">
                              <Phone className="h-3 w-3" />
                              <span>{inquiry?.phone}</span>
                            </div>
                          )}
                        </div>
                      </TableCell>

                      {/* Message */}
                      <TableCell>
                        <div className="max-w-[200px]">
                          <p
                            className="text-sm truncate"
                            title={inquiry?.message}
                          >
                            {inquiry?.message || "No message"}
                          </p>
                          {inquiry?.message &&
                            inquiry?.message?.length > 50 && (
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button
                                    variant="link"
                                    size="sm"
                                    className="h-auto p-0 text-xs"
                                  >
                                    Read more
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>Customer Message</DialogTitle>
                                    <DialogDescription>
                                      Message from {inquiry?.name}
                                    </DialogDescription>
                                  </DialogHeader>
                                  <div className="mt-4">
                                    <p className="text-sm leading-relaxed">
                                      {inquiry?.message}
                                    </p>
                                  </div>
                                </DialogContent>
                              </Dialog>
                            )}
                        </div>
                      </TableCell>

                      {/* Property */}
                      <TableCell>
                        <div className="space-y-1">
                          <p
                            className="font-medium text-sm truncate max-w-[150px]"
                            title={inquiry?.property?.title}
                          >
                            {inquiry?.property?.title || "N/A"}
                          </p>
                          <p
                            className="text-xs text-muted-foreground truncate max-w-[150px]"
                            title={inquiry?.property?.description}
                          >
                            {inquiry?.property?.description || "No description"}
                          </p>
                        </div>
                      </TableCell>

                      {/* Location */}
                      <TableCell>
                        <p className="text-sm capitalize">
                          {inquiry?.property?.location || "N/A"}
                        </p>
                      </TableCell>

                      {/* Price */}
                      <TableCell>
                        <p className="font-medium text-sm">
                          {formatPrice(inquiry?.property?.price)}
                        </p>
                      </TableCell>

                      {/* Date */}
                      <TableCell>
                        <div className="flex items-center gap-1 text-xs">
                          <Calendar className="h-3 w-3" />
                          <span>{formatDate(inquiry?.createdAt)}</span>
                        </div>
                      </TableCell>

                      {/* Actions */}
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm">
                                <Eye className="h-3 w-3 mr-1" />
                                View
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                              <DialogHeader>
                                <DialogTitle>Inquiry Details</DialogTitle>
                                <DialogDescription>
                                  Complete inquiry information from{" "}
                                  {inquiry?.name}
                                </DialogDescription>
                              </DialogHeader>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                                {/* Customer Info */}
                                <div className="space-y-4">
                                  <h4 className="font-semibold">
                                    Customer Information
                                  </h4>
                                  <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                      <User className="h-4 w-4 text-muted-foreground" />
                                      <span className="text-sm">
                                        {inquiry?.name || "Unknown"}
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <Mail className="h-4 w-4 text-muted-foreground" />
                                      <span className="text-sm">
                                        {inquiry?.email || "No email"}
                                      </span>
                                    </div>
                                    {inquiry?.phone && (
                                      <div className="flex items-center gap-2">
                                        <Phone className="h-4 w-4 text-muted-foreground" />
                                        <span className="text-sm">
                                          {inquiry?.phone}
                                        </span>
                                      </div>
                                    )}
                                  </div>

                                  <div>
                                    <h5 className="font-medium mb-2">
                                      Message
                                    </h5>
                                    <p className="text-sm bg-muted p-3 rounded-lg leading-relaxed">
                                      {inquiry?.message ||
                                        "No message provided"}
                                    </p>
                                  </div>
                                </div>

                                {/* Property Info */}
                                <div className="space-y-4">
                                  <h4 className="font-semibold">
                                    Service Information
                                  </h4>
                                  {inquiry?.property?.image && (
                                    <div className="w-full h-32 rounded-lg overflow-hidden">
                                      <img
                                        src={
                                          inquiry?.property?.image ||
                                          "/placeholder.svg"
                                        }
                                        alt={
                                          inquiry?.property?.title || "Property"
                                        }
                                        className="w-full h-full object-cover"
                                      />
                                    </div>
                                  )}
                                  <div className="space-y-2">
                                    <div>
                                      <span className="text-sm font-medium">
                                        Title:{" "}
                                      </span>
                                      <span className="text-sm">
                                        {inquiry?.property?.title || "N/A"}
                                      </span>
                                    </div>
                                    <div>
                                      <span className="text-sm font-medium">
                                        Type:{" "}
                                      </span>
                                      <span className="text-sm capitalize">
                                        {inquiry?.property?.type || "N/A"}
                                      </span>
                                    </div>
                                    <div>
                                      <span className="text-sm font-medium">
                                        Location:{" "}
                                      </span>
                                      <span className="text-sm capitalize">
                                        {inquiry?.property?.location || "N/A"}
                                      </span>
                                    </div>
                                    <div>
                                      <span className="text-sm font-medium">
                                        Price:{" "}
                                      </span>
                                      <span className="text-sm">
                                        {formatPrice(inquiry?.property?.price)}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              <div className="flex gap-2 mt-6">
                                <div className="flex gap-2 mt-6">
                                  <a href={`tel:${inquiry?.phone}`}>
                                    <Button variant="outline">
                                      <Phone className="h-4 w-4 mr-2" />
                                      Call
                                    </Button>
                                  </a>
                                  <a href={`mailto:${inquiry?.email}`}>
                                    <Button variant="outline">
                                      <Mail className="h-4 w-4 mr-2" />
                                      Email
                                    </Button>
                                  </a>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default VendorGetInquiry;
