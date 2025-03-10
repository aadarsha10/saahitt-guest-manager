
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PlanUpgrade } from "@/components/settings/PlanUpgrade";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { Separator } from "@/components/ui/separator";
import { Shield, CreditCard, CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { getPlanById } from "@/lib/plans";

interface PlanManagementViewProps {
  profile: any;
  onRefreshProfile: () => void;
}

const PlanManagementView = ({ profile, onRefreshProfile }: PlanManagementViewProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const currentPlanId = profile?.plan_type || "free";
  
  const handlePlanSelected = (planId: string) => {
    if (planId === "free") {
      // Handle downgrade to free plan directly (no payment needed)
      handleDowngradeToFree();
    } else {
      // Open payment dialog for premium plans
      setSelectedPlanId(planId);
      setPaymentDialogOpen(true);
    }
  };
  
  const handleDowngradeToFree = async () => {
    setIsProcessing(true);
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) throw new Error("No active session");
      
      // Downgrade to free plan
      const { error } = await supabase
        .from("profiles")
        .update({ plan_type: "free" })
        .eq("id", session.user.id);
        
      if (error) throw error;
      
      toast({
        title: "Plan Downgraded",
        description: "You have been downgraded to the Free plan",
      });
      
      // Refresh profile data
      onRefreshProfile();
    } catch (error) {
      console.error("Error downgrading plan:", error);
      toast({
        title: "Error",
        description: "Could not downgrade your plan. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };
  
  const handleGoToCheckout = () => {
    if (!selectedPlanId) return;
    
    setPaymentDialogOpen(false);
    navigate(`/checkout?plan=${selectedPlanId}`);
  };
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Plan Management</CardTitle>
          <CardDescription>View and manage your subscription plan</CardDescription>
        </CardHeader>
        <CardContent>
          <PlanUpgrade 
            currentPlanId={currentPlanId} 
            onPlanSelected={handlePlanSelected} 
          />
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Payment Information</CardTitle>
          <CardDescription>Billing and payment details</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex flex-col space-y-1">
              <span className="text-sm font-medium text-gray-500">Current Plan</span>
              <span className="font-medium">{getPlanById(currentPlanId).name}</span>
            </div>
            
            <Separator />
            
            <div className="flex flex-col space-y-1">
              <span className="text-sm font-medium text-gray-500">Payment Type</span>
              <span className="font-medium">One-time Payment</span>
            </div>
            
            <div className="rounded-md bg-gray-50 p-4 mt-6">
              <div className="flex gap-2 items-center text-gray-600">
                <Shield className="h-5 w-5 text-gray-500" />
                <span className="text-sm">
                  For billing questions, contact support@saahitt.com
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Payment dialog */}
      <Dialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Continue to Checkout</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="mb-4">
              You're about to upgrade to the <strong>{selectedPlanId && getPlanById(selectedPlanId).name}</strong> plan.
            </p>
            
            <div className="bg-yellow-50 border border-yellow-100 p-4 rounded-md mb-6">
              <div className="flex gap-2">
                <CreditCard className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-yellow-700">
                  You'll be directed to our secure checkout page to complete your payment.
                </div>
              </div>
            </div>
            
            <div className="flex justify-end gap-2 mt-4">
              <button 
                className="px-4 py-2 border rounded-md text-gray-600 hover:bg-gray-50"
                onClick={() => setPaymentDialogOpen(false)}
              >
                Cancel
              </button>
              <button 
                className="px-4 py-2 rounded-md bg-[#FF6F00] text-white hover:bg-[#FF6F00]/90 flex items-center gap-2"
                onClick={handleGoToCheckout}
                disabled={isProcessing}
              >
                <CheckCircle className="h-4 w-4" />
                Continue to Checkout
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PlanManagementView;
