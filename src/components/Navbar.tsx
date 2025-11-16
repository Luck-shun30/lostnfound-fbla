import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Search, Plus, LayoutDashboard, LogOut, LogIn } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";
import { toast } from "sonner";

export const Navbar = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        checkAdminStatus(session.user.id);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        checkAdminStatus(session.user.id);
      } else {
        setIsAdmin(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkAdminStatus = async (userId: string) => {
    const { data } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .eq("role", "admin")
      .single();
    setIsAdmin(!!data);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast.success("Signed out successfully");
    navigate("/");
  };

  return (
    <nav className="fixed top-0 w-full z-50 backdrop-blur-lg bg-glass/80 border-b border-glass-border">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 rounded-lg bg-gradient-primary flex items-center justify-center">
              <Search className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Lost & Found
            </span>
          </Link>

          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/items")}
              className="hidden md:flex"
            >
              <Search className="w-4 h-4 mr-2" />
              Browse Items
            </Button>

            {user ? (
              <>
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => navigate("/submit")}
                  className="bg-gradient-primary hover:opacity-90"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Report Found Item
                </Button>

                {isAdmin && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate("/admin")}
                  >
                    <LayoutDashboard className="w-4 h-4 mr-2" />
                    Admin
                  </Button>
                )}

                <Button variant="ghost" size="sm" onClick={handleSignOut}>
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </Button>
              </>
            ) : (
              <Button
                variant="default"
                size="sm"
                onClick={() => navigate("/auth")}
                className="bg-gradient-primary hover:opacity-90"
              >
                <LogIn className="w-4 h-4 mr-2" />
                Sign In
              </Button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
