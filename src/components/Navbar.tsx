import { useState, useEffect } from "react";
import { Menu, X, LogOut } from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isTeacher, setIsTeacher] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        checkUserRole(session.user.id);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        checkUserRole(session.user.id);
      } else {
        setIsTeacher(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkUserRole = async (userId: string) => {
    const { data: roles } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId);

    if (roles && roles.some(r => r.role === "teacher" || r.role === "admin")) {
      setIsTeacher(true);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast.success("Signed out successfully");
    navigate("/");
  };

  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    if (location.pathname !== "/") {
      navigate("/");
      setTimeout(() => {
        const element = document.querySelector(href);
        if (element) element.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } else {
      const element = document.querySelector(href);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    }
    setIsMobileMenuOpen(false);
  };

  const navLinks = [
    { name: "About", href: "#about" },
    { name: "How it Works", href: "#how-it-works" },
    { name: "Contact", href: "#contact" },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? "py-4 bg-white/50 backdrop-blur-md shadow-sm" : "py-6 bg-transparent"
        }`}
    >
      <div className="container mx-auto px-6 flex items-center justify-between">
        <Link
          to="/"
          className="text-2xl font-bold tracking-tighter"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        >
          Lost<span className="text-gray-400">*</span>Found
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center space-x-8">
          {!user ? (
            <>
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={(e) => scrollToSection(e, link.href)}
                  className="text-sm font-medium hover:text-gray-600 transition-colors"
                >
                  {link.name}
                </a>
              ))}
              <Link
                to="/auth"
                className="px-5 py-2.5 rounded-full bg-black text-white text-sm font-medium hover:bg-gray-800 transition-all hover:scale-105"
              >
                Get Started
              </Link>
            </>
          ) : (
            <>
              <Link
                to="/items"
                className="text-sm font-medium hover:text-gray-600 transition-colors"
              >
                Browse Items
              </Link>
              <Link
                to="/submit"
                className="text-sm font-medium hover:text-gray-600 transition-colors"
              >
                Report Item
              </Link>

              {isTeacher && (
                <Link
                  to="/admin"
                  className="text-sm font-medium hover:text-gray-600 transition-colors"
                >
                  Admin Dashboard
                </Link>
              )}

              <Button
                variant="ghost"
                onClick={handleSignOut}
                className="flex items-center gap-2 hover:bg-red-50 hover:text-red-600"
              >
                <LogOut size={16} />
                Sign Out
              </Button>
            </>
          )}
        </div>

        {/* Mobile Toggle */}
        <button
          className="md:hidden p-2"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="absolute top-full left-0 right-0 bg-white/95 backdrop-blur-xl border-t border-gray-100 p-6 flex flex-col space-y-4 md:hidden animate-fade-in shadow-lg">
          {!user ? (
            <>
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={(e) => scrollToSection(e, link.href)}
                  className="text-lg font-medium py-2"
                >
                  {link.name}
                </a>
              ))}
              <Link
                to="/auth"
                className="w-full text-center py-3 rounded-full bg-black text-white font-medium"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Get Started
              </Link>
            </>
          ) : (
            <>
              <Link
                to="/items"
                className="text-lg font-medium py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Browse Items
              </Link>
              <Link
                to="/submit"
                className="text-lg font-medium py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Report Item
              </Link>

              {isTeacher && (
                <Link
                  to="/admin"
                  className="text-lg font-medium py-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Admin Dashboard
                </Link>
              )}

              <button
                onClick={() => {
                  handleSignOut();
                  setIsMobileMenuOpen(false);
                }}
                className="w-full text-center py-3 rounded-full bg-gray-100 text-red-600 font-medium flex items-center justify-center gap-2"
              >
                <LogOut size={18} />
                Sign Out
              </button>
            </>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;