import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export const Hero = () => {
  return (
    <div className="pt-32 pb-20 text-center bg-gradient-to-b from-purple-50 to-white">
      <div className="container mx-auto px-4">
        <h1 className="text-5xl md:text-6xl font-bold mb-6 animate-fade-in">
          The Easiest Way to Plan Your
          <span className="text-[#9b87f5]"> Event Guest List</span>
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto animate-fade-in">
          Sort, rank, and track your invites effortlessly – no spreadsheets needed!
        </p>
        <div className="flex justify-center space-x-4 animate-fade-in">
          <Link to="/signup">
            <Button size="lg" className="text-lg px-8 bg-[#9b87f5] hover:bg-[#8b5cf6]">
              Try for Free
            </Button>
          </Link>
          <Link to="/#features">
            <Button size="lg" variant="outline" className="text-lg px-8">
              Learn More
            </Button>
          </Link>
        </div>

        <div className="mt-20 space-y-32">
          {/* Step 1: Add Guests */}
          <div className="flex flex-col md:flex-row items-center justify-between animate-fade-in">
            <div className="md:w-1/2 text-left md:pr-12">
              <h3 className="text-2xl font-bold mb-4">1. Add Your Guests</h3>
              <p className="text-gray-600">
                Easily input guest details with our intuitive form. Add names, relationships,
                and priority levels with just a few clicks.
              </p>
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
              <p className="text-gray-600">
                Our smart system automatically organizes your guest list based on priority
                and availability. No more manual sorting needed.
              </p>
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
              <p className="text-gray-600">
                Generate professional-looking guest lists ready for printing or sharing.
                Export to PDF with just one click.
              </p>
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