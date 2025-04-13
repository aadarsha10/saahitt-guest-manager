
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
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
          // Check if session is older than 24 hours using user.created_at
          const sessionCreatedAt = new Date(session.user.aud === 'authenticated' ? session.user.created_at : Date.now()).getTime();
          const currentTime = new Date().getTime();
          const dayInMs = 24 * 60 * 60 * 1000;
          
          if (currentTime - sessionCreatedAt > dayInMs) {
            // Session expired, sign out and redirect to auth page with expired flag
            console.log("Session expired (older than 24 hours). Signing out...");
            await supabase.auth.signOut();
            setAuthenticated(false);
            setLoading(false);
            navigate('/auth?expired=true', { replace: true });
            return;
          }
          
          // Valid session
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
        
        // For SIGNED_OUT events, make sure we update state immediately
        if (event === 'SIGNED_OUT') {
          setAuthenticated(false);
          setLoading(false);
          return;
        }
        
        // For other events, verify session 
        try {
          // Get the latest session state
          const { data } = await supabase.auth.getSession();
          
          if (data.session) {
            // Check session age for expiration using user.created_at
            const sessionCreatedAt = new Date(data.session.user.aud === 'authenticated' ? data.session.user.created_at : Date.now()).getTime();
            const currentTime = new Date().getTime();
            const dayInMs = 24 * 60 * 60 * 1000;
            
            if (currentTime - sessionCreatedAt > dayInMs) {
              // Session expired, sign out and redirect
              console.log("Session expired during auth state change. Signing out...");
              await supabase.auth.signOut();
              setAuthenticated(false);
              navigate('/auth?expired=true', { replace: true });
            } else {
              setAuthenticated(true);
            }
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
  }, [location.pathname, navigate]);

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
