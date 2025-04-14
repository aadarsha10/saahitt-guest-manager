import { useEffect, useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";
import PricingPage from "./pages/Pricing";
import Checkout from "./pages/Checkout";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Privacy from "./pages/Privacy";
import Help from "./pages/Help";
import FAQPage from "./pages/FAQPage";
import EmailSupport from "./pages/EmailSupport";
import ImportGuestsArticle from "./pages/help/ImportGuestsArticle";
import GuestCategoriesArticle from "./pages/help/GuestCategoriesArticle";
import TrackRSVPsArticle from "./pages/help/TrackRSVPsArticle";
import PrintListsArticle from "./pages/help/PrintListsArticle";
import UpgradePlanArticle from "./pages/help/UpgradePlanArticle";
import RSVP from "./pages/RSVP";

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    },
  },
});

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        
        if (data.session) {
          setAuthenticated(true);
        } else {
          setAuthenticated(false);
        }
        setLoading(false);
      } catch (error) {
        console.error("Auth check error:", error);
        setAuthenticated(false);
        setLoading(false);
      }
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("Auth state changed in protected route:", event);
        
        if (event === 'SIGNED_OUT') {
          setAuthenticated(false);
          setLoading(false);
          return;
        }
        
        if (event === 'SIGNED_IN' && session) {
          setAuthenticated(true);
          setLoading(false);
          return;
        }
        
        try {
          // Get the latest session state
          const { data } = await supabase.auth.getSession();
          
          if (data.session) {
            setAuthenticated(true);
          } else {
            setAuthenticated(false);
          }
        } catch (error) {
          console.error("Error checking session after auth state change:", error);
          setAuthenticated(false);
        } finally {
          setLoading(false);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF6F00]"></div>
      </div>
    );
  }

  // Use relative paths for redirects to ensure they work in all environments
  const currentPath = location.pathname + location.search;
  return authenticated ? 
    <>{children}</> : 
    <Navigate to={`/auth?redirect=${encodeURIComponent(currentPath)}`} replace />;
};

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <BrowserRouter>
          <Toaster />
          <Sonner />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/pricing" element={<PricingPage />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/help" element={<Help />} />
            <Route path="/faq" element={<FAQPage />} />
            <Route path="/email-support" element={<EmailSupport />} />
            <Route path="/rsvp/:token" element={<RSVP />} />
            
            {/* Help Articles */}
            <Route path="/help/article/import-guests" element={<ImportGuestsArticle />} />
            <Route path="/help/article/guest-categories" element={<GuestCategoriesArticle />} />
            <Route path="/help/article/track-rsvps" element={<TrackRSVPsArticle />} />
            <Route path="/help/article/print-lists" element={<PrintListsArticle />} />
            <Route path="/help/article/upgrade-plan" element={<UpgradePlanArticle />} />
            
            <Route 
              path="/checkout" 
              element={
                <ProtectedRoute>
                  <Checkout />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
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
