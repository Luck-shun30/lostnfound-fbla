// Auth page: sign in / sign up UI and flows.
// - Handles session redirect after login
// - Supports student and teacher signups (teacher uses access code)
import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GlassCard } from "@/components/GlassCard";
import { toast } from "sonner";
import { z } from "zod";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, GraduationCap } from "lucide-react";

const authSchema = z.object({
  email: z.string().email("Invalid email address").max(255),
  password: z.string().min(6, "Password must be at least 6 characters").max(100),
  fullName: z.string().min(2, "Name must be at least 2 characters").max(100).optional(),
  teacherCode: z.string().optional(),
});

type AccountType = "student" | "teacher";

export default function Auth() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isSignUp, setIsSignUp] = useState<boolean>(() => {
    // If navigated with state { isSignUp: true }, default to sign up
    return (location.state as any)?.isSignUp ?? false;
  });
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [teacherCode, setTeacherCode] = useState("");
  const [accountType, setAccountType] = useState<AccountType>("student");

  useEffect(() => {
    const checkSessionAndRedirect = async (session: any) => {
      if (session) {
        // Check if user is a teacher
        const { data: roles } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", session.user.id);

        const isTeacher = roles?.some(r => r.role === "teacher" || r.role === "admin");
        navigate(isTeacher ? "/admin" : "/items");
      }
    };

    supabase.auth.getSession().then(({ data: { session } }) => {
      checkSessionAndRedirect(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        setTimeout(() => {
          checkSessionAndRedirect(session);
        }, 0);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const validation = authSchema.safeParse({
        email,
        password,
        fullName: isSignUp ? fullName : undefined,
      });

      if (!validation.success) {
        toast.error(validation.error.errors[0].message);
        setLoading(false);
        return;
      }

      if (isSignUp) {
        // Validate teacher access code if signing up as teacher
        if (accountType === "teacher") {
          const TEACHER_ACCESS_CODE = "TEACHER2026";
          if (teacherCode !== TEACHER_ACCESS_CODE) {
            toast.error("Invalid teacher access code");
            setLoading(false);
            return;
          }
        }

        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/items`,
            data: {
              full_name: fullName,
            },
          },
        });

        if (error) {
          if (error.message.includes("already registered")) {
            toast.error("This email is already registered. Please sign in instead.");
          } else {
            toast.error(error.message);
          }
          setLoading(false);
          return;
        }

        // If teacher account, assign teacher role in user_roles table
        if (data.user && accountType === "teacher") {
          const { error: roleError } = await supabase
            .from("user_roles")
            .insert({
              user_id: data.user.id,
              role: "teacher",
            });

          if (roleError) {
            console.error("Failed to assign teacher role:", roleError);
            toast.error("Failed to assign teacher role. Please contact administration.");
            // Sign out the user since teacher role failed
            await supabase.auth.signOut();
            setLoading(false);
            return;
          }
        }

        toast.success("Account created successfully!");
        // The onAuthStateChange will handle redirect
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          toast.error(error.message);
        } else {
          toast.success("Signed in successfully!");
        }
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative">
      <div className="w-full max-w-md animate-scale-in relative z-10">
        {/* Auth Card: centered form container */}
        <GlassCard className="p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2 text-foreground">
              {isSignUp ? "Create Account" : "Welcome Back"}
            </h1>
            <p className="text-muted-foreground">
              {isSignUp
                ? "Join our school's lost and found community"
                : "Sign in to report or claim items"}
            </p>
          </div>

          <form onSubmit={handleAuth} className="space-y-4">
            {isSignUp && (
              <>
                <div className="space-y-2">
                  <Label>Account Type</Label>
                  <Tabs value={accountType} onValueChange={(v) => setAccountType(v as AccountType)}>
                    <TabsList className="grid w-full grid-cols-2 bg-secondary/50">
                      <TabsTrigger value="student" className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        Student
                      </TabsTrigger>
                      <TabsTrigger value="teacher" className="flex items-center gap-2">
                        <GraduationCap className="w-4 h-4" />
                        Teacher
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="John Doe"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    maxLength={100}
                    className="bg-secondary/50 border-border/50 focus:border-foreground"
                  />
                </div>

                {accountType === "teacher" && (
                  <div className="space-y-2">
                    <Label htmlFor="teacherCode">Teacher Access Code</Label>
                    <Input
                      id="teacherCode"
                      type="password"
                      placeholder="Enter teacher access code"
                      value={teacherCode}
                      onChange={(e) => setTeacherCode(e.target.value)}
                      required
                      className="bg-secondary/50 border-border/50 focus:border-foreground"
                    />
                    <p className="text-xs text-muted-foreground">
                      Contact administration for the teacher access code
                    </p>
                  </div>
                )}
              </>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@school.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                maxLength={255}
                className="bg-secondary/50 border-border/50 focus:border-foreground"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                maxLength={100}
                className="bg-secondary/50 border-border/50 focus:border-foreground"
              />
            </div>

            <Button
              type="submit"
              aria-label={isSignUp ? "Create account" : "Sign in"}
              className={`w-full nb-button ${isSignUp ? "accent-gold-bg" : ""} font-semibold`}
              disabled={loading}
            >
              {loading
                ? "Processing..."
                : isSignUp
                ? "Create Account"
                : "Sign In"}
            </Button>

            <div className="text-center">
              <button
                type="button"
                aria-label={isSignUp ? "Switch to sign in" : "Switch to sign up"}
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-sm text-foreground hover:underline"
              >
                {isSignUp
                  ? "Already have an account? Sign in"
                  : "Need an account? Sign up"}
              </button>
            </div>
          </form>
        </GlassCard>
      </div>
    </div>
  );
}
