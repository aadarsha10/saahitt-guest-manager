
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { PlusCircle, Users, CalendarDays, Settings, ListFilter } from "lucide-react";
import AddGuestForm from "@/components/guests/AddGuestForm";
import GuestList from "@/components/guests/GuestList";
import CategoryList from "@/components/categories/CategoryList";
import AddCategoryForm from "@/components/categories/AddCategoryForm";
import CustomFieldsManager from "@/components/settings/CustomFieldsManager";

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [profile, setProfile] = useState<any>(null);
  const [guestFormOpen, setGuestFormOpen] = useState(false);
  const [categoryFormOpen, setCategoryFormOpen] = useState(false);

  useEffect(() => {
    checkUser();
    getProfile();
  }, []);

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/auth");
    }
  };

  const getProfile = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Error fetching profile",
      });
    }
  };

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      navigate("/");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <img 
                src="https://saahitt.com/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Fmain-logo.0a76fcc4.png&w=640&q=75" 
                alt="Saahitt Logo" 
                className="h-8 w-auto mr-8"
              />
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">Welcome, {profile?.first_name}!</span>
              <Button variant="outline" onClick={handleSignOut}>
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <Tabs defaultValue="guests" className="space-y-6">
          <TabsList className="bg-white p-1 space-x-2">
            <TabsTrigger value="guests" className="space-x-2">
              <Users className="h-4 w-4" />
              <span>Guest List</span>
            </TabsTrigger>
            <TabsTrigger value="categories" className="space-x-2">
              <ListFilter className="h-4 w-4" />
              <span>Categories</span>
            </TabsTrigger>
            <TabsTrigger value="events" className="space-x-2">
              <CalendarDays className="h-4 w-4" />
              <span>Events</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="space-x-2">
              <Settings className="h-4 w-4" />
              <span>Settings</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="guests">
            <div className="grid gap-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Guest List</h2>
                <Dialog open={guestFormOpen} onOpenChange={setGuestFormOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-[#FF6F00] hover:bg-[#FF6F00]/90">
                      <PlusCircle className="h-4 w-4 mr-2" />
                      Add Guest
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[600px]">
                    <AddGuestForm onSuccess={() => {
                      setGuestFormOpen(false);
                      window.location.reload();
                    }} />
                  </DialogContent>
                </Dialog>
              </div>
              <GuestList />
            </div>
          </TabsContent>

          <TabsContent value="categories">
            <div className="grid gap-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Categories</h2>
                <Dialog open={categoryFormOpen} onOpenChange={setCategoryFormOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-[#FF6F00] hover:bg-[#FF6F00]/90">
                      <PlusCircle className="h-4 w-4 mr-2" />
                      Add Category
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[600px]">
                    <AddCategoryForm onSuccess={() => {
                      setCategoryFormOpen(false);
                      window.location.reload();
                    }} />
                  </DialogContent>
                </Dialog>
              </div>
              <CategoryList />
            </div>
          </TabsContent>

          <TabsContent value="events">
            <Card>
              <CardHeader>
                <CardTitle>Your Events</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Create and manage your events. Track RSVPs and manage guest lists for each event.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings">
            <div className="space-y-6">
              <h2 className="text-2xl font-bold">Settings</h2>
              <CustomFieldsManager />
              <Card>
                <CardHeader>
                  <CardTitle>Account Settings</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    Manage your account settings, notifications, and preferences.
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;
