import { Link } from "react-router-dom";

export const Footer = () => {
  return (
    <footer className="bg-[#D9D9D9] text-[#2C2C2C] py-12">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <img 
              src="https://saahitt.com/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Fmain-logo.0a76fcc4.png&w=640&q=75" 
              alt="Saahitt Logo" 
              className="h-12 w-auto mb-4"
            />
            <p className="text-sm">Making event planning easier, one guest list at a time.</p>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li><Link to="/#features" className="hover:text-[#FF6F00]">Features</Link></li>
              <li><Link to="/#pricing" className="hover:text-[#FF6F00]">Pricing</Link></li>
              <li><Link to="/#how-it-works" className="hover:text-[#FF6F00]">How It Works</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Company</h4>
            <ul className="space-y-2">
              <li><Link to="/about" className="hover:text-[#FF6F00]">About Saahitt</Link></li>
              <li><Link to="/contact" className="hover:text-[#FF6F00]">Contact</Link></li>
              <li><Link to="/privacy" className="hover:text-[#FF6F00]">Privacy Policy</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Support</h4>
            <ul className="space-y-2">
              <li><Link to="/help" className="hover:text-[#FF6F00]">Help Center</Link></li>
              <li><Link to="/faq" className="hover:text-[#FF6F00]">FAQs</Link></li>
              <li><a href="mailto:support@saahitt.com" className="hover:text-[#FF6F00]">Email Support</a></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-[#8D9440] mt-12 pt-8 text-center text-sm">
          <p>&copy; {new Date().getFullYear()} Saahitt. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};