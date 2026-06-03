import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { apiConnector } from "@/service/apiConnector";
import { notification } from "@/service/apis";
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
  Info
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

const { SEND_NOTIFICATION_API, GET_STATS_API, GET_LOGS_API } = notification;

interface NotificationStats {
  totalDevices: number;
  guestDevices: number;
  userDevices: number;
  vendorDevices: number;
}

interface NotificationLog {
  _id: string;
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
  };
  createdAt: string;
}

const SendNotifications: React.FC = () => {
  const user = useSelector((state: RootState) => state.auth.user);
  
  // Form State
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [targetType, setTargetType] = useState("all");
  
  // Dashboard Metrics & Logs
  const [stats, setStats] = useState<NotificationStats>({
    totalDevices: 0,
    guestDevices: 0,
    userDevices: 0,
    vendorDevices: 0
  });
  const [logs, setLogs] = useState<NotificationLog[]>([]);
  
  // Loaders
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingLogs, setLoadingLogs] = useState(true);
  const [sending, setSending] = useState(false);

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

  useEffect(() => {
    fetchStats();
    fetchLogs();
  }, []);

  // Handle Form Submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !body.trim()) {
      toast.warning("Title and body are required fields.");
      return;
    }

    setSending(true);
    try {
      const response = await apiConnector("POST", SEND_NOTIFICATION_API, {
        title: title.trim(),
        body: body.trim(),
        imageUrl: imageUrl.trim() || undefined,
        targetType
      });

      if (response?.data?.success) {
        toast.success(response.data.message || "Notification sent successfully!");
        // Reset form
        setTitle("");
        setBody("");
        setImageUrl("");
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

  // Quick Resend
  const handleResend = (log: NotificationLog) => {
    // Extract title & body from logged format: "[Title] Body"
    const match = log.message.match(/^\[(.*?)\] (.*)$/);
    if (match) {
      setTitle(match[1]);
      setBody(match[2]);
    } else {
      setTitle("Resend Notification");
      setBody(log.message);
    }

    // Attempt to parse target
    const targetMatch = log.recipient.name.match(/Target: (.*)/i);
    if (targetMatch) {
      const t = targetMatch[1].toLowerCase();
      setTargetType(["all", "users", "vendors", "guests"].includes(t) ? t : "all");
    }
    
    toast.info("Notification parameters loaded into form.");
    // Smooth scroll to form
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="md:px-8 min-h-screen pb-12 font-sans bg-gray-50/50">
      {/* Dynamic Header */}
      <header className="mb-8 text-center md:text-left">
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
      </header>

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
              </select>
            </div>

            {/* Image URL Input */}
            <div className="space-y-2">
              <label htmlFor="imageUrl" className="text-sm font-semibold text-gray-700 block">
                Rich Image Attachment URL <span className="text-gray-400 font-normal">(Optional)</span>
              </label>
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
              <p className="text-xs text-gray-400 flex items-center gap-1">
                <Info className="w-3.5 h-3.5" /> Direct links to PNG or JPEG format work best for mobile display.
              </p>
            </div>

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
        <div className="lg:col-span-5 flex flex-col justify-start">
          <div className="bg-gray-900 text-white rounded-[3rem] p-6 shadow-2xl relative border-[10px] border-gray-800 w-full max-w-sm mx-auto aspect-[9/18.5] flex flex-col overflow-hidden">
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
                        // fallback if error loading image
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
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
                    {/* Audience */}
                    <td className="px-6 py-4 whitespace-nowrap font-bold text-gray-800">
                      <span className="bg-gray-100 text-gray-700 px-2.5 py-1 rounded-md text-xs font-bold">
                        {log.recipient.name.replace("Target: ", "")}
                      </span>
                    </td>
                    
                    {/* Message Body */}
                    <td className="px-6 py-4 max-w-xs md:max-w-md truncate">
                      <span className="text-gray-900 font-semibold">{log.message}</span>
                    </td>
                    
                    {/* Status */}
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

                    {/* Stats Deliveries */}
                    <td className="px-6 py-4 whitespace-nowrap text-center text-xs font-bold">
                      {log.response && log.response.successCount !== undefined ? (
                        <span className="text-emerald-600 font-extrabold bg-emerald-50 px-2 py-0.5 rounded-md">
                          {log.response.successCount} / {log.response.totalDevicesTargeted || log.response.successCount + (log.response.failureCount || 0)}
                        </span>
                      ) : (
                        <span className="text-gray-400 font-semibold">—</span>
                      )}
                    </td>
                    
                    {/* Sent Date */}
                    <td className="px-6 py-4 whitespace-nowrap text-gray-500 text-xs">
                      {new Date(log.createdAt).toLocaleString(undefined, {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit"
                      })}
                    </td>
                    
                    {/* Resend Action */}
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
    </div>
  );
};

export default SendNotifications;
