import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { GlassCard } from "@/components/GlassCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Check, X, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

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
  profiles?: { full_name: string };
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

  useEffect(() => {
    checkAdmin();
    fetchData();
  }, []);

  const checkAdmin = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      toast.error("Please sign in");
      navigate("/auth");
      return;
    }

    const { data } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", session.user.id)
      .eq("role", "admin")
      .single();

    if (!data) {
      toast.error("Access denied");
      navigate("/");
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-hero">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-hero">
      <Navbar />

      <main className="container mx-auto px-4 pt-24 pb-12">
        <h1 className="text-4xl font-bold mb-8 bg-gradient-primary bg-clip-text text-transparent animate-fade-in">
          Admin Dashboard
        </h1>

        <Tabs defaultValue="items" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-2">
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
                            <h3 className="text-xl font-semibold">
                              {item.title}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              Submitted on{" "}
                              {format(new Date(item.created_at), "MMM d, yyyy")}
                            </p>
                          </div>
                          <Badge>{item.category}</Badge>
                        </div>

                        <p className="text-sm text-muted-foreground">
                          {item.description}
                        </p>

                        <div className="text-sm space-y-1">
                          <p>
                            <strong>Location:</strong> {item.location_found}
                          </p>
                          <p>
                            <strong>Date Found:</strong>{" "}
                            {format(new Date(item.date_found), "MMM d, yyyy")}
                          </p>
                        </div>

                        <div className="flex gap-2 pt-4">
                          <Button
                            size="sm"
                            onClick={() => handleApproveItem(item.id)}
                            className="bg-gradient-primary hover:opacity-90"
                          >
                            <Check className="w-4 h-4 mr-2" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDeleteItem(item.id)}
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
                        <h3 className="text-xl font-semibold mb-1">
                          Claim for: {claim.found_items?.title || "Unknown Item"}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Submitted on{" "}
                          {format(new Date(claim.created_at), "MMM d, yyyy 'at' h:mm a")}
                        </p>
                      </div>

                      <div className="space-y-2 text-sm">
                        <p>
                          <strong>Name:</strong> {claim.claimant_name}
                        </p>
                        <p>
                          <strong>Email:</strong> {claim.claimant_email}
                        </p>
                        {claim.claimant_phone && (
                          <p>
                            <strong>Phone:</strong> {claim.claimant_phone}
                          </p>
                        )}
                      </div>

                      <div>
                        <strong className="text-sm">Description:</strong>
                        <p className="text-sm text-muted-foreground mt-1">
                          {claim.description}
                        </p>
                      </div>

                      <div className="flex gap-2 pt-4">
                        <Button
                          size="sm"
                          onClick={() =>
                            handleUpdateClaimStatus(claim.id, "approved")
                          }
                          className="bg-gradient-primary hover:opacity-90"
                        >
                          <Check className="w-4 h-4 mr-2" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() =>
                            handleUpdateClaimStatus(claim.id, "rejected")
                          }
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
