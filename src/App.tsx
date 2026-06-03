import { Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import About from "./pages/About";
import Contact from "./pages/Contact";
import NotFound from "./pages/NotFound";
import PrivateRoute from "@/components/auth/PrivateRoute";
import OpenRoute from "@/components/auth/OpenRoute";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import { useSelector } from "react-redux";
import { RootState } from "./redux/store";
import Layout from "./components/pages/admin/Layout";
import Dashboard from "./components/pages/admin/Dashboard";
import VendorDashboard from "./components/pages/vendor/VendorDashboard";
import VendorLayout from "./components/pages/vendor/VendorLayout";
import VendorLogin from "./pages/VendorLogin";
import VendorRegister from "./pages/VendorRegister";
import CategoryPurchasePage from "./pages/CategoryPurchasePage";
import VendorManagement from "./components/pages/admin/AdminVendors";
import VendorAddProperty from "./components/pages/vendor/VendorAddProperty";
import VendorServices from "./components/pages/vendor/VendorProperties";
import ServicesPage from "./pages/ServicePage";
import PropertyDetails from "./pages/PropertyDetails";
import AddBlog from "./components/pages/admin/AddBlog";
import GetBlog from "./components/pages/admin/GetBlog";
import SingleBlog from "./pages/SingleBlog";
import Blogs from "./pages/Blogs";
import VendorProfile from "./components/pages/vendor/VendorProfile";
import VendorGetInquiry from "./components/pages/vendor/VendorGetInquiry";
import UserProfile from "./pages/UserProfile";
import AllUsers from "./components/pages/admin/AllUsers";
import GetCustomerSupport from "./components/pages/admin/GetCustomerSupport";
import CustomerSupport from "./pages/CustomerSupport";
import JobCreate from "./components/pages/admin/JobCreate";
import GetAllJob from "./components/pages/admin/GetAllJob";
import Careers from "./pages/Career";
import JobDetail from "./pages/JobDetails";
import UpdateWorkingHoursPage from "./components/pages/vendor/UpdateWorkingHoursPage";
import CreateAdd from "./components/pages/admin/CreateAdd";
import VendorBookings from "./components/pages/vendor/VendorBooking";
import AllBookingsPage from "./components/pages/admin/AllBookingsPage";
import Task from "./components/pages/vendor/Task";
import { AddRoles } from "./components/pages/admin/AddRoles";
import ManageCategories from "./components/pages/admin/ManageCategories";
import ServiceUpdateRequests from "./components/pages/admin/ServiceUpdateRequests";
import PurchaseCategories from "./components/pages/vendor/PurchaseCategories";
import VendorAddService from "./components/pages/vendor/VendorAddProperty";
import AuditLogsPage from "./components/pages/vendor/AuditLogs";
import AdminAuditLogs from "./components/pages/admin/AdminAuditLogs";
import CommunicationLogs from "./components/pages/admin/CommunicationLogs";
import SearchLogs from "./components/pages/admin/SearchLogs";
import CouponManagement from "./components/pages/admin/CouponManagement";
import RewardSettings from "./components/pages/admin/RewardSettings";
import RewardApplications from "./components/pages/admin/RewardApplications";
import UserRewardPoints from "./pages/UserRewardPoints";
import VendorApplyRedeemCode from "./components/pages/vendor/VendorApplyRedeemCode";
import TermsAndConditions from "./pages/TermsAndConditions";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import AdminServices from "./components/pages/admin/AdminServices";
import SendNotifications from "./components/pages/admin/SendNotifications";
import CategoriesPage from "./pages/CategoriesPage";
import ScrollToTop from "./pages/ScrollToTop";
import VendoreServiceImagesUpload from "./components/pages/vendor/VendoreServiceImagesUpload";
import AppDownloadFloat from "./components/AppDownloadFloat";
const queryClient = new QueryClient();

// Loading component for Suspense fallback
const LoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
  </div>
);

const App = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  return (
    <Suspense fallback={<LoadingFallback />}>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
          <ScrollToTop/>
          <AppDownloadFloat />

            <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/about" element={<About />} />
            <Route path="/terms" element={<TermsAndConditions />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />

            <Route path="/contact" element={<Contact />} />
            <Route path="/services" element={<ServicesPage />} />
            <Route path="/service/:id" element={<PropertyDetails />} />
            <Route path="/blog/:slug" element={<SingleBlog />} />
            <Route path="/blogs" element={<Blogs />} />
            <Route path="/categories" element={<CategoriesPage />} />
            <Route path="/user/profile" element={<UserProfile />} />
            <Route path="/user/rewards" element={<UserRewardPoints />} />
            <Route path="/customer-support" element={<CustomerSupport />} />
            <Route path="/careers" element={<Careers />} />
            <Route path="/careers/:id" element={<JobDetail />} />
            <Route
              path="/login"
              element={
                <OpenRoute>
                  <Login />
                </OpenRoute>
              }
            />
            <Route
              path="/signup"
              element={
                <OpenRoute>
                  <Signup />
                </OpenRoute>
              }
            />

            {user?.role === "admin" && (
              <Route
                path="/admin"
                element={
                  <PrivateRoute>
                    <Layout />
                  </PrivateRoute>
                }
              >
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="services" element={<AdminServices />} />
                <Route path="service-update-requests" element={<ServiceUpdateRequests />} />
                <Route path="vendors" element={<VendorManagement />} />
                <Route path="add-blog" element={<AddBlog />} />
                <Route path="get-blog" element={<GetBlog />} />
                <Route path="users" element={<AllUsers />} />
                <Route path="get-support" element={<GetCustomerSupport />} />
                <Route path="add-job" element={<JobCreate />} />
                <Route path="get-jobs" element={<GetAllJob />} />
                <Route path="ads" element={<CreateAdd />} />
                <Route path="bookings" element={<AllBookingsPage />} />
                <Route path="crm" element={<AddRoles />} />
                <Route path="categories" element={<ManageCategories />} />
                <Route path="logs" element={<AdminAuditLogs />} />
                <Route path="communication-logs" element={<CommunicationLogs />} />
                <Route path="search-logs" element={<SearchLogs />} />
                <Route path="coupons" element={<CouponManagement />} />
                <Route path="reward-settings" element={<RewardSettings />} />
                <Route path="reward-applications" element={<RewardApplications />} />
                <Route path="send-notifications" element={<SendNotifications />} />
                <Route path="add-service/:id" element={<VendorAddService />} />
              </Route>
            )}
            {user?.role === "vendor" && (
              <Route
                path="/vendor"
                element={
                  <PrivateRoute>
                    <VendorLayout />
                  </PrivateRoute>
                }
              >
                <Route path="dashboard" element={<VendorDashboard />} />
                <Route path="services" element={<VendorAddProperty />} />
                <Route path="get-services" element={<VendorServices />} />
                <Route path="my-profile" element={<VendorProfile />} />
                <Route path="inquiry-services" element={<VendorGetInquiry />} />
                <Route path="bookings" element={<VendorBookings />} />
                <Route path="tasks" element={<Task />} />
                <Route path="ads" element={<CreateAdd />} />
                <Route path="apply-reward-code" element={<VendorApplyRedeemCode />} />
                <Route path="upload-service-image" element={<VendoreServiceImagesUpload/>} />
                <Route path="logs" element={<AuditLogsPage />} />
                <Route
                  path="purchase-categories"
                  element={<PurchaseCategories />}
                />
                <Route
                  path="working-hours"
                  element={<UpdateWorkingHoursPage />}
                />
              </Route>
            )}

            <Route
              path="/partner/login"
              element={
                <OpenRoute>
                  <VendorLogin />
                </OpenRoute>
              }
            />
            <Route
              path="/vendor/register"
              element={
                <OpenRoute>
                  <VendorRegister />
                </OpenRoute>
              }
            />
            <Route
              path="/category-purchase"
              element={
                // <OpenRoute>
                  <CategoryPurchasePage />
                // </OpenRoute>
              }
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
    </Suspense>
  );
};

export default App;
