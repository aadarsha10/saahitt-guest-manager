
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { getPlanById, getPlanNumericPrice } from "@/lib/plans";
import { ArrowLeft, CreditCard, Check, ChevronRight, AlertCircle, Shield } from "lucide-react";
import { Steps } from "@/components/checkout/Steps";
import { PaymentProviderSelector } from "@/components/checkout/PaymentProviderSelector";
import { usePaymentProcessor } from "@/hooks/usePaymentProcessor";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const Checkout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [step, setStep] = useState(1);
  const [planId, setPlanId] = useState<string>("free");
  const [customer, setCustomer] = useState({
    name: "",
    email: "",
    phone: "",
  });
  const [selectedPaymentProvider, setSelectedPaymentProvider] = useState("credit-card");
  
  const { processPayment } = usePaymentProcessor();
  
  useEffect(() => {
    const checkAuth = async () => {
      // Get plan from URL
      const params = new URLSearchParams(location.search);
      const plan = params.get("plan");
      
      if (!plan || !["pro", "ultimate"].includes(plan)) {
        toast({
          title: "Invalid Plan",
          description: "Please select a valid plan from our pricing page",
          variant: "destructive",
        });
        navigate("/pricing");
        return;
      }
      
      setPlanId(plan);
      
      // Check if user is authenticated
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({
          title: "Authentication Required",
          description: "Please sign in to upgrade your plan",
          variant: "destructive",
        });
        navigate("/auth?tab=signin&redirect=/pricing");
        return;
      }
      
      // Get user details
      const { data: profile, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .single();
        
      if (!error && profile) {
        setCustomer({
          name: `${profile.first_name || ""} ${profile.last_name || ""}`.trim(),
          email: profile.email || session.user.email || "",
          phone: "",
        });
        
        // If user already has this plan, redirect
        if (profile.plan_type === plan) {
          toast({
            title: "Already Subscribed",
            description: `You are already on the ${getPlanById(plan).name} plan`,
          });
          navigate("/dashboard");
          return;
        }
      }
      
      setLoading(false);
    };
    
    checkAuth();
  }, [location.search, navigate, toast]);
  
  const handleBackClick = () => {
    if (step > 1) {
      setStep(step - 1);
    } else {
      navigate("/pricing");
    }
  };
  
  const handleNextClick = () => {
    if (step === 1) {
      if (!validateCustomerInfo()) return;
      setStep(2);
    } else if (step === 2) {
      handlePayment();
    }
  };
  
  const validateCustomerInfo = () => {
    if (!customer.name.trim()) {
      toast({
        title: "Missing Information",
        description: "Please enter your name",
        variant: "destructive",
      });
      return false;
    }
    
    if (!customer.email.trim() || !customer.email.includes("@")) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
      return false;
    }
    
    return true;
  };
  
  const handlePayment = async () => {
    setProcessing(true);
    
    try {
      // Process payment using selected provider
      const success = await processPayment({
        amount: getPlanNumericPrice(planId),
        currency: "NPR",
        provider: selectedPaymentProvider,
        metadata: {
          planId,
          customerName: customer.name,
          customerEmail: customer.email,
        },
      });
      
      if (success) {
        // Update user's plan in the database
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) throw new Error("No active session");
        
        const { error } = await supabase
          .from("profiles")
          .update({ plan_type: planId })
          .eq("id", session.user.id);
          
        if (error) throw error;
        
        // Show success message
        toast({
          title: "Upgrade Successful",
          description: `You've successfully upgraded to the ${getPlanById(planId).name} plan!`,
        });
        
        // Redirect to dashboard
        navigate("/dashboard");
      } else {
        throw new Error("Payment failed");
      }
    } catch (error: any) {
      console.error("Payment error:", error);
      toast({
        title: "Payment Failed",
        description: error.message || "There was a problem processing your payment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };
  
  const plan = getPlanById(planId);
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse">Loading checkout...</div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <Button 
          variant="ghost" 
          onClick={handleBackClick}
          className="mb-6 flex items-center"
          disabled={processing}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          {step > 1 ? "Back" : "Return to Plans"}
        </Button>
        
        <div className="mb-8">
          <Steps currentStep={step} />
        </div>
        
        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            {step === 1 && (
              <Card>
                <CardHeader>
                  <CardTitle>Customer Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input 
                      id="name" 
                      value={customer.name} 
                      onChange={(e) => setCustomer({...customer, name: e.target.value})}
                      placeholder="Enter your full name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input 
                      id="email" 
                      type="email"
                      value={customer.email} 
                      onChange={(e) => setCustomer({...customer, email: e.target.value})}
                      placeholder="Enter your email address"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number (Optional)</Label>
                    <Input 
                      id="phone" 
                      value={customer.phone} 
                      onChange={(e) => setCustomer({...customer, phone: e.target.value})}
                      placeholder="Enter your phone number"
                    />
                  </div>
                </CardContent>
              </Card>
            )}
            
            {step === 2 && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Payment Method</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <PaymentProviderSelector
                      selectedProvider={selectedPaymentProvider}
                      onSelect={setSelectedPaymentProvider}
                    />
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Payment Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Payment form fields based on selected provider */}
                    {selectedPaymentProvider === "credit-card" && (
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="card-number">Card Number</Label>
                          <Input 
                            id="card-number" 
                            placeholder="4111 1111 1111 1111" 
                            maxLength={19}
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="expiry">Expiry Date</Label>
                            <Input id="expiry" placeholder="MM/YY" maxLength={5} />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="cvc">CVC</Label>
                            <Input id="cvc" placeholder="123" maxLength={3} />
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {selectedPaymentProvider === "bank-transfer" && (
                      <div>
                        <Alert>
                          <AlertCircle className="h-4 w-4" />
                          <AlertTitle>Bank Transfer Instructions</AlertTitle>
                          <AlertDescription>
                            Please transfer Nrs. {plan.price} to our bank account:<br/>
                            Account Name: Saahitt Events<br/>
                            Account Number: 1234567890<br/>
                            Bank: Nepal Bank Limited<br/>
                            Reference: Your email address
                          </AlertDescription>
                        </Alert>
                      </div>
                    )}
                    
                    {selectedPaymentProvider === "mobile-payment" && (
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="mobile-number">Mobile Number</Label>
                          <Input id="mobile-number" placeholder="98XXXXXXXX" />
                        </div>
                        <Alert>
                          <AlertDescription>
                            You will receive a payment confirmation code on this mobile number.
                          </AlertDescription>
                        </Alert>
                      </div>
                    )}
                    
                    <div className="pt-2">
                      <Alert variant="default" className="bg-[#f8f9fa] border-gray-200">
                        <Shield className="h-4 w-4 text-gray-500" />
                        <AlertDescription className="text-gray-600 text-sm">
                          Your payment information is secured with industry-standard encryption.
                        </AlertDescription>
                      </Alert>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
          
          {/* Order Summary */}
          <div className="md:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="font-medium">{plan.name} Plan</span>
                  <span>Nrs. {plan.price}</span>
                </div>
                <div className="border-t pt-4">
                  <div className="flex justify-between font-bold">
                    <span>Total</span>
                    <span>Nrs. {plan.price}</span>
                  </div>
                </div>
                <div className="pt-2">
                  <h4 className="font-medium mb-2">Plan includes:</h4>
                  <ul className="space-y-1">
                    {plan.features.slice(0, 3).map((feature) => (
                      <li key={feature} className="flex items-start gap-2 text-sm">
                        <Check className="h-4 w-4 text-green-500 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                    {plan.features.length > 3 && (
                      <li className="text-sm text-gray-500 italic pl-6">
                        + {plan.features.length - 3} more features
                      </li>
                    )}
                  </ul>
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  className="w-full flex justify-between items-center bg-[#FF6F00] hover:bg-[#FF6F00]/90"
                  onClick={handleNextClick}
                  disabled={processing}
                >
                  <span>{processing ? "Processing..." : step === 1 ? "Continue to Payment" : "Complete Purchase"}</span>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
