import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  MapPin,
  Share2,
  Send,
  ChevronLeft,
  ChevronRight,
  Phone,
  Mail,
  Star,
  Clock,
  CheckCircle,
  Calendar,
  Eye,
  Heart,
  Shield,
  ThumbsUp,
  Camera,
  Globe,
  MessageSquare,
  Copy,
  X,
  Building,
  LocateIcon,
} from "lucide-react";
import { toast } from "sonner";
import { getPropertyBYIDAPI } from "@/service/operations/property";
import { createAuditForPropertyCallAndEmailAPI } from "@/service/operations/audit";
import { createContactAPI } from "@/service/operations/contact";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import DisplayRating from "./DisplayRating";
import BookNowModal from "./BookNowModal";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const toPascalCase = (text) => {
  if (!text) return "";
  // Handle objects with name property (like category objects)
  const str = typeof text === 'string' ? text : text.name || String(text);
  return str
    .toLowerCase()
    .replace(/\b\w/g, char => char.toUpperCase());
};

const PropertyDetails = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isSaved, setIsSaved] = useState(false);
  const [showPhone, setShowPhone] = useState(false);
  const [isShowingNumber, setIsShowingNumber] = useState(false);
  const [showProviderPhone, setShowProviderPhone] = useState(false);
  const [isShowingProviderNumber, setIsShowingProviderNumber] = useState(false);
  const { token, user } = useSelector((state: RootState) => state.auth);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        setLoading(true);
        const userId = user?._id;
        const response = await getPropertyBYIDAPI(id, userId);
        if (response) {
          setProperty(response);
        } else {
          toast.error(toPascalCase("Service Not Found"));
        }
      } catch (error) {
        console.error("Error fetching property:", error);
        toast.error(toPascalCase("Failed To Load Service Details"));
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchProperty();
  }, [id, user]);

  const getPropertyImages = () => {
    if (property?.images?.length > 0) return property.images;
    if (property?.image) return [{ url: property.image }];
    return [{ url: "https://via.placeholder.com/800x600?text=No+Image" }];
  };

  const propertyImages = getPropertyImages();

  const nextImage = () => setCurrentImageIndex((prev) => (prev + 1) % propertyImages.length);
  const prevImage = () => setCurrentImageIndex((prev) => (prev - 1 + propertyImages.length) % propertyImages.length);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) {
      toast.error(toPascalCase("Please Fill Required Fields"));
      return;
    }
    try {
      setIsSubmitting(true);
      const response = await createContactAPI({
        ...formData,
        property,
        user: user?._id,
      });
      if (response) {
        toast.success(toPascalCase("Enquiry Sent Successfully!"));
        setIsModalOpen(false);
        setFormData({ name: "", email: "", phone: "", message: "" });
      }
    } catch (error) {
      toast.error(toPascalCase("Failed To Send Enquiry"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success(toPascalCase("Link Copied!"));
  };

  const handleCall = async () => {
    if (!property?.vendor?.phone) {
      toast.error(toPascalCase("Phone Not Available"));
      return;
    }
    try {
      if (user?._id) await createAuditForPropertyCallAndEmailAPI(id, user._id, "phone");
      window.location.href = `tel:${property.vendor.phone}`;
    } catch (error) {
      console.error(error);
    }
  };

  const handleShowNumber = async () => {
    // Check if user is logged in
    if (!token) {
      toast.error(toPascalCase("Please Login To View Number"));
      navigate("/login");
      return;
    }

    try {
      setIsShowingNumber(true);
      // Create audit log for show number action
      if (user?._id) {
        await createAuditForPropertyCallAndEmailAPI(id, user._id, "show_number");
      }
      setShowPhone(true);
      toast.success(toPascalCase("Number Revealed!"));
    } catch (error) {
      console.error("Error logging show number action:", error);
      // Still show the number even if logging fails
      setShowPhone(true);
    } finally {
      setIsShowingNumber(false);
    }
  };

  const handleShowProviderNumber = async () => {
    // Check if user is logged in
    if (!token) {
      toast.error(toPascalCase("Please Login To View Number"));
      navigate("/login");
      return;
    }

    try {
      setIsShowingProviderNumber(true);
      // Create audit log for show provider number action
      if (user?._id) {
        await createAuditForPropertyCallAndEmailAPI(id, user._id, "show_provider_number");
      }
      setShowProviderPhone(true);
      toast.success(toPascalCase("Provider Number Revealed!"));
    } catch (error) {
      console.error("Error logging show provider number action:", error);
      // Still show the number even if logging fails
      setShowProviderPhone(true);
    } finally {
      setIsShowingProviderNumber(false);
    }
  };

  const getAverageRating = () => {
    if (!property?.review?.length) return 0;
    const total = property.review.reduce((acc, r) => acc + (r.rating || 0), 0);
    return (total / property.review.length).toFixed(1);
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 4) return "bg-green-600";
    if (rating >= 3) return "bg-yellow-500";
    return "bg-orange-500";
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </>
    );
  }

  if (!property) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
          <h2 className="text-xl font-bold mb-4">{toPascalCase("Service Not Found")}</h2>
          <button onClick={() => navigate("/services")} className="px-6 py-2 bg-blue-600 text-white rounded-lg">
            {toPascalCase("Back To Services")}
          </button>
        </div>
      </>
    );
  }

  const avgRating = Number(getAverageRating());
  const reviewCount = property.review?.length || 0;
  const vendorPhone = property.vendor?.phone || "+91 78798 84363";

  return (
    <>
      <Navbar />
      <div className="bg-gray-100 min-h-screen">
        {/* Breadcrumb */}
        <div className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 py-3">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <button onClick={() => navigate("/")} className="hover:text-blue-600">{toPascalCase("Home")}</button>
              <span>/</span>
              <button onClick={() => navigate("/services")} className="hover:text-blue-600">{toPascalCase("Services")}</button>
              <span>/</span>
              <span className="text-gray-900 font-medium truncate">{toPascalCase(property.title)}</span>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-5">
          {/* Main Card */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            {/* Top Section */}
            <div className="flex flex-col lg:flex-row">
              {/* Image Gallery */}
              <div className="lg:w-[400px] flex-shrink-0">
                <div className="relative h-[280px] lg:h-[320px] bg-gray-200">
                  <img
                    src={propertyImages[currentImageIndex]?.url}
                    alt={property.title}
                    className="w-full h-full object-cover"
                  />
                  {propertyImages.length > 1 && (
                    <>
                      <button onClick={prevImage} className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center text-white">
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                      <button onClick={nextImage} className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center text-white">
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </>
                  )}
                  <div className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
                    <Camera className="w-3 h-3" />
                    {currentImageIndex }/{propertyImages.length}
                  </div>
                  <button
                    onClick={() => setIsSaved(!isSaved)}
                    className="absolute top-2 right-2 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow"
                  >
                    <Heart className={`w-4 h-4 ${isSaved ? "fill-red-500 text-red-500" : "text-gray-400"}`} />
                  </button>
                </div>
                {propertyImages.length > 1 && (
                  <div className="flex gap-1 p-2 bg-gray-50 overflow-x-auto">
                    {propertyImages.slice(0, 5).map((img, idx) => (
                      <button
                        key={idx}
                        onClick={() => setCurrentImageIndex(idx)}
                        className={`flex-shrink-0 w-14 h-10 rounded overflow-hidden border-2 ${idx === currentImageIndex ? "border-blue-600" : "border-transparent"}`}
                      >
                        <img src={img.url} alt="" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Main Info and Service Provider Section */}
              <div className="flex-1 flex flex-col lg:flex-row">
                {/* Info Section */}
                <div className="flex-1 p-5">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div>
                      <h1 className="text-xl lg:text-2xl font-bold text-gray-900 mb-1">{toPascalCase(property.title)}</h1>
                      <p className="text-gray-500 flex items-center gap-1 text-sm">
                        <MapPin className="w-4 h-4" />
                        {toPascalCase(property.location) || toPascalCase("Location Not Specified")}
                      </p>
                    </div>
                    {avgRating > 0 && (
                      <div className={`${getRatingColor(avgRating)} text-white px-3 py-1.5 rounded-lg flex items-center gap-1 flex-shrink-0`}>
                        <span className="font-bold text-lg">{avgRating}</span>
                        <Star className="w-4 h-4 fill-white" />
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-3 mb-4">
                    {avgRating > 0 && (
                      <>
                        <span className="text-sm text-gray-600">{reviewCount} {toPascalCase("Ratings")}</span>
                        <span className="text-gray-300">|</span>
                      </>
                    )}
                    {property.category && (
                      <span className="text-sm bg-blue-50 text-blue-700 px-2 py-0.5 rounded">{toPascalCase(property.category)}</span>
                    )}
                    {property.verified && (
                      <span className="text-sm text-green-600 flex items-center gap-1">
                        <CheckCircle className="w-4 h-4" /> {toPascalCase("Verified")}
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className="inline-flex items-center gap-1 text-xs bg-green-50 text-green-700 px-2 py-1 rounded">
                      <Clock className="w-3 h-3" /> {toPascalCase("Open Now")}
                    </span>
                    <span className="inline-flex items-center gap-1 text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded">
                      <ThumbsUp className="w-3 h-3" /> {toPascalCase("Trusted")}
                    </span>
                    <span className="inline-flex items-center gap-1 text-xs bg-purple-50 text-purple-700 px-2 py-1 rounded">
                      <Shield className="w-3 h-3" /> {toPascalCase("Safe")}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-3 mb-4">
                    {!showPhone ? (
                      <button
                        onClick={handleShowNumber}
                        disabled={isShowingNumber}
                        className="flex items-center gap-2 px-5 py-2.5 bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-lg"
                      >
                        {isShowingNumber ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            {toPascalCase("Loading...")}
                          </>
                        ) : (
                          <>
                            <Phone className="w-4 h-4" />
                            {toPascalCase("Show Number")}
                          </>
                        )}
                      </button>
                    ) : (
                      <div className="flex items-center gap-2">
                        <a
                          href={`tel:${vendorPhone}`}
                          onClick={handleCall}
                          className="flex items-center gap-2 px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg"
                        >
                          <Phone className="w-4 h-4" />
                          {vendorPhone}
                        </a>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(vendorPhone);
                            toast.success(toPascalCase("Number Copied!"));
                          }}
                          className="p-2.5 border border-gray-300 rounded-lg hover:bg-gray-50"
                        >
                          <Copy className="w-4 h-4 text-gray-500" />
                        </button>
                      </div>
                    )}
                    <button
                      onClick={() => token ? setIsModalOpen(true) : navigate("/login")}
                      className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg"
                    >
                      <MessageSquare className="w-4 h-4" />
                      {toPascalCase("Send Enquiry")}
                    </button>
                  </div>

                  <div className="flex items-center gap-4 pt-3 border-t border-gray-100">
                    <button onClick={handleShare} className="flex items-center gap-1 text-sm text-gray-500 hover:text-blue-600">
                      <Share2 className="w-4 h-4" /> {toPascalCase("Share")}
                    </button>
                  </div>
                </div>

                {/* Service Provider Information - Top Right */}
                <div className="lg:w-[300px] flex-shrink-0 p-5 border-l border-gray-100">
                  <h3 className="font-bold text-gray-900 mb-4">{toPascalCase("Service Provider Information")}</h3>
                  <div className="space-y-4">
                    {/* Provider Basic Info */}
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center text-white text-lg font-bold">
                        {property.vendor?.name?.charAt(0) || "S"}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 text-sm">{toPascalCase(property.vendor?.company) || toPascalCase("Professional Services")}</p>
                        <p className="text-xs text-gray-500">{toPascalCase(property.vendor?.name) || toPascalCase("Service Provider")}</p>
                      </div>
                    </div>
                    
                    {/* Provider Details - Compact version */}
                    <div className="space-y-3 pt-3 border-t border-gray-100">
                      {/* Type of Service */}
                      <div className="flex items-start gap-2">
                        <Building className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-xs font-medium text-gray-700">{toPascalCase("Type Of Service")}</p>
                          <p className="text-xs text-gray-600">
                            {toPascalCase(property.vendor?.typeOfService) || <span className="text-gray-400 italic">{toPascalCase("Not Added")}</span>}
                          </p>
                        </div>
                      </div>
                      
                      {/* Year of Establishment */}
                      <div className="flex items-start gap-2">
                        <Calendar className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-xs font-medium text-gray-700">{toPascalCase("Year Of Establishment")}</p>
                          <p className="text-xs text-gray-600">
                            {property.vendor?.yearOfEstablishment || <span className="text-gray-400 italic">{toPascalCase("Not Added")}</span>}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <LocateIcon className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-xs font-medium text-gray-700">{toPascalCase("Address")}</p>
                          <p className="text-xs text-gray-600">
                            {toPascalCase(property.vendor?.address) || <span className="text-gray-400 italic">{toPascalCase("Not Added")}</span>}
                          </p>
                        </div>
                      </div>
                      
                      {/* Experience Fields */}
                      <div className="flex items-start gap-2">
                        <Star className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-xs font-medium text-gray-700">{toPascalCase("Experience")}</p>
                          {property.vendor?.experience?.fields?.length > 0 ? (
                            <div>
                              <p className="text-xs text-gray-600">{property.vendor.experience.fields.slice(0, 2).map(field => toPascalCase(field)).join(", ")}</p>
                              {property.vendor.experience.totalYears && (
                                <p className="text-xs text-gray-500">{property.vendor.experience.totalYears} {toPascalCase("Years")}</p>
                              )}
                            </div>
                          ) : (
                            <p className="text-xs text-gray-400 italic">{toPascalCase("Not Added")}</p>
                          )}
                        </div>
                      </div>
                      
                      {/* Phone Number with Show Button Flow */}
                      <div className="flex items-start gap-2">
                        <Phone className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <p className="text-xs font-medium text-gray-700">{toPascalCase("Phone")}</p>
                          {property.vendor?.phone ? (
                            !showProviderPhone ? (
                              <button
                                onClick={handleShowProviderNumber}
                                disabled={isShowingProviderNumber}
                                className="text-xs bg-green-100 hover:bg-green-200 disabled:opacity-50 disabled:cursor-not-allowed text-green-700 px-2 py-1 rounded font-medium mt-1"
                              >
                                {isShowingProviderNumber ? toPascalCase("Loading...") : toPascalCase("Show Number")}
                              </button>
                            ) : (
                              <div className="flex items-center gap-1 mt-1">
                                <p className="text-xs text-gray-600">{property.vendor.phone}</p>
                                <button
                                  onClick={() => {
                                    navigator.clipboard.writeText(property.vendor.phone);
                                    toast.success(toPascalCase("Number Copied!"));
                                  }}
                                  className="p-0.5 hover:bg-gray-100 rounded"
                                >
                                  <Copy className="w-3 h-3 text-gray-400" />
                                </button>
                              </div>
                            )
                          ) : (
                            <p className="text-xs text-gray-400 italic">{toPascalCase("Not Added")}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mt-5">
            <div className="lg:col-span-2 space-y-5">
              <div className="bg-white rounded-lg p-5 shadow-sm">
                <h2 className="text-lg font-bold text-gray-900 mb-3">{toPascalCase("About")}</h2>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {toPascalCase(property.description) || toPascalCase("Professional Service Provider Offering Quality Services At Competitive Prices.")}
                </p>
              </div>

              <div className="bg-white rounded-lg p-5 shadow-sm">
                <h2 className="text-lg font-bold text-gray-900 mb-3">{toPascalCase("Services Offered")}</h2>
                <div className="flex flex-wrap gap-2">
                  {[toPascalCase("Professional Service"), toPascalCase("Home Visit"), toPascalCase("Online Consultation"), toPascalCase("24/7 Support"), toPascalCase("Affordable Pricing")].map((s, i) => (
                    <span key={i} className="text-sm bg-gray-100 text-gray-700 px-3 py-1.5 rounded-full">{s}</span>
                  ))}
                </div>
              </div>

              {/* Working Hours - Show workingDaysTimings directly */}
              <div className="bg-white rounded-lg p-5 shadow-sm">
                <h2 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-blue-600" /> {toPascalCase("Working Hours")}
                </h2>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-gray-700 font-medium">
                    {toPascalCase(property.vendor?.workingDaysTimings) || "Monday - Saturday: 9:00 AM - 6:00 PM"}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-5">
              <div className="bg-white rounded-lg p-5 shadow-sm">
                <h3 className="font-bold text-gray-900 mb-4">{toPascalCase("Quick Contact")}</h3>
                <div className="space-y-3">
                  {!showPhone ? (
                    <button
                      onClick={handleShowNumber}
                      disabled={isShowingNumber}
                      className="flex items-center gap-3 p-3 bg-green-50 rounded-lg hover:bg-green-100 disabled:opacity-50 disabled:cursor-not-allowed w-full"
                    >
                      <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
                        {isShowingNumber ? (
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          <Phone className="w-5 h-5 text-white" />
                        )}
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">{toPascalCase("Call Now")}</p>
                        <p className="font-semibold text-green-700">
                          {isShowingNumber ? toPascalCase("Loading...") : toPascalCase("Show Number")}
                        </p>
                      </div>
                    </button>
                  ) : (
                    <a 
                      href={`tel:${vendorPhone}`} 
                      onClick={handleCall}
                      className="flex items-center gap-3 p-3 bg-green-50 rounded-lg hover:bg-green-100"
                    >
                      <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
                        <Phone className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">{toPascalCase("Call Now")}</p>
                        <p className="font-semibold text-green-700">{vendorPhone}</p>
                      </div>
                    </a>
                  )}
                  {property.vendor?.email && (
                    <a href={`mailto:${property.vendor.email}`} className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg hover:bg-blue-100">
                      <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                        <Mail className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">{toPascalCase("Email")}</p>
                        <p className="font-semibold text-blue-700 text-sm truncate">{property.vendor.email}</p>
                      </div>
                    </a>
                  )}
                </div>
                <div className="mt-4">
                  <BookNowModal property={property} />
                </div>
              </div>
            </div>
          </div>

          {/* Reviews and Ratings - Full Width */}
          <div className="mt-5 ">
            <DisplayRating property={property} />
          </div>
        </div>

        {isModalOpen && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setIsModalOpen(false)}>
            <div className="bg-white rounded-xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between p-4 border-b">
                <h2 className="font-bold text-lg">{toPascalCase("Send Enquiry")}</h2>
                <button onClick={() => setIsModalOpen(false)} className="p-1 hover:bg-gray-100 rounded">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="p-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">{toPascalCase("Name")} *</label>
                  <input type="text" name="name" value={formData.name} onChange={handleInputChange} className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" required />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">{toPascalCase("Phone")} *</label>
                  <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" required />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">{toPascalCase("Email")}</label>
                  <input type="email" name="email" value={formData.email} onChange={handleInputChange} className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">{toPascalCase("Message")}</label>
                  <textarea name="message" value={formData.message} onChange={handleInputChange} rows={3} className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
                </div>
                <button type="submit" disabled={isSubmitting} className="w-full py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2">
                  {isSubmitting ? toPascalCase("Sending...") : <><Send className="w-4 h-4" /> {toPascalCase("Send Enquiry")}</>}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </>
  );
};

export default PropertyDetails;
