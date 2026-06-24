import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { apiConnector } from "@/service/apiConnector";
import { notification, category, image } from "@/service/apis";
import { toast } from "react-toastify";
import {
  BellRing,
  Smartphone,
  Users,
  UserCheck,
  Send,
  History,
  Image as ImageIcon,
  CheckCircle,
  XCircle,
  RefreshCw,
  Eye,
  Info,
  Upload,
  Link2,
  Plus,
  Trash2,
  Settings,
  Sliders
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

const { 
  SEND_NOTIFICATION_API, 
  GET_STATS_API, 
  GET_LOGS_API,
  GET_TOPICS,
  CREATE_TOPIC,
  UPDATE_TOPIC,
  DELETE_TOPIC,
  SUBSCRIBE_TO_TOPIC,
  UNSUBSCRIBE_FROM_TOPIC,
  GET_DEVICES
} = notification;

interface NotificationStats {
  totalDevices: number;
  guestDevices: number;
  userDevices: number;
  vendorDevices: number;
}

interface NotificationLog {
  _id: string;
  title?: string;
  body?: string;
  imageUrl?: string;
  type?: string;
  data?: Record<string, unknown>;
  userId?: string | null;
  vendorId?: string | null;
  isForGuest?: boolean;
  recipient: {
    name: string;
    email: string;
  };
  message: string;
  status: string;
  response?: {
    totalDevicesTargeted?: number;
    successCount?: number;
    failureCount?: number;
    formData?: {
      title?: string;
      body?: string;
      imageUrl?: string;
      targetType?: string;
      targetIds?: string;
      link?: string;
      type?: string;
      data?: Record<string, unknown>;
    };
  };
  createdAt: string;
}

interface TopicItem {
  _id: string;
  name: string;
  topicName: string;
  displayName: string;
  description?: string;
  isActive: boolean;
  subscriberCount: number;
  autoSubscribe: boolean;
  criteria?: any;
  createdAt: string;
}

interface CategoryItem {
  _id: string;
  name: string;
}

const SendNotifications: React.FC = () => {
  const user = useSelector((state: RootState) => state.auth.user);
  
  // Form State
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [targetType, setTargetType] = useState("all");
  const [link, setLink] = useState("");
  
  // Image Upload Source toggle
  const [imageSource, setImageSource] = useState<"url" | "upload">("url");
  const [uploadingImage, setUploadingImage] = useState(false);
  
  // Tab State
  const [activeTab, setActiveTab] = useState<"broadcast" | "topics">("broadcast");
  
  // Dashboard Metrics & Logs
  const [stats, setStats] = useState<NotificationStats>({
    totalDevices: 0,
    guestDevices: 0,
    userDevices: 0,
    vendorDevices: 0
  });
  const [logs, setLogs] = useState<NotificationLog[]>([]);
  const [topics, setTopics] = useState<TopicItem[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  
  // Loaders
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingLogs, setLoadingLogs] = useState(true);
  const [loadingTopics, setLoadingTopics] = useState(false);
  const [sending, setSending] = useState(false);
  const [creatingTopic, setCreatingTopic] = useState(false);

  // New Topic Form State
  const [topicName, setTopicName] = useState("");
  const [topicDisplayName, setTopicDisplayName] = useState("");
  const [topicDescription, setTopicDescription] = useState("");
  const [topicAutoSubscribe, setTopicAutoSubscribe] = useState(false);
  const [criteriaRole, setCriteriaRole] = useState("");
  const [criteriaPhoneVerified, setCriteriaPhoneVerified] = useState("");
  const [criteriaCategory, setCriteriaCategory] = useState("");
  const [criteriaLocation, setCriteriaLocation] = useState("");
  const [criteriaPincode, setCriteriaPincode] = useState("");
  const [criteriaPriceTier, setCriteriaPriceTier] = useState("");

  // Manual Subscribe / Unsubscribe Form State
  const [manualTopicId, setManualTopicId] = useState("");
  const [manualDeviceInput, setManualDeviceInput] = useState("");
  const [submittingManualAction, setSubmittingManualAction] = useState(false);

  // Registered Devices List State
  const [devicesList, setDevicesList] = useState<any[]>([]);
  const [loadingDevices, setLoadingDevices] = useState(false);
  const [selectedDeviceOption, setSelectedDeviceOption] = useState("");

  // Multi-select & Search Device State
  const [selectedDevices, setSelectedDevices] = useState<any[]>([]);
  const [deviceSearchQuery, setDeviceSearchQuery] = useState("");
  const [isDeviceDropdownOpen, setIsDeviceDropdownOpen] = useState(false);
  const [customDeviceText, setCustomDeviceText] = useState("");

  // Modal Popups State
  const [isEnrollModalOpen, setIsEnrollModalOpen] = useState(false);

  // Fetch Dashboard Stats
  const fetchStats = async () => {
    setLoadingStats(true);
    try {
      const response = await apiConnector("GET", GET_STATS_API);
      if (response?.data?.success) {
        setStats(response.data.stats);
      }
    } catch (error: any) {
      console.error("Failed to fetch notification stats:", error);
      toast.error("Failed to load device statistics.");
    } finally {
      setLoadingStats(false);
    }
  };

  // Fetch Sent Logs
  const fetchLogs = async () => {
    setLoadingLogs(true);
    try {
      const response = await apiConnector("GET", GET_LOGS_API);
      if (response?.data?.success) {
        setLogs(response.data.logs);
      }
    } catch (error: any) {
      console.error("Failed to fetch notification logs:", error);
    } finally {
      setLoadingLogs(false);
    }
  };

  // Fetch Topics
  const fetchTopics = async () => {
    setLoadingTopics(true);
    try {
      const response = await apiConnector("GET", GET_TOPICS);
      if (response?.data?.success) {
        setTopics(response.data.topics || []);
      }
    } catch (error: any) {
      console.error("Failed to fetch topics:", error);
      toast.error("Failed to load audience topics.");
    } finally {
      setLoadingTopics(false);
    }
  };

  // Fetch Categories
  const fetchCategories = async () => {
    try {
      const response = await apiConnector(
        "GET",
        category.GET_ALL_CATEGORY_API,
      );
      if (response?.data?.success) {
        setCategories(response.data.categories || response.data.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    }
  };

  // Fetch Devices
  const fetchDevices = async () => {
    setLoadingDevices(true);
    try {
      const response = await apiConnector("GET", GET_DEVICES);
      if (response?.data?.success) {
        setDevicesList(response.data.devices || []);
      }
    } catch (error) {
      console.error("Failed to fetch devices:", error);
    } finally {
      setLoadingDevices(false);
    }
  };

  useEffect(() => {
    fetchStats();
    fetchLogs();
    fetchTopics();
    fetchCategories();
    fetchDevices();
  }, []);

  // Handle Image Upload
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate type and size (5MB limit)
    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Please upload a valid image file (JPEG, PNG, GIF, WEBP).");
      return;
    }
    
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image file size must be less than 5MB.");
      return;
    }

    setUploadingImage(true);
    const formData = new FormData();
    formData.append("thumbnail", file);

    try {
      const response = await apiConnector(
        "POST", 
        image.UPLOAD_SINGLE_IMAGE,
        formData,
        { "Content-Type": "multipart/form-data" }
      );

      if (response?.data?.success) {
        toast.success("Image uploaded successfully!");
        setImageUrl(response.data.thumbnailImage.url);
      } else {
        toast.error("Image upload failed.");
      }
    } catch (err: any) {
      console.error("Image upload error:", err);
      toast.error(err?.response?.data?.message || "Server error during image upload.");
    } finally {
      setUploadingImage(false);
    }
  };

  // Handle Form Submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !body.trim()) {
      toast.warning("Title and body are required fields.");
      return;
    }

    setSending(true);
    try {
      const isTopicTarget = targetType.startsWith("topic_");
      const cleanTargetType = isTopicTarget ? "topic" : targetType;
      const targetIds = isTopicTarget ? targetType.replace("topic_", "") : undefined;

      const response = await apiConnector("POST", SEND_NOTIFICATION_API, {
        title: title.trim(),
        body: body.trim(),
        imageUrl: imageUrl.trim() || undefined,
        targetType: cleanTargetType,
        targetIds,
        link: link.trim() || undefined
      });

      if (response?.data?.success) {
        toast.success(response.data.message || "Notification sent successfully!");
        // Reset form
        setTitle("");
        setBody("");
        setImageUrl("");
        setLink("");
        setTargetType("all");
        // Reload stats and logs
        fetchStats();
        fetchLogs();
      } else {
        toast.error(response?.data?.message || "Failed to send notification.");
      }
    } catch (error: any) {
      console.error("Failed to send notification:", error);
      toast.error(error?.response?.data?.message || "Server error while sending notification.");
    } finally {
      setSending(false);
    }
  };

  // Open enrollment popup modal and preselect topic
  const openEnrollModal = (topic: TopicItem) => {
    setManualTopicId(topic._id);
    setSelectedDevices([]);
    setIsEnrollModalOpen(true);
  };

  // Toggle individual device selection
  const toggleDeviceSelection = (device: any) => {
    const isSelected = selectedDevices.some(d => d._id === device._id);
    if (isSelected) {
      setSelectedDevices(selectedDevices.filter(d => d._id !== device._id));
    } else {
      setSelectedDevices([...selectedDevices, device]);
    }
  };

  // Add custom manual device ID/FCM token to the selection list
  const addCustomDevice = () => {
    if (!customDeviceText.trim()) return;
    const value = customDeviceText.trim();
    if (selectedDevices.some(d => d.value === value || d.deviceId === value)) {
      toast.warning("Device already in selection.");
      return;
    }
    const customDev = {
      _id: `custom_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      isCustom: true,
      value: value,
      label: `✍️ Custom: ${value.substring(0, 15)}...`
    };
    setSelectedDevices([...selectedDevices, customDev]);
    setCustomDeviceText("");
  };

  // Handle Manual Subscription / Unsubscription
  const handleManualSubscription = async (action: "subscribe" | "unsubscribe") => {
    if (!manualTopicId) {
      toast.warning("Please select a topic.");
      return;
    }
    if (selectedDevices.length === 0) {
      toast.warning("Please select at least one device.");
      return;
    }

    setSubmittingManualAction(true);
    let successCount = 0;
    let failCount = 0;

    for (const dev of selectedDevices) {
      try {
        const payload: any = { topicId: manualTopicId };
        if (dev.isCustom) {
          if (dev.value.length > 50) {
            payload.fcmToken = dev.value;
          } else {
            payload.deviceId = dev.value;
          }
        } else {
          payload.deviceId = dev.deviceId;
        }

        const endpoint = action === "subscribe" ? SUBSCRIBE_TO_TOPIC : UNSUBSCRIBE_FROM_TOPIC;
        const response = await apiConnector("POST", endpoint, payload);

        if (response?.data?.success) {
          successCount++;
        } else {
          failCount++;
        }
      } catch (err) {
        console.error(err);
        failCount++;
      }
    }

    if (successCount > 0) {
      toast.success(`Successfully ${action}d ${successCount} device(s)!`);
    }
    if (failCount > 0) {
      toast.error(`Failed to ${action} ${failCount} device(s).`);
    }

    setSelectedDevices([]);
    setSelectedDeviceOption("");
    setManualDeviceInput("");
    fetchTopics(); // Reload counts
    fetchDevices(); // Reload devices list
    setSubmittingManualAction(false);
  };

  // Handle Topic Creation
  const handleCreateTopic = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topicName.trim() || !topicDisplayName.trim()) {
      toast.warning("Topic name and display name are required.");
      return;
    }

    setCreatingTopic(true);
    
    // Construct criteria object
    const criteria: any = {};
    if (criteriaRole) criteria.role = criteriaRole;
    if (criteriaPhoneVerified) criteria.phoneVerified = criteriaPhoneVerified === "true";
    if (criteriaCategory) criteria.category = criteriaCategory;
    if (criteriaLocation.trim()) criteria.serviceLocation = criteriaLocation.trim();
    if (criteriaPincode.trim()) criteria.pincode = criteriaPincode.trim();
    if (criteriaPriceTier) criteria.selectedPriceTier = criteriaPriceTier;

    try {
      const response = await apiConnector("POST", CREATE_TOPIC, {
        name: topicName.trim().toLowerCase().replace(/\s+/g, '_'),
        displayName: topicDisplayName.trim(),
        description: topicDescription.trim() || undefined,
        autoSubscribe: topicAutoSubscribe,
        criteria: Object.keys(criteria).length > 0 ? criteria : undefined
      });

      if (response?.data?.success) {
        toast.success("Topic created successfully!");
        // Reset form fields
        setTopicName("");
        setTopicDisplayName("");
        setTopicDescription("");
        setTopicAutoSubscribe(false);
        setCriteriaRole("");
        setCriteriaPhoneVerified("");
        setCriteriaCategory("");
        setCriteriaLocation("");
        setCriteriaPincode("");
        setCriteriaPriceTier("");
        
        fetchTopics();
        fetchStats(); // Update totals
      } else {
        toast.error(response?.data?.message || "Failed to create topic.");
      }
    } catch (err: any) {
      console.error("Create Topic Error:", err);
      toast.error(err?.response?.data?.message || "Error creating topic.");
    } finally {
      setCreatingTopic(false);
    }
  };

  // Toggle Topic Active Status
  const handleToggleTopic = async (topic: TopicItem) => {
    try {
      const response = await apiConnector("PUT", `${UPDATE_TOPIC}/${topic._id}`, {
        isActive: !topic.isActive
      });
      if (response?.data?.success) {
        toast.success(`Topic ${!topic.isActive ? "activated" : "deactivated"} successfully.`);
        fetchTopics();
      }
    } catch (err: any) {
      console.error("Toggle topic error:", err);
      toast.error(err?.response?.data?.message || "Failed to update topic status.");
    }
  };

  // Delete Topic
  const handleDeleteTopic = async (topicId: string) => {
    if (!window.confirm("Are you sure you want to delete this topic? All device subscriptions to this topic will be removed.")) {
      return;
    }

    try {
      const response = await apiConnector("DELETE", `${DELETE_TOPIC}/${topicId}`);
      if (response?.data?.success) {
        toast.success("Topic deleted successfully.");
        fetchTopics();
        fetchStats();
      }
    } catch (err: any) {
      console.error("Delete topic error:", err);
      toast.error(err?.response?.data?.message || "Failed to delete topic.");
    }
  };

  // Quick Resend
  const handleResend = (log: NotificationLog) => {
    const directLink = typeof log.data?.link === "string" ? log.data.link : "";
    const formData = log.title || log.body || log.imageUrl
      ? {
          title: log.title,
          body: log.body,
          imageUrl: log.imageUrl,
          link: directLink,
          type: log.type,
          data: log.data,
          targetType: log.isForGuest ? "guests" : log.vendorId ? "vendors" : log.userId ? "users" : "all"
        }
      : log.response?.formData;

    if (formData) {
      setTitle(formData.title || "");
      setBody(formData.body || "");
      setImageUrl(formData.imageUrl || "");
      setLink(formData.link || "");

      if (formData.targetType === "topic" && formData.targetIds) {
        setTargetType(`topic_${formData.targetIds}`);
      } else {
        const t = (formData.targetType || "all").toLowerCase();
        setTargetType(["all", "users", "vendors", "guests"].includes(t) ? t : "all");
      }

      toast.info("Notification parameters loaded into form.");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    const messageText = log.message;
    const linkMatch = messageText.match(/\(Link: (.*?)\)$/);
    let cleanMessage = messageText;
    let loggedLink = "";
    
    if (linkMatch) {
      loggedLink = linkMatch[1];
      cleanMessage = messageText.replace(` (Link: ${loggedLink})`, "");
    }
    
    const match = cleanMessage.match(/^\[(.*?)\] (.*)$/);
    if (match) {
      setTitle(match[1]);
      setBody(match[2]);
    } else {
      setTitle("Resend Notification");
      setBody(cleanMessage);
    }
    setLink(loggedLink);
    setImageUrl("");

    // Attempt to parse target
    const targetName = log.recipient.name;
    if (targetName.startsWith("Topic: ")) {
      const topicDisplayName = targetName.replace("Topic: ", "");
      const foundTopic = topics.find(t => t.displayName === topicDisplayName);
      if (foundTopic) {
        setTargetType(`topic_${foundTopic._id}`);
      } else {
        setTargetType("all");
      }
    } else {
      const targetMatch = targetName.match(/Target: (.*)/i);
      if (targetMatch) {
        const t = targetMatch[1].toLowerCase();
        setTargetType(["all", "users", "vendors", "guests"].includes(t) ? t : "all");
      }
    }
    
    toast.info("Notification parameters loaded into form.");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="px-4 md:px-8 min-h-screen pb-12 font-sans bg-gray-50/50">
      {/* Dynamic Header */}
      <header className="mb-8 text-center md:text-left flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
            <div className="p-2.5 bg-indigo-50 rounded-xl text-indigo-600 animate-pulse">
              <BellRing className="w-6 h-6" />
            </div>
            <h1 className="text-xl md:text-3xl font-extrabold text-gray-900 tracking-tight">
              Broadcast Push Notifications
            </h1>
          </div>
          <p className="text-gray-500 max-w-2xl">
            Instantly dispatch Firebase Cloud Messaging alerts to iOS and Android devices. Support logged-in customers, partners, and guest applications.
          </p>
        </div>
      </header>

      {/* Tabs navigation */}
      <div className="flex border-b border-gray-200 mb-8 bg-white p-1 rounded-xl shadow-sm w-full max-w-md mx-auto md:mx-0">
        <button
          onClick={() => setActiveTab("broadcast")}
          className={`flex-1 py-2.5 px-4 rounded-lg font-bold text-sm transition-all duration-200 flex items-center justify-center gap-2 ${
            activeTab === "broadcast"
              ? "bg-indigo-600 text-white shadow"
              : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
          }`}
        >
          <Send className="w-4 h-4" />
          Broadcast Message
        </button>
        <button
          onClick={() => setActiveTab("topics")}
          className={`flex-1 py-2.5 px-4 rounded-lg font-bold text-sm transition-all duration-200 flex items-center justify-center gap-2 ${
            activeTab === "topics"
              ? "bg-indigo-600 text-white shadow"
              : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
          }`}
        >
          <Sliders className="w-4 h-4" />
          Manage Topics ({topics.length})
        </button>
      </div>

      {activeTab === "broadcast" ? (
        <>
          {/* Modern Statistics Section */}
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            {/* Card 1: Total Registered */}
            <div className="bg-gradient-to-br from-indigo-500 to-blue-600 text-white rounded-2xl shadow-xl p-6 transition duration-300 transform hover:scale-[1.02] relative overflow-hidden">
              <Smartphone className="absolute right-[-10px] bottom-[-10px] text-white opacity-20 text-8xl w-24 h-24" />
              <div className="flex items-center justify-between z-10 relative">
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-indigo-100">
                    Total Devices
                  </h3>
                  <p className="text-4xl font-black mt-2">
                    {loadingStats ? "..." : stats.totalDevices}
                  </p>
                </div>
                <div className="p-3 bg-white/20 rounded-xl">
                  <Smartphone className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>

            {/* Card 2: Registered Users */}
            <div className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white rounded-2xl shadow-xl p-6 transition duration-300 transform hover:scale-[1.02] relative overflow-hidden">
              <Users className="absolute right-[-10px] bottom-[-10px] text-white opacity-20 text-8xl w-24 h-24" />
              <div className="flex items-center justify-between z-10 relative">
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-emerald-100">
                    Customers
                  </h3>
                  <p className="text-4xl font-black mt-2">
                    {loadingStats ? "..." : stats.userDevices}
                  </p>
                </div>
                <div className="p-3 bg-white/20 rounded-xl">
                  <UserCheck className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>

            {/* Card 3: Partners/Vendors */}
            <div className="bg-gradient-to-br from-amber-500 to-orange-600 text-white rounded-2xl shadow-xl p-6 transition duration-300 transform hover:scale-[1.02] relative overflow-hidden">
              <Users className="absolute right-[-10px] bottom-[-10px] text-white opacity-20 text-8xl w-24 h-24" />
              <div className="flex items-center justify-between z-10 relative">
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-amber-100">
                    Partners
                  </h3>
                  <p className="text-4xl font-black mt-2">
                    {loadingStats ? "..." : stats.vendorDevices}
                  </p>
                </div>
                <div className="p-3 bg-white/20 rounded-xl">
                  <Users className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>

            {/* Card 4: Guest App Installs */}
            <div className="bg-gradient-to-br from-rose-500 to-pink-600 text-white rounded-2xl shadow-xl p-6 transition duration-300 transform hover:scale-[1.02] relative overflow-hidden">
              <Smartphone className="absolute right-[-10px] bottom-[-10px] text-white opacity-20 text-8xl w-24 h-24" />
              <div className="flex items-center justify-between z-10 relative">
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-rose-100">
                    Guest Installs
                  </h3>
                  <p className="text-4xl font-black mt-2">
                    {loadingStats ? "..." : stats.guestDevices}
                  </p>
                </div>
                <div className="p-3 bg-white/20 rounded-xl">
                  <Smartphone className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          </section>

          {/* Main Composition and Preview Section */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
            {/* Form panel - 7 columns */}
            <div className="lg:col-span-7 bg-white rounded-3xl border border-gray-100 shadow-xl p-6 md:p-8">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Send className="w-5 h-5 text-indigo-600" />
                Compose Broadcast Message
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Title Input */}
                <div className="space-y-2">
                  <label htmlFor="title" className="text-sm font-semibold text-gray-700 block">
                    Notification Title <span className="text-rose-500">*</span>
                  </label>
                  <input
                    id="title"
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. 🎉 Mega Rewards Weekend!"
                    required
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-gray-400"
                  />
                </div>

                {/* Body Input */}
                <div className="space-y-2">
                  <label htmlFor="body" className="text-sm font-semibold text-gray-700 block">
                    Notification Message Body <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    id="body"
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    placeholder="e.g. Earn 2x reward points on all bookings this Saturday and Sunday. Tap to book now!"
                    rows={4}
                    required
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-gray-400"
                  />
                </div>

                {/* Target Selector */}
                <div className="space-y-2">
                  <label htmlFor="targetType" className="text-sm font-semibold text-gray-700 block">
                    Target Audience Category <span className="text-rose-500">*</span>
                  </label>
                  <select
                    id="targetType"
                    value={targetType}
                    onChange={(e) => setTargetType(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-gray-700 bg-white"
                  >
                    <option value="all">🚀 All Registered Devices ({stats.totalDevices})</option>
                    <option value="users">👤 Registered Customers Only ({stats.userDevices})</option>
                    <option value="vendors">🏢 Registered Partners/Vendors Only ({stats.vendorDevices})</option>
                    <option value="guests">📱 Guest / Non-logged-in Devices ({stats.guestDevices})</option>
                    
                    {topics.length > 0 && <option disabled>── Custom FCM Topics ──</option>}
                    {topics.filter(t => t.isActive).map(t => (
                      <option key={t._id} value={`topic_${t._id}`}>
                        📢 Topic: {t.displayName} ({t.subscriberCount} Devices)
                      </option>
                    ))}
                  </select>
                </div>

                {/* Image URL & Upload Section */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700 block">
                    Rich Image Attachment <span className="text-gray-400 font-normal">(Optional)</span>
                  </label>
                  
                  {/* Source Toggle */}
                  <div className="flex gap-3 mb-3">
                    <button
                      type="button"
                      onClick={() => setImageSource("url")}
                      className={`text-xs font-bold px-3 py-1.5 rounded-lg border transition-all duration-200 ${
                        imageSource === "url"
                          ? "bg-indigo-50 border-indigo-200 text-indigo-700"
                          : "bg-white border-gray-200 text-gray-500 hover:bg-gray-50"
                      }`}
                    >
                      Image Link URL
                    </button>
                    <button
                      type="button"
                      onClick={() => setImageSource("upload")}
                      className={`text-xs font-bold px-3 py-1.5 rounded-lg border transition-all duration-200 ${
                        imageSource === "upload"
                          ? "bg-indigo-50 border-indigo-200 text-indigo-700"
                          : "bg-white border-gray-200 text-gray-500 hover:bg-gray-50"
                      }`}
                    >
                      Upload File
                    </button>
                  </div>

                  {imageSource === "url" ? (
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                        <ImageIcon className="w-5 h-5" />
                      </div>
                      <input
                        id="imageUrl"
                        type="url"
                        value={imageUrl}
                        onChange={(e) => setImageUrl(e.target.value)}
                        placeholder="e.g. https://domain.com/banner.png"
                        className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-gray-400"
                      />
                    </div>
                  ) : (
                    <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl border border-gray-200">
                      <input
                        id="image-file"
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        disabled={uploadingImage}
                      />
                      <label
                        htmlFor="image-file"
                        className={`flex items-center gap-2 cursor-pointer bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-bold px-4 py-3 rounded-xl text-sm transition-all duration-200 shadow-sm ${
                          uploadingImage ? "opacity-50 pointer-events-none" : ""
                        }`}
                      >
                        <Upload className="w-4 h-4 text-indigo-600" />
                        {uploadingImage ? "Uploading Image..." : "Choose Image File"}
                      </label>
                      {imageUrl && (
                        <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-gray-100 shadow-inner">
                          <img src={imageUrl} alt="preview" className="w-8 h-8 object-cover rounded" />
                          <button
                            type="button"
                            onClick={() => setImageUrl("")}
                            className="text-xs text-rose-500 font-bold hover:underline"
                          >
                            Remove
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                  <p className="text-xs text-gray-400 flex items-center gap-1">
                    <Info className="w-3.5 h-3.5" /> High-quality landscape (approx. 2:1 aspect ratio) matches best for notifications.
                  </p>
                </div>

                {/* Redirection link option (Commented out for now)
                <div className="space-y-2">
                  <label htmlFor="link" className="text-sm font-semibold text-gray-700 block">
                    Redirection Link / Click Action URL <span className="text-gray-400 font-normal">(Optional)</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                      <Link2 className="w-5 h-5" />
                    </div>
                    <input
                      id="link"
                      type="url"
                      value={link}
                      onChange={(e) => setLink(e.target.value)}
                      placeholder="e.g. https://www.meragharsansaar.com/offers"
                      className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-gray-400"
                    />
                  </div>
                  <p className="text-xs text-gray-400">
                    Directs the user to this URL when they click on the notification banner.
                  </p>
                </div>
                */}

                <Separator className="my-2" />

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={sending}
                  className="w-full py-4 text-white font-bold bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 shadow-lg hover:shadow-xl hover:shadow-indigo-500/10 active:scale-[0.98] transition-all rounded-xl flex items-center justify-center gap-2"
                >
                  {sending ? (
                    <>
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      Sending Broadcast...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      Dispatch Push Notification
                    </>
                  )}
                </Button>
              </form>
            </div>

            {/* Live Smartphone Notification Preview - 5 columns */}
            <div className="lg:col-span-5 flex flex-col justify-start animate-fade-in">
              <div className="bg-gray-900 text-white rounded-[3rem] p-4 sm:p-6 shadow-2xl relative border-[8px] sm:border-[10px] border-gray-800 w-full max-w-[280px] min-[375px]:max-w-[320px] sm:max-w-sm mx-auto aspect-[9/18.5] flex flex-col overflow-hidden">
                {/* Status notch */}
                <div className="absolute top-2 left-1/2 -translate-x-1/2 w-32 h-6 bg-black rounded-b-2xl z-20 flex items-center justify-between px-4">
                  <div className="w-3.5 h-3.5 bg-gray-900 rounded-full border border-gray-800"></div>
                  <div className="w-10 h-1 bg-gray-900 rounded-full"></div>
                </div>

                {/* Mobile Screen content */}
                <div 
                  className="flex-1 rounded-[2rem] overflow-hidden flex flex-col justify-start relative pt-12 p-4 bg-cover bg-center"
                  style={{ 
                    backgroundImage: 'url("https://images.unsplash.com/photo-1579546929518-9e396f3cc809?q=80&w=640")' 
                  }}
                >
                  {/* Overlay for darker theme */}
                  <div className="absolute inset-0 bg-black/35 backdrop-blur-[1px] z-0"></div>

                  {/* Time display */}
                  <div className="z-10 text-center mb-6">
                    <p className="text-4xl font-extralight select-none">10:42</p>
                    <p className="text-xs font-semibold tracking-wider text-gray-200 mt-1 uppercase">Tuesday, June 2</p>
                  </div>

                  {/* Lock screen notification card */}
                  <div className="z-10 bg-white/80 backdrop-blur-md text-gray-900 rounded-2xl p-4 shadow-xl border border-white/20 transition-all duration-300 animate-bounce">
                    <div className="flex items-start gap-3">
                      {/* App Icon */}
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center text-white font-extrabold flex-shrink-0 text-sm shadow-md">
                        MGS
                      </div>
                      
                      {/* Notification text details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-sm text-gray-900 truncate">
                            {title.trim() || "Mera Ghar Sansar"}
                          </span>
                          <span className="text-[10px] text-gray-500 font-semibold uppercase flex-shrink-0 ml-2">
                            now
                          </span>
                        </div>
                        <p className="text-xs text-gray-700 font-medium leading-relaxed mt-1 break-words">
                          {body.trim() || "Create a notification in the composition panel to preview how it renders on customer handsets."}
                        </p>
                      </div>
                    </div>

                    {/* Optional Image attachment preview */}
                    {imageUrl && (
                      <div className="mt-3.5 overflow-hidden rounded-xl h-24 w-full relative bg-gray-100 border border-gray-200/50 shadow-inner">
                        <img 
                          src={imageUrl} 
                          alt="Attachment Preview" 
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                      </div>
                    )}

                    {/* Show redirection link indicator */}
                    {link && (
                      <div className="mt-2 text-[10px] text-indigo-600 font-bold flex items-center gap-1 border-t border-gray-100 pt-1.5">
                        <Link2 className="w-3 h-3" />
                        Redirect: {link.length > 30 ? `${link.substring(0, 30)}...` : link}
                      </div>
                    )}
                  </div>

                  {/* Lock Icon at bottom */}
                  <div className="z-10 mt-auto text-center pb-2 select-none text-white/50 text-[10px] font-bold tracking-widest uppercase">
                    🔒 Swipe up to open
                  </div>
                </div>
              </div>
              <p className="text-center text-xs text-gray-400 font-medium mt-3 flex items-center justify-center gap-1.5">
                <Eye className="w-3.5 h-3.5" /> Interactive lock-screen visualization.
              </p>
            </div>
          </div>

          {/* Recent logs section */}
          <section className="bg-white rounded-3xl border border-gray-100 shadow-xl p-6 md:p-8">
            <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <History className="w-5 h-5 text-indigo-600" />
                Broadcast Notification Logs
              </h2>
              <Button 
                variant="outline" 
                size="sm"
                onClick={fetchLogs} 
                className="flex items-center gap-1.5 rounded-lg border-gray-200 hover:bg-gray-50 text-xs font-semibold px-3 py-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Refresh Logs
              </Button>
            </div>

            {loadingLogs ? (
              <div className="py-12 flex justify-center items-center text-gray-400">
                <RefreshCw className="w-8 h-8 animate-spin text-indigo-500 mr-2" />
                <span className="text-sm font-medium">Loading history...</span>
              </div>
            ) : logs.length === 0 ? (
              <div className="py-12 text-center text-gray-400 text-sm font-medium border-2 border-dashed border-gray-100 rounded-2xl">
                No broadcast logs available. Your sent messages will appear here.
              </div>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-gray-100">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      <th className="px-6 py-4">Audience</th>
                      <th className="px-6 py-4">Notification Message</th>
                      <th className="px-6 py-4 text-center">Status</th>
                      <th className="px-6 py-4 text-center">Deliveries</th>
                      <th className="px-6 py-4">Dispatched At</th>
                      <th className="px-6 py-4 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
                    {logs.map((log) => (
                      <tr key={log._id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap font-bold text-gray-800">
                          <span className="bg-gray-100 text-gray-700 px-2.5 py-1 rounded-md text-xs font-bold">
                            {log.recipient.name.replace("Target: ", "")}
                          </span>
                        </td>
                        
                        <td className="px-6 py-4 max-w-xs md:max-w-md truncate">
                          <div className="flex items-center gap-3 min-w-0">
                            {(log.imageUrl || log.response?.formData?.imageUrl) && (
                              <img
                                src={log.imageUrl || log.response?.formData?.imageUrl}
                                alt=""
                                className="w-9 h-9 object-cover rounded-md border border-gray-100 flex-shrink-0"
                              />
                            )}
                            <span className="text-gray-900 font-semibold text-xs md:text-sm truncate">
                              {log.title ? `[${log.title}] ${log.body || ""}` : log.message}
                            </span>
                          </div>
                        </td>
                        
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          {log.status === "Success" ? (
                            <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-50 px-2 py-0.5 rounded-md inline-flex items-center gap-1 text-xs">
                              <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                              Dispatched
                            </Badge>
                          ) : (
                            <Badge className="bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-50 px-2 py-0.5 rounded-md inline-flex items-center gap-1 text-xs">
                              <XCircle className="w-3.5 h-3.5 text-rose-500" />
                              Failed
                            </Badge>
                          )}
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap text-center text-xs font-bold">
                          {log.response && log.response.successCount !== undefined ? (
                            <span className="text-emerald-600 font-extrabold bg-emerald-50 px-2 py-0.5 rounded-md">
                              {log.response.successCount} / {log.response.totalDevicesTargeted || log.response.successCount + (log.response.failureCount || 0)}
                            </span>
                          ) : (
                            <span className="text-gray-400 font-semibold">—</span>
                          )}
                        </td>
                        
                        <td className="px-6 py-4 whitespace-nowrap text-gray-500 text-xs">
                          {new Date(log.createdAt).toLocaleString(undefined, {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit"
                          })}
                        </td>
                        
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleResend(log)}
                            className="text-xs text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 font-bold rounded-lg"
                          >
                            Load Form
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </>
      ) : (
        /* Topics Management Panel */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
          {/* Left Column wrapper - 4 columns */}
          <div className="lg:col-span-4 space-y-8">
            {/* Create Topic Form */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-xl p-6 md:p-8 h-fit">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Plus className="w-5 h-5 text-indigo-600" />
                Add Custom Audience Topic
              </h2>

              <form onSubmit={handleCreateTopic} className="space-y-5">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-600 uppercase tracking-wider block">
                    Topic Key Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. premium_users"
                    value={topicName}
                    onChange={(e) => setTopicName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                  />
                  <p className="text-[10px] text-gray-400">
                    Letters, numbers, and underscores only. Generates Firebase group: <strong>group_&lt;name&gt;</strong>.
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-600 uppercase tracking-wider block">
                    Display Label Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Premium App Users"
                    value={topicDisplayName}
                    onChange={(e) => setTopicDisplayName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-600 uppercase tracking-wider block">
                    Description
                  </label>
                  <textarea
                    rows={2}
                    placeholder="What is this notification group targeting..."
                    value={topicDescription}
                    onChange={(e) => setTopicDescription(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                  />
                </div>

                {/* Auto subscribe toggle */}
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
                  <div>
                    <span className="text-xs font-bold text-gray-700 block">Auto-Subscribe Devices</span>
                    <span className="text-[10px] text-gray-400">Join new devices matching rules</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={topicAutoSubscribe}
                    onChange={(e) => setTopicAutoSubscribe(e.target.checked)}
                    className="w-5 h-5 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                  />
                </div>

                {/* Criteria details conditional form block */}
                {topicAutoSubscribe && (
                  <div className="p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100 space-y-4 animate-fadeIn">
                    <h3 className="text-xs font-extrabold text-indigo-900 uppercase tracking-wider flex items-center gap-1.5">
                      <Sliders className="w-3.5 h-3.5 text-indigo-600" />
                      Subscription Filtering Rules
                    </h3>

                    {/* Role filter */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-indigo-800 block">Role Target</label>
                      <select
                        value={criteriaRole}
                        onChange={(e) => {
                          setCriteriaRole(e.target.value);
                          if (e.target.value !== "vendor") {
                            setCriteriaCategory("");
                            setCriteriaLocation("");
                            setCriteriaPriceTier("");
                          }
                        }}
                        className="w-full px-3 py-1.5 rounded-lg border border-indigo-200 bg-white text-xs text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                      >
                        <option value="">Any Registered Devices</option>
                        <option value="user">Registered Customers only</option>
                        <option value="vendor">Partners/Vendors only</option>
                      </select>
                    </div>

                    {/* Phone Verified Filter */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-indigo-800 block">Phone Verification</label>
                      <select
                        value={criteriaPhoneVerified}
                        onChange={(e) => setCriteriaPhoneVerified(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-lg border border-indigo-200 bg-white text-xs text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                      >
                        <option value="">All Verification States</option>
                        <option value="true">Phone Verified Only</option>
                        <option value="false">Unverified Devices Only</option>
                      </select>
                    </div>

                    {/* Vendor Category criteria (only if vendor role is matched) */}
                    {criteriaRole === "vendor" && (
                      <>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-indigo-800 block">Category (Vendor Only)</label>
                          <select
                            value={criteriaCategory}
                            onChange={(e) => setCriteriaCategory(e.target.value)}
                            className="w-full px-3 py-1.5 rounded-lg border border-indigo-200 bg-white text-xs text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                          >
                            <option value="">Any Category</option>
                            {categories.map(c => (
                              <option key={c._id} value={c._id}>{c.name}</option>
                            ))}
                          </select>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-indigo-800 block">Service Location</label>
                          <input
                            type="text"
                            placeholder="e.g. Delhi, Sector 62"
                            value={criteriaLocation}
                            onChange={(e) => setCriteriaLocation(e.target.value)}
                            className="w-full px-3 py-1.5 rounded-lg border border-indigo-200 text-xs focus:outline-none"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-indigo-800 block">Price Tier Plan</label>
                          <select
                            value={criteriaPriceTier}
                            onChange={(e) => setCriteriaPriceTier(e.target.value)}
                            className="w-full px-3 py-1.5 rounded-lg border border-indigo-200 bg-white text-xs text-gray-700"
                          >
                            <option value="">Any Price Tier</option>
                            <option value="basic">Basic Plan</option>
                            <option value="premium">Premium Plan</option>
                            <option value="premiumPlus">Premium Plus Plan</option>
                          </select>
                        </div>
                      </>
                    )}

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-indigo-800 block">Filter Zip Code / Pincode</label>
                      <input
                        type="text"
                        placeholder="e.g. 110001"
                        value={criteriaPincode}
                        onChange={(e) => setCriteriaPincode(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-lg border border-indigo-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                      />
                    </div>
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={creatingTopic}
                  className="w-full py-3 text-white font-bold bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all shadow text-sm flex items-center justify-center gap-2"
                >
                  {creatingTopic ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      Add Custom Topic
                    </>
                  )}
                </Button>
            </form>
          </div>
        </div>

          {/* Topics List Table - 8 columns */}
          <div className="lg:col-span-8 bg-white rounded-3xl border border-gray-100 shadow-xl p-6 md:p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Sliders className="w-5 h-5 text-indigo-600" />
                Active Custom Topics
              </h2>
              <Button 
                variant="outline" 
                size="sm"
                onClick={fetchTopics}
                className="flex items-center gap-1.5 text-xs rounded-lg px-3"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Reload Topics
              </Button>
            </div>

            {loadingTopics ? (
              <div className="py-20 flex justify-center items-center text-gray-400">
                <RefreshCw className="w-8 h-8 animate-spin text-indigo-500 mr-2" />
                <span className="text-sm font-medium">Fetching topics...</span>
              </div>
            ) : topics.length === 0 ? (
              <div className="py-20 text-center text-gray-400 text-sm font-medium border-2 border-dashed border-gray-100 rounded-2xl">
                No custom notification topics available. Create one to segment your audience.
              </div>
            ) : (
              <div className="overflow-x-auto border border-gray-100 rounded-2xl shadow-inner bg-gray-50/50">
                <table className="w-full text-left border-collapse bg-white">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100 text-xs font-bold text-gray-500 uppercase tracking-wider">
                      <th className="px-6 py-4">Topic Details</th>
                      <th className="px-6 py-4">Firebase Key Group</th>
                      <th className="px-6 py-4 text-center">Subscribers</th>
                      <th className="px-6 py-4 text-center">Status</th>
                      <th className="px-6 py-4 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
                    {topics.map((t) => (
                      <tr key={t._id} className="hover:bg-gray-50/30 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-bold text-gray-900">{t.displayName}</div>
                          {t.description && <div className="text-xs text-gray-500 mt-0.5">{t.description}</div>}
                          {t.autoSubscribe && (
                            <div className="mt-1.5">
                              <Badge className="bg-indigo-50 border border-indigo-200 text-indigo-700 text-[9px] hover:bg-indigo-50 rounded font-semibold py-0">
                                ⚙️ Auto-Subscribe {t.criteria ? "(Filtered)" : "(All)"}
                              </Badge>
                            </div>
                          )}
                        </td>

                        <td className="px-6 py-4 font-mono text-xs text-gray-600">
                          <span className="bg-gray-100 px-2 py-1 rounded border">
                            {t.topicName}
                          </span>
                        </td>

                        <td className="px-6 py-4 text-center whitespace-nowrap font-black text-gray-900">
                          {t.subscriberCount}
                        </td>

                        <td className="px-6 py-4 text-center whitespace-nowrap">
                          <button
                            onClick={() => handleToggleTopic(t)}
                            title={t.isActive ? "Deactivate" : "Activate"}
                            className="focus:outline-none"
                          >
                            <Badge
                              className={`cursor-pointer px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                                t.isActive
                                  ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                                  : "bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200"
                              }`}
                            >
                              {t.isActive ? "Active" : "Inactive"}
                            </Badge>
                          </button>
                        </td>

                        <td className="px-6 py-4 text-center whitespace-nowrap">
                          <button
                            onClick={() => openEnrollModal(t)}
                            className="px-2.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-lg shadow hover:shadow-md transition-all active:scale-95 flex items-center gap-1 inline-flex mr-2"
                            title="Manage Subscribers"
                          >
                            <Plus className="w-3 h-3" />
                            Subscribers
                          </button>
                          <button
                            onClick={() => handleDeleteTopic(t._id)}
                            className="p-1.5 text-gray-400 hover:text-rose-500 hover:bg-gray-100 rounded-lg transition-colors inline-flex align-middle"
                            title="Delete Topic"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
      {/* Manual Device Subscription Modal Popup */}
      {isEnrollModalOpen && (
        <div 
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setIsEnrollModalOpen(false);
            }
          }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in"
        >
          <div className="bg-white rounded-3xl border border-gray-100 shadow-2xl p-6 md:p-8 max-w-3xl w-full relative animate-scale-in max-h-[90vh] flex flex-col overflow-hidden">
            
            {/* Modal Close Button */}
            <button
              type="button"
              onClick={() => setIsEnrollModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 font-bold text-2xl p-1 focus:outline-none transition-colors z-10"
            >
              &times;
            </button>

            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2 flex-shrink-0">
              <Settings className="w-5 h-5 text-rose-600 animate-spin-slow" />
              Manual Device Enrollment
            </h2>

            {/* Scrollable Container inside Modal */}
            <div className="overflow-y-auto flex-1 pr-1">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                
                {/* Left Column: Topic & Action buttons */}
                <div className="md:col-span-5 space-y-5">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-600 uppercase tracking-wider block">
                      Select Audience Topic <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={manualTopicId}
                      onChange={(e) => setManualTopicId(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all text-gray-700 bg-white"
                    >
                      <option value="">-- Choose Topic --</option>
                      {topics.map((t) => (
                        <option key={t._id} value={t._id}>
                          {t.displayName} ({t.topicName})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-600 uppercase tracking-wider block">
                      Selected Devices ({selectedDevices.length})
                    </label>
                    {selectedDevices.length === 0 ? (
                      <div className="text-xs text-gray-400 italic p-3 bg-gray-50 border border-dashed border-gray-200 rounded-xl text-center">
                        No devices selected yet. Select devices from the list on the right.
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-1.5 p-2 bg-gray-50 border border-gray-150 rounded-xl max-h-48 overflow-y-auto shadow-inner">
                        {selectedDevices.map(dev => {
                          let label = "";
                          if (dev.isCustom) {
                            label = dev.label;
                          } else if (dev.userId) {
                            label = `👤 ${dev.userId.name}`;
                          } else if (dev.vendorId) {
                            label = `🏢 ${dev.vendorId.name}`;
                          } else {
                            label = `📱 Guest (${dev.platform})`;
                          }
                          return (
                            <Badge 
                              key={dev._id} 
                              className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs px-2 py-0.5 rounded-lg flex items-center gap-1 font-semibold transition-all"
                            >
                              <span className="truncate max-w-[120px]">{label}</span>
                              <button
                                type="button"
                                onClick={() => setSelectedDevices(selectedDevices.filter(d => d._id !== dev._id))}
                                className="text-indigo-400 hover:text-indigo-600 font-bold ml-0.5 focus:outline-none"
                              >
                                &times;
                              </button>
                            </Badge>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <Button
                      type="button"
                      disabled={submittingManualAction || !manualTopicId || selectedDevices.length === 0}
                      onClick={() => handleManualSubscription("subscribe")}
                      className="py-3 text-white font-bold bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-all shadow text-xs flex items-center justify-center gap-1.5"
                    >
                      {submittingManualAction ? (
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Plus className="w-3.5 h-3.5" />
                      )}
                      Subscribe
                    </Button>
                    <Button
                      type="button"
                      disabled={submittingManualAction || !manualTopicId || selectedDevices.length === 0}
                      onClick={() => handleManualSubscription("unsubscribe")}
                      className="py-3 text-white font-bold bg-rose-600 hover:bg-rose-700 rounded-xl transition-all shadow text-xs flex items-center justify-center gap-1.5"
                    >
                      {submittingManualAction ? (
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Trash2 className="w-3.5 h-3.5" />
                      )}
                      Unsubscribe
                    </Button>
                  </div>
                </div>

                {/* Right Column: Searchable Devices Checklist */}
                <div className="md:col-span-7 space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-600 uppercase tracking-wider block">
                      Choose Registered Devices
                    </label>
                    
                    {/* Search Bar */}
                    <input
                      type="text"
                      placeholder="🔍 Search name, contact, platform, device ID..."
                      value={deviceSearchQuery}
                      onChange={(e) => setDeviceSearchQuery(e.target.value)}
                      className="w-full px-3.5 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 bg-white text-gray-800"
                    />

                    {/* Custom Input Section */}
                    <div className="flex gap-2 p-2 bg-gray-50 rounded-xl border border-gray-100">
                      <input
                        type="text"
                        placeholder="✍️ Paste custom device ID/FCM token"
                        value={customDeviceText}
                        onChange={(e) => setCustomDeviceText(e.target.value)}
                        className="flex-1 px-3 py-1.5 border border-gray-200 rounded-lg text-xs focus:outline-none bg-white text-gray-800"
                      />
                      <button
                        type="button"
                        onClick={addCustomDevice}
                        className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-all active:scale-95 flex items-center justify-center"
                      >
                        Add
                      </button>
                    </div>

                    {/* Device Checklist Scroll Area */}
                    <div className="border border-gray-150 rounded-xl p-3.5 bg-white space-y-3 h-[320px] overflow-y-auto shadow-inner">
                      {loadingDevices ? (
                        <div className="text-center text-xs text-gray-400 py-12 flex items-center justify-center gap-1.5">
                          <RefreshCw className="w-4 h-4 animate-spin text-indigo-500" /> Loading registered devices...
                        </div>
                      ) : (() => {
                        const query = deviceSearchQuery.toLowerCase();
                        const filtered = devicesList.filter(d => {
                          const name = d.userId?.name || d.vendorId?.name || "";
                          const contact = d.userId?.phone || d.userId?.email || d.vendorId?.phone || d.vendorId?.email || "";
                          const devId = d.deviceId || "";
                          const platform = d.platform || "";
                          return (
                            name.toLowerCase().includes(query) || 
                            contact.toLowerCase().includes(query) || 
                            devId.toLowerCase().includes(query) ||
                            platform.toLowerCase().includes(query)
                          );
                        });

                        if (filtered.length === 0) {
                          return (
                            <div className="text-center text-xs text-gray-400 py-12 italic">
                              No matching devices found.
                            </div>
                          );
                        }

                        const customers = filtered.filter(d => d.userId);
                        const vendors = filtered.filter(d => d.vendorId);
                        const guests = filtered.filter(d => d.isGuest || (!d.userId && !d.vendorId));

                        return (
                          <>
                            {/* Customers */}
                            {customers.length > 0 && (
                              <div className="space-y-1.5">
                                <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider sticky top-0 bg-white py-0.5 z-10">👤 Customers ({customers.length})</h4>
                                {customers.map(d => {
                                  const isSel = selectedDevices.some(s => s._id === d._id);
                                  return (
                                    <label key={d._id} className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-gray-50 cursor-pointer text-xs select-none transition-colors border border-transparent hover:border-gray-100">
                                      <input
                                        type="checkbox"
                                        checked={isSel}
                                        onChange={() => toggleDeviceSelection(d)}
                                        className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                                      />
                                      <span className="truncate flex-1">
                                        <strong className="text-gray-900">{d.userId.name || "Customer"}</strong> <span className="text-gray-500">({d.userId.phone || d.userId.email || "No Contact"})</span>
                                      </span>
                                    </label>
                                  );
                                })}
                              </div>
                            )}

                            {/* Vendors */}
                            {vendors.length > 0 && (
                              <div className="space-y-1.5 mt-3">
                                <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider sticky top-0 bg-white py-0.5 z-10">🏢 Vendors ({vendors.length})</h4>
                                {vendors.map(d => {
                                  const isSel = selectedDevices.some(s => s._id === d._id);
                                  return (
                                    <label key={d._id} className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-gray-50 cursor-pointer text-xs select-none transition-colors border border-transparent hover:border-gray-100">
                                      <input
                                        type="checkbox"
                                        checked={isSel}
                                        onChange={() => toggleDeviceSelection(d)}
                                        className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                                      />
                                      <span className="truncate flex-1">
                                        <strong className="text-gray-900">{d.vendorId.name || "Vendor"}</strong> <span className="text-gray-500">({d.vendorId.phone || d.vendorId.email || "No Contact"})</span>
                                      </span>
                                    </label>
                                  );
                                })}
                              </div>
                            )}

                            {/* Guests */}
                            {guests.length > 0 && (
                              <div className="space-y-1.5 mt-3">
                                <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider sticky top-0 bg-white py-0.5 z-10">📱 Guests ({guests.length})</h4>
                                {guests.map(d => {
                                  const isSel = selectedDevices.some(s => s._id === d._id);
                                  return (
                                    <label key={d._id} className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-gray-50 cursor-pointer text-xs select-none transition-colors border border-transparent hover:border-gray-100">
                                      <input
                                        type="checkbox"
                                        checked={isSel}
                                        onChange={() => toggleDeviceSelection(d)}
                                        className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                                      />
                                      <span className="truncate flex-1 text-gray-700">
                                        Guest ({d.platform || "unknown"}) - <span className="font-mono text-[10px] text-gray-400">{d.deviceId.substring(0, 16)}...</span>
                                      </span>
                                    </label>
                                  );
                                })}
                              </div>
                            )}
                          </>
                        );
                      })()}
                    </div>

                    {/* Footer Utilities */}
                    <div className="flex items-center justify-between border-t border-gray-100 pt-2.5 mt-2">
                      <button
                        type="button"
                        onClick={() => {
                          const query = deviceSearchQuery.toLowerCase();
                          const filtered = devicesList.filter(d => {
                            const name = d.userId?.name || d.vendorId?.name || "";
                            const contact = d.userId?.phone || d.userId?.email || d.vendorId?.phone || d.vendorId?.email || "";
                            const devId = d.deviceId || "";
                            const platform = d.platform || "";
                            return (
                              name.toLowerCase().includes(query) || 
                              contact.toLowerCase().includes(query) || 
                              devId.toLowerCase().includes(query) ||
                              platform.toLowerCase().includes(query)
                            );
                          });
                          const newSelections = [...selectedDevices];
                          filtered.forEach(f => {
                            if (!newSelections.some(s => s._id === f._id)) {
                              newSelections.push(f);
                            }
                          });
                          setSelectedDevices(newSelections);
                        }}
                        className="text-[10px] font-bold text-indigo-600 hover:text-indigo-700 hover:underline"
                      >
                        Select All Matching ({
                          devicesList.filter(d => {
                            const query = deviceSearchQuery.toLowerCase();
                            const name = d.userId?.name || d.vendorId?.name || "";
                            const contact = d.userId?.phone || d.userId?.email || d.vendorId?.phone || d.vendorId?.email || "";
                            const devId = d.deviceId || "";
                            const platform = d.platform || "";
                            return name.toLowerCase().includes(query) || contact.toLowerCase().includes(query) || devId.toLowerCase().includes(query) || platform.toLowerCase().includes(query);
                          }).length
                        })
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedDevices([])}
                        className="text-[10px] font-bold text-rose-600 hover:text-rose-700 hover:underline"
                      >
                        Clear Selections
                      </button>
                    </div>

                  </div>
                </div>
                
              </div>
            </div>

          </div>
        </div>
      )}
      </div>
  );
};

export default SendNotifications;
