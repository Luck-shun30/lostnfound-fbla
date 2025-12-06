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
  const [isTeacher, setIsTeacher] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        checkTeacherStatus(session.user.id);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        checkTeacherStatus(session.user.id);
      } else {
        setIsTeacher(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkTeacherStatus = async (userId: string) => {
    const { data } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId);
    
    const hasAccess = data?.some(r => r.role === "teacher" || r.role === "admin");
    setIsTeacher(!!hasAccess);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast.success("Signed out successfully");
    navigate("/");
  };

  return (
    <nav className="fixed top-0 w-full z-50 liquid-glass-subtle">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/items" className="flex items-center space-x-2">
            <div className="w-10 h-10 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center">
              <Search className="w-6 h-6 text-primary" />
            </div>
            <span className="text-xl font-bold text-foreground text-glow">
              Lost & Found
            </span>
          </Link>

          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/items")}
              className="hidden md:flex text-muted-foreground hover:text-foreground"
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
                  className="glass-button text-primary"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Report Found Item
                </Button>

                {isTeacher && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate("/admin")}
                    className="border-primary/30 text-primary hover:bg-primary/10"
                  >
                    <LayoutDashboard className="w-4 h-4 mr-2" />
                    Admin
                  </Button>
                )}

                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleSignOut}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </Button>
              </>
            ) : (
              <Button
                variant="default"
                size="sm"
                onClick={() => navigate("/")}
                className="glass-button text-primary"
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
