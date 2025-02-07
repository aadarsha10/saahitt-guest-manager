import { ClipboardList, ArrowDownToLine, SortAsc } from "lucide-react";

const steps = [
  {
    title: "Add Your Guests",
    description: "Fill in simple fields like name, relation, and priority.",
    icon: ClipboardList,
  },
  {
    title: "Rank & Sort Automatically",
    description: "Let our system organize your guest list based on priority & availability.",
    icon: SortAsc,
  },
  {
    title: "Download & Print",
    description: "Get a professional guest list ready for your event planning.",
    icon: ArrowDownToLine,
  },
];

export const HowItWorks = () => {
  return (
    <section id="how-it-works" className="py-20">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl font-bold text-center mb-16">
          How It Works
        </h2>
        <div className="grid md:grid-cols-3 gap-12">
          {steps.map((step, index) => (
            <div key={step.title} className="text-center animate-fade-in">
              <div className="relative mb-8">
                <step.icon className="w-16 h-16 mx-auto text-[#9b87f5]" />
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-1/2 -right-6 w-12 border-t-2 border-dashed border-gray-300" />
                )}
              </div>
              <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
              <p className="text-gray-600">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};