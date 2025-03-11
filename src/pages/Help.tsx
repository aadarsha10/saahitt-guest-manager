
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";
import { Search, FileText, HelpCircle, Mail, BookOpen, Video } from "lucide-react";
import { useState } from "react";

const helpCategories = [
  {
    title: "Getting Started",
    icon: <BookOpen className="h-8 w-8 text-[#FF6F00]" />,
    description: "Learn the basics of Saahitt Guest Manager",
    link: "/help/getting-started"
  },
  {
    title: "Guest Management",
    icon: <FileText className="h-8 w-8 text-[#FF6F00]" />,
    description: "How to add, edit, and organize your guest list",
    link: "/help/guest-management"
  },
  {
    title: "Plans & Billing",
    icon: <HelpCircle className="h-8 w-8 text-[#FF6F00]" />,
    description: "Information about our subscription plans",
    link: "/help/billing"
  },
  {
    title: "Video Tutorials",
    icon: <Video className="h-8 w-8 text-[#FF6F00]" />,
    description: "Step-by-step visual guides",
    link: "/help/tutorials"
  }
];

const popularArticles = [
  {
    title: "How to import guests from a spreadsheet",
    link: "/help/article/import-guests"
  },
  {
    title: "Setting up categories for your guest list",
    link: "/help/article/guest-categories"
  },
  {
    title: "Tracking RSVPs and responses",
    link: "/help/article/track-rsvps"
  },
  {
    title: "Generating printable guest lists",
    link: "/help/article/print-lists"
  },
  {
    title: "Upgrading your subscription plan",
    link: "/help/article/upgrade-plan"
  }
];

const Help = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Search functionality would be implemented here
    console.log("Searching for:", searchQuery);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar />
      <main className="flex-grow pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Help Center Hero */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-[#2C2C2C] mb-6">Help Center</h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
              Find answers to your questions about Saahitt Guest Manager
            </p>
            
            <form onSubmit={handleSearch} className="max-w-2xl mx-auto relative">
              <Input
                type="text"
                placeholder="Search for help articles..."
                className="pr-12 py-6 text-lg"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Button 
                type="submit" 
                className="absolute right-0 top-0 bottom-0 bg-[#FF6F00] hover:bg-[#FF6F00]/90"
                size="icon"
              >
                <Search className="h-5 w-5" />
              </Button>
            </form>
          </div>
          
          {/* Help Categories */}
          <div className="mb-16">
            <h2 className="text-2xl font-semibold mb-8 text-center">Browse Help Categories</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {helpCategories.map((category, index) => (
                <Link 
                  key={index} 
                  to={category.link}
                  className="bg-white rounded-lg p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
                >
                  <div className="flex flex-col items-center text-center">
                    <div className="mb-4">
                      {category.icon}
                    </div>
                    <h3 className="text-lg font-semibold mb-2">{category.title}</h3>
                    <p className="text-gray-600">{category.description}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
          
          {/* Popular Articles */}
          <div className="mb-16">
            <h2 className="text-2xl font-semibold mb-6">Popular Articles</h2>
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 divide-y">
              {popularArticles.map((article, index) => (
                <Link 
                  key={index} 
                  to={article.link}
                  className="block p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center">
                    <FileText className="h-5 w-5 text-[#FF6F00] mr-3 shrink-0" />
                    <span>{article.title}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
          
          {/* Contact Support CTA */}
          <div className="bg-[#FFF8F0] rounded-lg p-8 text-center max-w-3xl mx-auto">
            <Mail className="h-12 w-12 text-[#FF6F00] mx-auto mb-4" />
            <h2 className="text-2xl font-semibold mb-3">Still Need Help?</h2>
            <p className="text-gray-600 mb-6">
              Can't find what you're looking for? Our support team is ready to assist you.
            </p>
            <Link to="/contact">
              <Button className="bg-[#FF6F00] hover:bg-[#FF6F00]/90">
                Contact Support
              </Button>
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Help;
