import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PasswordInput } from "@/components/ui/password-input";
import { PasswordStrengthIndicator } from "@/components/ui/password-strength-indicator";
import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";
import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";
import { validatePassword } from "@/lib/passwordValidation";

const Auth = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [authData, setAuthData] = useState({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
  });

  // Get redirect path from URL if present, with fallback handling for Vercel
  const getRedirectPath = () => {
    const searchParams = new URLSearchParams(location.search);
    const redirect = searchParams.get("redirect");
    // Use a relative path to ensure it works in all deployment environments
    return redirect ? decodeURIComponent(redirect) : "/dashboard";
  };

  // Parse URL params to determine initial tab and check for session expiry message
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const tab = searchParams.get("tab");
    const mode = searchParams.get("mode");
    const expired = searchParams.get("expired");
    
    if (mode === "reset") {
      setCurrentView("reset");
    } else if (tab) {
      setActiveTab(tab === "signup" ? "signup" : "signin");
    }
    
    if (expired === "true") {
      toast({
        title: "Session Expired",
        description: "Your session has expired. Please sign in again to continue.",
        variant: "destructive",
      });
    }
  }, [location, toast]);

  // Check for existing session on component mount and redirect if already logged in
  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        const session = data.session;
        
        if (session) {
          // Valid session, redirect
          const redirectPath = getRedirectPath();
          console.log("User is already logged in, redirecting to:", redirectPath);
          navigate(redirectPath, { replace: true });
        }
      } catch (error) {
        console.error("Error checking session:", error);
      }
    };
    
    checkSession();
  }, [navigate, location.search, toast]);

  // Set up auth state change listener with improved error handling
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("Auth state changed:", event, session ? "session exists" : "no session");
        
        if (event === "SIGNED_IN" && session) {
          try {
            // Navigate to the redirect path if provided, otherwise to dashboard
            const redirectPath = getRedirectPath();
            console.log("User signed in, redirecting to:", redirectPath);
            
            // Use replace to prevent back-button issues
            navigate(redirectPath, { replace: true });
          } catch (error) {
            console.error("Error during redirect after sign in:", error);
            toast({
              variant: "destructive",
              title: "Navigation Error",
              description: "There was a problem redirecting you. Please try refreshing the page.",
            });
          }
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate, location.search, toast]);

  const [activeTab, setActiveTab] = useState("signin");
  const [currentView, setCurrentView] = useState<"auth" | "forgot" | "reset">("auth");

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Validate password strength
    const passwordStrength = validatePassword(authData.password);
    if (!passwordStrength.isValid) {
      toast({
        variant: "destructive",
        title: "Weak password",
        description: "Please choose a stronger password that meets all requirements.",
      });
      setIsLoading(false);
      return;
    }
    
    try {
      const { error } = await supabase.auth.signUp({
        email: authData.email,
        password: authData.password,
        options: {
          data: {
            first_name: authData.firstName,
            last_name: authData.lastName,
          },
          emailRedirectTo: `${window.location.origin}/dashboard`,
        },
      });

      if (error) throw error;
      
      toast({
        title: "Success!",
        description: "Please check your email to verify your account.",
      });
      
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: authData.email,
        password: authData.password,
      });

      if (error) {
        // Check for email not confirmed error
        if (error.message.includes("Email not confirmed")) {
          toast({
            variant: "destructive",
            title: "Email Not Verified",
            description: "Please check your email and click the verification link before signing in.",
          });
          return;
        }
        throw error;
      }
      
      // Navigate will happen automatically via the auth state change listener
    } catch (error: any) {
      console.error("Sign in error:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle different views
  if (currentView === "forgot") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <ForgotPasswordForm onBackToSignIn={() => setCurrentView("auth")} />
      </div>
    );
  }

  if (currentView === "reset") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <ResetPasswordForm />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center">Welcome to Saahitt Guest Manager</CardTitle>
          <CardDescription className="text-center">Sign in or create an account to get started</CardDescription>
        </CardHeader>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="signin">Sign In</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>
          <TabsContent value="signin">
            <form onSubmit={handleSignIn}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Input
                    id="email"
                    type="email"
                    placeholder="Email"
                    value={authData.email}
                    onChange={(e) => setAuthData({ ...authData, email: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <PasswordInput
                    id="password"
                    placeholder="Password"
                    value={authData.password}
                    onChange={(e) => setAuthData({ ...authData, password: e.target.value })}
                    required
                  />
                </div>
              </CardContent>
              <CardFooter className="flex flex-col space-y-2">
                <Button className="w-full" type="submit" disabled={isLoading}>
                  {isLoading ? "Signing in..." : "Sign In"}
                </Button>
                <Button 
                  type="button"
                  variant="link" 
                  className="text-sm text-muted-foreground"
                  onClick={() => setCurrentView("forgot")}
                >
                  Forgot your password?
                </Button>
              </CardFooter>
            </form>
          </TabsContent>
          <TabsContent value="signup">
            <form onSubmit={handleSignUp}>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    id="firstName"
                    placeholder="First Name"
                    value={authData.firstName}
                    onChange={(e) => setAuthData({ ...authData, firstName: e.target.value })}
                    required
                  />
                  <Input
                    id="lastName"
                    placeholder="Last Name"
                    value={authData.lastName}
                    onChange={(e) => setAuthData({ ...authData, lastName: e.target.value })}
                    required
                  />
                </div>
                <Input
                  id="email"
                  type="email"
                  placeholder="Email"
                  value={authData.email}
                  onChange={(e) => setAuthData({ ...authData, email: e.target.value })}
                  required
                />
                <div className="space-y-2">
                  <PasswordInput
                    id="password"
                    placeholder="Password"
                    value={authData.password}
                    onChange={(e) => setAuthData({ ...authData, password: e.target.value })}
                    required
                  />
                  <PasswordStrengthIndicator password={authData.password} />
                </div>
              </CardContent>
              <CardFooter>
                <Button className="w-full" type="submit" disabled={isLoading}>
                  {isLoading ? "Creating account..." : "Create Account"}
                </Button>
              </CardFooter>
            </form>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
};

export default Auth;
