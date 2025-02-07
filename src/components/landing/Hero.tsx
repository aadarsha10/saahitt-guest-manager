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
        <div className="mt-12 animate-fade-in">
          <img 
            src="/placeholder.svg" 
            alt="Guest List UI Preview" 
            className="max-w-4xl mx-auto rounded-lg shadow-xl"
          />
        </div>
      </div>
    </div>
  );
};