import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { getPlanById, PLANS } from "@/lib/plans";
import { CircleCheck, ChevronRight, Shield, CreditCard } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

interface PlanUpgradeProps {
  currentPlanId: string;
  onPlanSelected?: (planId: string) => void;
}

export const PlanUpgrade = ({ currentPlanId, onPlanSelected }: PlanUpgradeProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  
  const currentPlan = getPlanById(currentPlanId);
  
  const handlePlanSelect = (planId: string) => {
    if (planId === currentPlanId) {
      toast({
        title: "Already on this plan",
        description: `You are already subscribed to the ${getPlanById(planId).name} plan.`,
        variant: "default",
      });
      return;
    }
    
    setSelectedPlan(planId);
    setConfirmDialogOpen(true);
  };
  
  const handleConfirmUpgrade = () => {
    if (!selectedPlan) return;
    
    setConfirmDialogOpen(false);
    
    // If onPlanSelected callback is provided, use it (for in-dashboard flow)
    if (onPlanSelected) {
      onPlanSelected(selectedPlan);
    } else {
      // Otherwise navigate to checkout page (for direct upgrade flow)
      navigate(`/checkout?plan=${selectedPlan}`);
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-semibold">Available Plans</h3>
            <p className="text-sm text-gray-500">
              Choose the plan that suits your needs
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-gray-50 text-gray-700">
              Current Plan: {currentPlan.name}
            </Badge>
          </div>
        </div>

        {/* Plan Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          {PLANS.map((plan) => (
            <Card 
              key={plan.id} 
              className={`overflow-hidden transition-all duration-200 hover:shadow-md ${
                plan.id === currentPlanId ? "border-2 border-[#FF6F00]" : ""
              } ${plan.color}`}
            >
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>{plan.name}</CardTitle>
                  {plan.id === currentPlanId && (
                    <Badge className="bg-[#FF6F00]">Current</Badge>
                  )}
                </div>
                <CardDescription>
                  {plan.id === "free" ? "Free Forever" : `One-time payment`}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <span className="text-3xl font-bold">Nrs. {plan.price}</span>
                </div>
                <ul className="space-y-2 mb-6">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-sm">
                      <CircleCheck className="h-4 w-4 text-green-500 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                {plan.id === currentPlanId ? (
                  <Button variant="outline" className="w-full" disabled>
                    Current Plan
                  </Button>
                ) : (
                  <Button 
                    className={`w-full ${plan.id === "ultimate" ? "bg-purple-600 hover:bg-purple-700" : "bg-[#FF6F00] hover:bg-[#FF6F00]/90"}`}
                    onClick={() => handlePlanSelect(plan.id)}
                  >
                    {plan.id === "free" ? "Downgrade" : "Upgrade"}
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
      
      {/* Confirmation Dialog */}
      <AlertDialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Plan Change</AlertDialogTitle>
            <AlertDialogDescription>
              {selectedPlan && selectedPlan !== "free" ? (
                <>
                  You are about to upgrade to the <strong>{getPlanById(selectedPlan).name}</strong> plan
                  for a one-time payment of <strong>Nrs. {getPlanById(selectedPlan).price}</strong>.
                </>
              ) : (
                <>
                  You are about to downgrade to the <strong>Free</strong> plan.
                  You will lose access to all premium features immediately.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmUpgrade}
              className={selectedPlan === "free" ? "bg-red-600 hover:bg-red-700" : ""}
            >
              {selectedPlan === "free" ? "Confirm Downgrade" : "Continue to Payment"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
