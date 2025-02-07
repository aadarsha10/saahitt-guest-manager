import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const plans = [
  {
    name: "Free",
    price: "0",
    features: [
      "Up to 100 guests",
      "Basic sorting & ranking",
      "PDF exports",
      "Print-ready lists",
    ],
  },
  {
    name: "Premium",
    price: "1,500",
    features: [
      "Up to 500 guests",
      "Bulk import from CSV/Excel",
      "Custom categories & tagging",
      "Advanced filters",
      "Priority groups",
    ],
  },
  {
    name: "Ultimate",
    price: "5,000",
    features: [
      "Up to 2,000 guests",
      "Smart ranking suggestions",
      "Event roles assignment",
      "Customizable export templates",
      "Analytics dashboard",
    ],
  },
];

export const Pricing = () => {
  return (
    <section id="pricing" className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl font-bold text-center mb-4">Simple Pricing</h2>
        <p className="text-xl text-gray-600 text-center mb-12">One-time payment. No subscriptions.</p>
        
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-8 animate-fade-in"
            >
              <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
              <div className="mb-6">
                <span className="text-4xl font-bold">Nrs. {plan.price}</span>
                {plan.price === "0" ? (
                  <span className="text-gray-600"> forever</span>
                ) : (
                  <span className="text-gray-600"> one-time</span>
                )}
              </div>
              <ul className="space-y-4 mb-8">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2">
                    <Check className="w-5 h-5 text-[#9b87f5]" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <Link to="/signup">
                <Button className="w-full bg-[#9b87f5] hover:bg-[#8b5cf6]">
                  Get Started
                </Button>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};