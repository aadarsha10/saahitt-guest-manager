
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { User } from 'lucide-react';

interface Profile {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
}

const AccountSettings = () => {
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    getProfile();
  }, []);

  const getProfile = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;

      // Create a profile object from user metadata
      const userProfile = {
        id: session.user.id,
        first_name: session.user.user_metadata.first_name || '',
        last_name: session.user.user_metadata.last_name || '',
        email: session.user.email || '',
      };
      
      setProfile(userProfile);
      
      // Check if profiles table exists by trying to insert/update the profile
      try {
        const { error } = await supabase
          .from("profiles")
          .upsert({
            id: session.user.id,
            first_name: userProfile.first_name,
            last_name: userProfile.last_name,
            email: userProfile.email,
            plan_type: 'free' // Default plan type
          });
        
        if (error && error.code !== '42P01') { // If error is not "relation does not exist"
          console.error("Error upserting profile:", error);
        }
      } catch (error) {
        console.error("Error with profiles table:", error);
        // Continue even if profiles table doesn't exist
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Error loading profile",
      });
    }
  };

  const updateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    setLoading(true);
    try {
      // Update user metadata
      const { error: authError } = await supabase.auth.updateUser({
        data: {
          first_name: profile.first_name,
          last_name: profile.last_name,
        },
      });

      if (authError) throw authError;

      // Try to update profiles table, but don't fail if it doesn't exist
      try {
        await supabase
          .from("profiles")
          .update({
            first_name: profile.first_name,
            last_name: profile.last_name,
          })
          .eq("id", profile.id);
      } catch (error) {
        console.error("Could not update profiles table:", error);
        // Continue even if profiles table update fails
      }

      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Error updating profile",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!profile) return null;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center space-x-2">
          <User className="h-5 w-5 text-gray-500" />
          <CardTitle>Account Settings</CardTitle>
        </div>
        <CardDescription>
          Manage your personal information and email preferences.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={updateProfile} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                value={profile.first_name || ""}
                onChange={(e) => setProfile({ ...profile, first_name: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                value={profile.last_name || ""}
                onChange={(e) => setProfile({ ...profile, last_name: e.target.value })}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={profile.email || ""}
              disabled
              className="bg-gray-50"
            />
            <p className="text-sm text-gray-500">
              Email cannot be changed. Contact support if you need to update your email.
            </p>
          </div>
          <div className="flex justify-end">
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default AccountSettings;
