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
const queryClient = new QueryClient();

const App = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />

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
              </Route>
            )}

            <Route
              path="/vendor/login"
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
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
