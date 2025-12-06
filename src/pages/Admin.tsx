import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { GlassCard } from "@/components/GlassCard";
import { OrbBackground } from "@/components/OrbBackground";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Check, X, Trash2, Lock, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

const ADMIN_PASSWORD = "test";

interface FoundItem {
  id: string;
  title: string;
  description: string;
  category: string;
  location_found: string;
  date_found: string;
  photo_url: string | null;
  status: string;
  approved: boolean;
  created_at: string;
}

interface Claim {
  id: string;
  claimant_name: string;
  claimant_email: string;
  claimant_phone: string | null;
  description: string;
  status: string;
  created_at: string;
  found_items?: {
    title: string;
  };
}

export default function Admin() {
  const navigate = useNavigate();
  const [items, setItems] = useState<FoundItem[]>([]);
  const [claims, setClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isTeacher, setIsTeacher] = useState(false);
  const [adminPassword, setAdminPassword] = useState("");
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    checkTeacherStatus();
  }, []);

  const checkTeacherStatus = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    
    if (!session) {
      toast.error("Please sign in");
      navigate("/");
      return;
    }

    // Check if user is a teacher or admin
    const { data: roles } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", session.user.id);

    const hasAccess = roles?.some(r => r.role === "teacher" || r.role === "admin");
    
    if (!hasAccess) {
      toast.error("Access denied. Teacher account required.");
      navigate("/items");
      return;
    }

    setIsTeacher(true);
    setCheckingAuth(false);
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminPassword === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      fetchData();
      toast.success("Access granted");
    } else {
      toast.error("Incorrect password");
    }
  };

  const fetchData = async () => {
    try {
      const { data: itemsData } = await supabase
        .from("found_items")
        .select("*")
        .order("created_at", { ascending: false });

      const { data: claimsData } = await supabase
        .from("claims")
        .select(`
          *,
          found_items(title)
        `)
        .order("created_at", { ascending: false });

      setItems(itemsData || []);
      setClaims(claimsData || []);
    } catch (error) {
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const handleApproveItem = async (itemId: string) => {
    try {
      const { error } = await supabase
        .from("found_items")
        .update({ approved: true })
        .eq("id", itemId);

      if (error) throw error;
      toast.success("Item approved");
      fetchData();
    } catch (error) {
      toast.error("Failed to approve item");
    }
  };

  const handleRejectItem = async (itemId: string) => {
    try {
      const { error } = await supabase
        .from("found_items")
        .update({ approved: false })
        .eq("id", itemId);

      if (error) throw error;
      toast.success("Item rejected");
      fetchData();
    } catch (error) {
      toast.error("Failed to reject item");
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    if (!confirm("Are you sure you want to delete this item?")) return;

    try {
      const { error } = await supabase
        .from("found_items")
        .delete()
        .eq("id", itemId);

      if (error) throw error;
      toast.success("Item deleted");
      fetchData();
    } catch (error) {
      toast.error("Failed to delete item");
    }
  };

  const handleUpdateClaimStatus = async (claimId: string, status: string) => {
    try {
      const { error } = await supabase
        .from("claims")
        .update({ status })
        .eq("id", claimId);

      if (error) throw error;
      toast.success(`Claim ${status}`);
      fetchData();
    } catch (error) {
      toast.error("Failed to update claim");
    }
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen relative">
        <OrbBackground />
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh] relative z-10">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (!isTeacher) {
    return null;
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen relative">
        <OrbBackground />
        <Navbar />
        <div className="flex items-center justify-center min-h-[80vh] p-4 relative z-10">
          <GlassCard className="p-8 max-w-md w-full animate-scale-in">
            <div className="text-center mb-6">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/20 flex items-center justify-center">
                <Lock className="w-8 h-8 text-primary" />
              </div>
              <h1 className="text-2xl font-bold text-foreground text-glow">Admin Access</h1>
              <p className="text-muted-foreground mt-2">Enter the admin password to continue</p>
            </div>
            
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="adminPassword">Password</Label>
                <Input
                  id="adminPassword"
                  type="password"
                  placeholder="••••••••"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  required
                  className="bg-secondary/50 border-border/50 focus:border-primary"
                />
              </div>
              
              <Button type="submit" className="w-full glass-button text-primary font-semibold">
                <ShieldCheck className="w-4 h-4 mr-2" />
                Unlock Dashboard
              </Button>
            </form>
          </GlassCard>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen relative">
        <OrbBackground />
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh] relative z-10">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative">
      <OrbBackground />
      <Navbar />

      <main className="container mx-auto px-4 pt-24 pb-12 relative z-10">
        <h1 className="text-4xl font-bold mb-8 text-foreground text-glow animate-fade-in">
          Admin Dashboard
        </h1>

        <Tabs defaultValue="items" className="space-y-6">
          <TabsList className="liquid-glass-subtle grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="items">
              Pending Items ({items.filter((i) => !i.approved).length})
            </TabsTrigger>
            <TabsTrigger value="claims">
              Pending Claims ({claims.filter((c) => c.status === "pending").length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="items" className="space-y-4">
            {items.filter((item) => !item.approved).length === 0 ? (
              <GlassCard className="p-8 text-center">
                <p className="text-muted-foreground">No pending items</p>
              </GlassCard>
            ) : (
              items
                .filter((item) => !item.approved)
                .map((item) => (
                  <GlassCard key={item.id} className="p-6 animate-fade-in">
                    <div className="flex flex-col md:flex-row gap-6">
                      {item.photo_url && (
                        <div className="w-full md:w-48 h-48 rounded-lg overflow-hidden flex-shrink-0">
                          <img
                            src={item.photo_url}
                            alt={item.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}

                      <div className="flex-1 space-y-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="text-xl font-semibold text-foreground">
                              {item.title}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              Submitted on{" "}
                              {format(new Date(item.created_at), "MMM d, yyyy")}
                            </p>
                          </div>
                          <Badge className="bg-primary/20 text-primary border-primary/30">{item.category}</Badge>
                        </div>

                        <p className="text-sm text-muted-foreground">
                          {item.description}
                        </p>

                        <div className="text-sm space-y-1">
                          <p>
                            <strong className="text-foreground">Location:</strong>{" "}
                            <span className="text-muted-foreground">{item.location_found}</span>
                          </p>
                          <p>
                            <strong className="text-foreground">Date Found:</strong>{" "}
                            <span className="text-muted-foreground">
                              {format(new Date(item.date_found), "MMM d, yyyy")}
                            </span>
                          </p>
                        </div>

                        <div className="flex gap-2 pt-4">
                          <Button
                            size="sm"
                            onClick={() => handleApproveItem(item.id)}
                            className="glass-button text-accent"
                          >
                            <Check className="w-4 h-4 mr-2" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleRejectItem(item.id)}
                            className="border-destructive/50 text-destructive hover:bg-destructive/10"
                          >
                            <X className="w-4 h-4 mr-2" />
                            Reject
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDeleteItem(item.id)}
                            className="text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </Button>
                        </div>
                      </div>
                    </div>
                  </GlassCard>
                ))
            )}
          </TabsContent>

          <TabsContent value="claims" className="space-y-4">
            {claims.filter((claim) => claim.status === "pending").length === 0 ? (
              <GlassCard className="p-8 text-center">
                <p className="text-muted-foreground">No pending claims</p>
              </GlassCard>
            ) : (
              claims
                .filter((claim) => claim.status === "pending")
                .map((claim) => (
                  <GlassCard key={claim.id} className="p-6 animate-fade-in">
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-xl font-semibold mb-1 text-foreground">
                          Claim for: {claim.found_items?.title || "Unknown Item"}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Submitted on{" "}
                          {format(new Date(claim.created_at), "MMM d, yyyy 'at' h:mm a")}
                        </p>
                      </div>

                      <div className="space-y-2 text-sm">
                        <p>
                          <strong className="text-foreground">Name:</strong>{" "}
                          <span className="text-muted-foreground">{claim.claimant_name}</span>
                        </p>
                        <p>
                          <strong className="text-foreground">Email:</strong>{" "}
                          <span className="text-muted-foreground">{claim.claimant_email}</span>
                        </p>
                        {claim.claimant_phone && (
                          <p>
                            <strong className="text-foreground">Phone:</strong>{" "}
                            <span className="text-muted-foreground">{claim.claimant_phone}</span>
                          </p>
                        )}
                      </div>

                      <div>
                        <strong className="text-sm text-foreground">Description:</strong>
                        <p className="text-sm text-muted-foreground mt-1">
                          {claim.description}
                        </p>
                      </div>

                      <div className="flex gap-2 pt-4">
                        <Button
                          size="sm"
                          onClick={() => handleUpdateClaimStatus(claim.id, "approved")}
                          className="glass-button text-accent"
                        >
                          <Check className="w-4 h-4 mr-2" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleUpdateClaimStatus(claim.id, "rejected")}
                          className="border-destructive/50 text-destructive hover:bg-destructive/10"
                        >
                          <X className="w-4 h-4 mr-2" />
                          Reject
                        </Button>
                      </div>
                    </div>
                  </GlassCard>
                ))
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
