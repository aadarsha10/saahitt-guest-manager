import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export const Navbar = () => {
  return (
    <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-sm z-50 border-b border-[#D9D9D9]">
      <div className="container mx-auto px-4 h-20 flex items-center justify-between">
        <div className="flex items-center space-x-8">
          <Link to="/" className="flex items-center">
            <img 
              src="https://saahitt.com/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Fmain-logo.0a76fcc4.png&w=640&q=75" 
              alt="Saahitt Logo" 
              className="h-12 w-auto"
            />
          </Link>
          <div className="hidden md:flex space-x-6">
            <Link to="/#features" className="text-[#2C2C2C] hover:text-[#FF6F00]">
              Features
            </Link>
            <Link to="/#how-it-works" className="text-[#2C2C2C] hover:text-[#FF6F00]">
              How It Works
            </Link>
            <Link to="/#pricing" className="text-[#2C2C2C] hover:text-[#FF6F00]">
              Pricing
            </Link>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <Link to="/login">
            <Button variant="ghost" className="text-[#2C2C2C] hover:text-[#FF6F00]">Log in</Button>
          </Link>
          <Link to="/signup">
            <Button className="bg-[#FF6F00] hover:bg-[#FF6F00]/90 text-white">Get Started</Button>
          </Link>
        </div>
      </div>
    </nav>
  );
};