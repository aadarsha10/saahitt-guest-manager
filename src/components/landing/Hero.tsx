
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight, Check, X } from "lucide-react";

export const Hero = () => {
  return (
    <div className="pt-32 pb-20 text-center bg-[#FAF3E0]" id="hero">
      <div className="container mx-auto px-4">
        <h1 className="text-5xl md:text-6xl font-bold mb-6 animate-fade-in text-[#2C2C2C]">
          Effortless Event Invitations,
          <span className="text-[#FF6F00]"> Smarter Guest Management!</span>
        </h1>
        <p className="text-xl text-[#2C2C2C] mb-8 max-w-2xl mx-auto animate-fade-in">
          Say goodbye to messy spreadsheets and manual tracking. Organize your event guest list, 
          rank invites, and export with ease—all in a few clicks.
        </p>
        <div className="flex justify-center space-x-4 animate-fade-in">
          <Link to="/auth?tab=signup">
            <Button size="lg" className="text-lg px-8 bg-[#FF6F00] hover:bg-[#FF6F00]/90 text-white">
              Start Free <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
          <Button size="lg" variant="outline" className="text-lg px-8 border-[#00796B] text-[#00796B] hover:bg-[#00796B] hover:text-white">
            Watch Demo
          </Button>
        </div>

        {/* Problem-Solution Section */}
        <div className="mt-32 grid md:grid-cols-2 gap-8 text-left">
          <div className="space-y-6 animate-fade-in bg-white p-8 rounded-lg shadow-lg">
            <h2 className="text-3xl font-bold mb-8 text-[#2C2C2C]">Without This Tool</h2>
            <div className="space-y-4">
              {[
                "Manually adding guests to Excel",
                "No idea who will attend",
                "Difficult to prioritize VIPs",
                "No easy way to send invites"
              ].map((problem) => (
                <div key={problem} className="flex items-center space-x-3 text-[#2C2C2C]">
                  <div className="h-6 w-6 rounded-full border-2 border-[#FF6F00] flex items-center justify-center">
                    <X className="h-4 w-4 text-[#FF6F00]" />
                  </div>
                  <span>{problem}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="space-y-6 animate-fade-in bg-white p-8 rounded-lg shadow-lg">
            <h2 className="text-3xl font-bold mb-8 text-[#2C2C2C]">With This Tool</h2>
            <div className="space-y-4">
              {[
                "Add guests instantly, auto-organized",
                "Smart RSVP tracking",
                "AI-powered ranking",
                "Email & WhatsApp integration (coming soon)"
              ].map((solution) => (
                <div key={solution} className="flex items-center space-x-3 text-[#2C2C2C]">
                  <div className="h-6 w-6 rounded-full bg-[#00796B] flex items-center justify-center">
                    <Check className="h-4 w-4 text-white" />
                  </div>
                  <span>{solution}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* How It Works Steps */}
        <div className="mt-32 space-y-32">
          {/* Step 1: Add Guests */}
          <div className="flex flex-col md:flex-row items-center justify-between animate-fade-in">
            <div className="md:w-1/2 text-left md:pr-12">
              <h3 className="text-2xl font-bold mb-4 text-[#2C2C2C]">1. Add Your Guests</h3>
              <p className="text-[#2C2C2C] mb-6">
                Easily input guest details with our intuitive form. Add names, relationships,
                and priority levels with just a few clicks.
              </p>
              <ul className="space-y-3">
                {["Import manually or via CSV", "Categorize guests instantly", "Track RSVPs effortlessly"].map((feature) => (
                  <li key={feature} className="flex items-center space-x-2">
                    <Check className="h-5 w-5 text-[#FF6F00]" />
                    <span className="text-[#2C2C2C]">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="md:w-1/2 mt-8 md:mt-0">
              <div className="bg-[#D9D9D9] w-full h-64 rounded-lg shadow-xl hover:scale-105 transition-transform duration-300 flex items-center justify-center">
                <span className="text-[#2C2C2C]">Guest Input Interface Animation</span>
              </div>
            </div>
          </div>

          {/* Step 2: Rank & Sort */}
          <div className="flex flex-col md:flex-row-reverse items-center justify-between animate-fade-in">
            <div className="md:w-1/2 text-left md:pl-12">
              <h3 className="text-2xl font-bold mb-4 text-[#2C2C2C]">2. Categorize & Rank</h3>
              <p className="text-[#2C2C2C] mb-6">
                Our smart system automatically organizes your guest list based on priority
                and availability. No more manual sorting needed.
              </p>
              <ul className="space-y-3">
                {["Priority-based sorting", "VIP guest tracking", "Automatic categorization"].map((feature) => (
                  <li key={feature} className="flex items-center space-x-2">
                    <Check className="h-5 w-5 text-[#FF6F00]" />
                    <span className="text-[#2C2C2C]">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="md:w-1/2 mt-8 md:mt-0">
              <div className="bg-[#D9D9D9] w-full h-64 rounded-lg shadow-xl hover:scale-105 transition-transform duration-300 flex items-center justify-center">
                <span className="text-[#2C2C2C]">Ranking System Animation</span>
              </div>
            </div>
          </div>

          {/* Step 3: Export & Print */}
          <div className="flex flex-col md:flex-row items-center justify-between animate-fade-in">
            <div className="md:w-1/2 text-left md:pr-12">
              <h3 className="text-2xl font-bold mb-4 text-[#2C2C2C]">3. Export & Print</h3>
              <p className="text-[#2C2C2C] mb-6">
                Generate professional-looking guest lists ready for printing or sharing.
                Export to PDF with just one click.
              </p>
              <ul className="space-y-3">
                {["Professional PDF exports", "Print-ready formats", "Easy sharing options"].map((feature) => (
                  <li key={feature} className="flex items-center space-x-2">
                    <Check className="h-5 w-5 text-[#FF6F00]" />
                    <span className="text-[#2C2C2C]">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="md:w-1/2 mt-8 md:mt-0">
              <div className="bg-[#D9D9D9] w-full h-64 rounded-lg shadow-xl hover:scale-105 transition-transform duration-300 flex items-center justify-center">
                <span className="text-[#2C2C2C]">Export Process Animation</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
