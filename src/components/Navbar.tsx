import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Search, Plus, LayoutDashboard, LogOut, LogIn, Menu, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";
import { toast } from "sonner";

export const Navbar = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [isTeacher, setIsTeacher] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
    setMobileMenuOpen(false);
  };

  const handleNavigate = (path: string, state?: object) => {
    navigate(path, state ? { state } : undefined);
    setMobileMenuOpen(false);
  };

  return (
    <nav className="fixed top-0 w-full z-50 bg-white/95 border-b-4 border-accent-green">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/items" aria-label="Go to items" className="flex items-center space-x-2">
            <div className="w-10 h-10 rounded-lg bg-accent-green flex items-center justify-center">
              <Search className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-foreground">Lost & Found</span>
          </Link>

          {/* Desktop navigation */}
          <div className="hidden md:flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/items")}
              aria-label="Browse items"
              className="text-muted-foreground hover:text-foreground"
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
                  aria-label="Report found item"
                  className="nb-button bg-accent-gold text-black hover:bg-accent-gold/90 border-black"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Report Found Item
                </Button>

                {isTeacher && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate("/admin")}
                    aria-label="Open admin dashboard"
                    className="nb-outline text-foreground"
                  >
                    <LayoutDashboard className="w-4 h-4 mr-2" />
                    Admin
                  </Button>
                )}

                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleSignOut}
                  aria-label="Sign out"
                  className="text-muted-foreground hover:text-foreground"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </Button>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate("/auth")}
                  aria-label="Sign in"
                  className="text-muted-foreground hover:text-foreground"
                >
                  <LogIn className="w-4 h-4 mr-2" />
                  Sign In
                </Button>

                <Button
                  variant="default"
                  size="sm"
                  onClick={() => navigate("/auth", { state: { isSignUp: true } })}
                  aria-label="Sign up"
                  className="nb-button bg-accent-gold text-black hover:bg-accent-gold/90 border-black"
                >
                  Sign Up
                </Button>
              </div>
            )}
          </div>

          {/* Mobile hamburger button */}
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </Button>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t border-border pt-4 space-y-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleNavigate("/items")}
              aria-label="Browse items"
              className="w-full justify-start text-muted-foreground hover:text-foreground"
            >
              <Search className="w-4 h-4 mr-2" />
              Browse Items
            </Button>

            {user ? (
              <>
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => handleNavigate("/submit")}
                  aria-label="Report found item"
                  className="w-full justify-start nb-button bg-accent-gold text-black hover:bg-accent-gold/90 border-black"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Report Found Item
                </Button>

                {isTeacher && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleNavigate("/admin")}
                    aria-label="Open admin dashboard"
                    className="w-full justify-start nb-outline text-foreground"
                  >
                    <LayoutDashboard className="w-4 h-4 mr-2" />
                    Admin
                  </Button>
                )}

                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleSignOut}
                  aria-label="Sign out"
                  className="w-full justify-start text-muted-foreground hover:text-foreground"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleNavigate("/auth")}
                  aria-label="Sign in"
                  className="w-full justify-start text-muted-foreground hover:text-foreground"
                >
                  <LogIn className="w-4 h-4 mr-2" />
                  Sign In
                </Button>

                <Button
                  variant="default"
                  size="sm"
                  onClick={() => handleNavigate("/auth", { isSignUp: true })}
                  aria-label="Sign up"
                  className="w-full justify-start nb-button bg-accent-gold text-black hover:bg-accent-gold/90 border-black"
                >
                  Sign Up
                </Button>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};