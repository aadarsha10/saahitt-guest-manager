import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight, Check } from "lucide-react";

export const Hero = () => {
  return (
    <div className="pt-32 pb-20 text-center bg-gradient-to-b from-purple-50 to-white">
      <div className="container mx-auto px-4">
        <h1 className="text-5xl md:text-6xl font-bold mb-6 animate-fade-in">
          Effortless Event Invitations,
          <span className="text-[#9b87f5]"> Smarter Guest Management!</span>
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto animate-fade-in">
          Say goodbye to messy spreadsheets and manual tracking. Organize your event guest list, 
          rank invites, and export with ease—all in a few clicks.
        </p>
        <div className="flex justify-center space-x-4 animate-fade-in">
          <Link to="/signup">
            <Button size="lg" className="text-lg px-8 bg-[#9b87f5] hover:bg-[#8b5cf6]">
              Start Free <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
          <Button size="lg" variant="outline" className="text-lg px-8">
            Watch Demo
          </Button>
        </div>

        {/* Problem-Solution Section */}
        <div className="mt-32 grid md:grid-cols-2 gap-8 text-left">
          <div className="space-y-6 animate-fade-in">
            <h2 className="text-3xl font-bold mb-8">Without This Tool</h2>
            <div className="space-y-4">
              {[
                "Manually adding guests to Excel",
                "No idea who will attend",
                "Difficult to prioritize VIPs",
                "No easy way to send invites"
              ].map((problem) => (
                <div key={problem} className="flex items-center space-x-3 text-gray-600">
                  <div className="h-6 w-6 rounded-full border-2 border-red-500 flex items-center justify-center">
                    ✕
                  </div>
                  <span>{problem}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="space-y-6 animate-fade-in">
            <h2 className="text-3xl font-bold mb-8">With This Tool</h2>
            <div className="space-y-4">
              {[
                "Add guests instantly, auto-organized",
                "Smart RSVP tracking",
                "AI-powered ranking",
                "Email & WhatsApp integration (coming soon)"
              ].map((solution) => (
                <div key={solution} className="flex items-center space-x-3 text-gray-600">
                  <div className="h-6 w-6 rounded-full bg-green-500 flex items-center justify-center">
                    <Check className="h-4 w-4 text-white" />
                  </div>
                  <span>{solution}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-32 space-y-32">
          {/* Step 1: Add Guests */}
          <div className="flex flex-col md:flex-row items-center justify-between animate-fade-in">
            <div className="md:w-1/2 text-left md:pr-12">
              <h3 className="text-2xl font-bold mb-4">1. Add Your Guests</h3>
              <p className="text-gray-600 mb-6">
                Easily input guest details with our intuitive form. Add names, relationships,
                and priority levels with just a few clicks.
              </p>
              <ul className="space-y-3">
                {["Import manually or via CSV", "Categorize guests instantly", "Track RSVPs effortlessly"].map((feature) => (
                  <li key={feature} className="flex items-center space-x-2">
                    <Check className="h-5 w-5 text-[#9b87f5]" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="md:w-1/2 mt-8 md:mt-0">
              <img 
                src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158"
                alt="Adding guests to list"
                className="w-full max-w-lg mx-auto rounded-lg shadow-xl hover:scale-105 transition-transform duration-300"
              />
            </div>
          </div>

          {/* Step 2: Rank & Sort */}
          <div className="flex flex-col md:flex-row-reverse items-center justify-between animate-fade-in">
            <div className="md:w-1/2 text-left md:pl-12">
              <h3 className="text-2xl font-bold mb-4">2. Rank & Sort Automatically</h3>
              <p className="text-gray-600 mb-6">
                Our smart system automatically organizes your guest list based on priority
                and availability. No more manual sorting needed.
              </p>
              <ul className="space-y-3">
                {["Priority-based sorting", "VIP guest tracking", "Automatic categorization"].map((feature) => (
                  <li key={feature} className="flex items-center space-x-2">
                    <Check className="h-5 w-5 text-[#9b87f5]" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="md:w-1/2 mt-8 md:mt-0">
              <img 
                src="https://images.unsplash.com/photo-1487058792275-0ad4aaf24ca7"
                alt="Automatic guest ranking"
                className="w-full max-w-lg mx-auto rounded-lg shadow-xl hover:scale-105 transition-transform duration-300"
              />
            </div>
          </div>

          {/* Step 3: Download & Print */}
          <div className="flex flex-col md:flex-row items-center justify-between animate-fade-in">
            <div className="md:w-1/2 text-left md:pr-12">
              <h3 className="text-2xl font-bold mb-4">3. Download & Print</h3>
              <p className="text-gray-600 mb-6">
                Generate professional-looking guest lists ready for printing or sharing.
                Export to PDF with just one click.
              </p>
              <ul className="space-y-3">
                {["Professional PDF exports", "Print-ready formats", "Easy sharing options"].map((feature) => (
                  <li key={feature} className="flex items-center space-x-2">
                    <Check className="h-5 w-5 text-[#9b87f5]" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="md:w-1/2 mt-8 md:mt-0">
              <img 
                src="https://images.unsplash.com/photo-1519389950473-47ba0277781c"
                alt="Export and print guest list"
                className="w-full max-w-lg mx-auto rounded-lg shadow-xl hover:scale-105 transition-transform duration-300"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};