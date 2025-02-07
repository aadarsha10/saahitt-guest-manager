import { CheckCircle2, FileSpreadsheet, Users, Printer } from "lucide-react";

const features = [
  {
    title: "Ditch the Spreadsheets",
    description: "Automated ranking saves time and eliminates manual sorting.",
    icon: FileSpreadsheet,
  },
  {
    title: "No More Guesswork",
    description: "See confirmed, maybe, and unavailable guests instantly.",
    icon: Users,
  },
  {
    title: "Professional Exports",
    description: "Get polished, print-ready guest lists with one click.",
    icon: Printer,
  },
];

export const Features = () => {
  return (
    <section id="features" className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl font-bold text-center mb-12">
          Why Choose <span className="text-[#9b87f5]">Saahitt</span>?
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="bg-white p-8 rounded-lg shadow-sm hover:shadow-md transition-shadow animate-fade-in"
            >
              <feature.icon className="w-12 h-12 text-[#9b87f5] mb-4" />
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};