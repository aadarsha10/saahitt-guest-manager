import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export const Navbar = () => {
  return (
    <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-sm z-50 border-b">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-8">
          <Link to="/" className="text-2xl font-bold text-primary">
            Saahitt
          </Link>
          <div className="hidden md:flex space-x-6">
            <Link to="/#features" className="text-gray-600 hover:text-primary">
              Features
            </Link>
            <Link to="/#pricing" className="text-gray-600 hover:text-primary">
              Pricing
            </Link>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <Link to="/login">
            <Button variant="ghost">Log in</Button>
          </Link>
          <Link to="/signup">
            <Button>Get Started</Button>
          </Link>
        </div>
      </div>
    </nav>
  );
};