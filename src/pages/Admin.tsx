// Admin dashboard: manage pending items, claims, and info requests. Restricted to teacher/admin users.
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { GlassCard } from "@/components/GlassCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Check, X, Trash2, Lock, ShieldCheck, Pencil, MessageSquare, Send } from "lucide-react";
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
  item_id: string;
  claimant_name: string;
  claimant_email: string;
  claimant_phone: string | null;
  description: string;
  status: string;
  created_at: string;
  found_items?: {
    title: string;
    location_found: string;
  };
}

interface InfoRequest {
  id: string;
  item_id: string;
  requester_name: string;
  requester_email: string;
  requester_phone: string | null;
  question: string;
  status: string;
  admin_response: string | null;
  responded_at: string | null;
  created_at: string;
  found_items?: {
    title: string;
  };
}

export default function Admin() {
  const navigate = useNavigate();
  const [items, setItems] = useState<FoundItem[]>([]);
  const [claims, setClaims] = useState<Claim[]>([]);
  const [infoRequests, setInfoRequests] = useState<InfoRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isTeacher, setIsTeacher] = useState(false);
  const [adminPassword, setAdminPassword] = useState("");
  const [checkingAuth, setCheckingAuth] = useState(true);

  // Edit item dialog state
  const [editingItem, setEditingItem] = useState<FoundItem | null>(null);
  const [editFormData, setEditFormData] = useState({
    title: "",
    description: "",
    category: "",
    location_found: "",
  });

  // Info request response dialog state
  const [respondingTo, setRespondingTo] = useState<InfoRequest | null>(null);
  const [responseText, setResponseText] = useState("");
  const [sendingResponse, setSendingResponse] = useState(false);

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
          found_items(title, location_found)
        `)
        .order("created_at", { ascending: false });

      const { data: infoData } = await supabase
        .from("info_requests")
        .select(`
          *,
          found_items(title)
        `)
        .order("created_at", { ascending: false });

      setItems(itemsData || []);
      setClaims(claimsData || []);
      setInfoRequests(infoData || []);
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

  const handleEditItem = (item: FoundItem) => {
    setEditingItem(item);
    setEditFormData({
      title: item.title,
      description: item.description,
      category: item.category,
      location_found: item.location_found,
    });
  };

  const handleSaveEdit = async () => {
    if (!editingItem) return;

    try {
      const { error } = await supabase
        .from("found_items")
        .update({
          title: editFormData.title,
          description: editFormData.description,
          category: editFormData.category,
          location_found: editFormData.location_found,
        })
        .eq("id", editingItem.id);

      if (error) throw error;
      toast.success("Item updated successfully");
      setEditingItem(null);
      fetchData();
    } catch (error) {
      toast.error("Failed to update item");
    }
  };

  const handleApproveClaim = async (claim: Claim) => {
    try {
      // Send email notification to claimant
      const { error: emailError } = await supabase.functions.invoke("send-claim-approved-email", {
        body: {
          claimantName: claim.claimant_name,
          claimantEmail: claim.claimant_email,
          itemTitle: claim.found_items?.title || "Unknown Item",
          itemLocation: claim.found_items?.location_found || "Contact the office",
        },
      });

      if (emailError) {
        console.error("Failed to send email:", emailError);
        // Continue with approval even if email fails
      }

      // Delete the claim
      const { error: claimError } = await supabase
        .from("claims")
        .delete()
        .eq("id", claim.id);

      if (claimError) throw claimError;

      // Delete the item (it's been claimed successfully)
      const { error: itemError } = await supabase
        .from("found_items")
        .delete()
        .eq("id", claim.item_id);

      if (itemError) throw itemError;

      toast.success("Claim approved - email sent to claimant");
      fetchData();
    } catch (error) {
      toast.error("Failed to approve claim");
    }
  };

  const handleRejectClaim = async (claimId: string) => {
    try {
      const { error } = await supabase
        .from("claims")
        .update({ status: "rejected" })
        .eq("id", claimId);

      if (error) throw error;
      toast.success("Claim rejected");
      fetchData();
    } catch (error) {
      toast.error("Failed to reject claim");
    }
  };

  const handleRespondToInfoRequest = (request: InfoRequest) => {
    setRespondingTo(request);
    setResponseText("");
  };

  const handleSendResponse = async () => {
    if (!respondingTo || !responseText.trim()) return;

    setSendingResponse(true);
    try {
      // Send email with the response
      const { error: emailError } = await supabase.functions.invoke("send-info-response-email", {
        body: {
          requesterName: respondingTo.requester_name,
          requesterEmail: respondingTo.requester_email,
          itemTitle: respondingTo.found_items?.title || "Unknown Item",
          originalQuestion: respondingTo.question,
          adminResponse: responseText,
        },
      });

      if (emailError) {
        console.error("Failed to send email:", emailError);
        throw emailError;
      }

      // Update the info request status
      const { error: updateError } = await supabase
        .from("info_requests")
        .update({
          status: "responded",
          admin_response: responseText,
          responded_at: new Date().toISOString(),
        })
        .eq("id", respondingTo.id);

      if (updateError) throw updateError;

      toast.success("Response sent via email");
      setRespondingTo(null);
      setResponseText("");
      fetchData();
    } catch (error) {
      toast.error("Failed to send response");
    } finally {
      setSendingResponse(false);
    }
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen relative">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh] relative z-10">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
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
        <Navbar />
        <div className="flex items-center justify-center min-h-[80vh] p-4 relative z-10">
          <GlassCard className="p-8 max-w-md w-full animate-scale-in">
            <div className="text-center mb-6">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/90 border border-black flex items-center justify-center">
                <Lock className="w-8 h-8 text-foreground" />
              </div>
              <h1 className="text-2xl font-bold text-foreground">Admin Access</h1>
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
                  className="bg-secondary/50 border-border/50 focus:border-foreground"
                />
              </div>
              
              <Button type="submit" aria-label="Unlock admin dashboard" className="w-full nb-button text-black font-semibold">
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
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh] relative z-10">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
        </div>
      </div>
    );
  }

  const pendingInfoRequests = infoRequests.filter(r => r.status === "pending");

  return (
    <div className="min-h-screen relative">
      <Navbar />

      <main className="container mx-auto px-4 pt-24 pb-12 relative z-10">
        <h1 className="text-4xl font-bold mb-8 text-foreground animate-fade-in">Admin Dashboard</h1>

        <Tabs defaultValue="items" className="space-y-6">
          <TabsList className="liquid-glass-subtle grid w-full max-w-2xl grid-cols-4">
            <TabsTrigger value="items">
              Pending ({items.filter((i) => !i.approved).length})
            </TabsTrigger>
            <TabsTrigger value="claims">
              Claims ({claims.filter((c) => c.status === "pending").length})
            </TabsTrigger>
            <TabsTrigger value="info">
              Info Req ({pendingInfoRequests.length})
            </TabsTrigger>
            <TabsTrigger value="approved">
              Approved ({items.filter((i) => i.approved).length})
            </TabsTrigger>
          </TabsList>

          {/* Pending Items Tab */}
          <TabsContent value="items" className="space-y-4">
            {items.filter((item) => !item.approved).length === 0 ? (
              <GlassCard className="p-8 text-center">
                <p className="text-muted-foreground">No pending items</p>
              </GlassCard>
            ) : (
              items.filter((item) => !item.approved).map((item) => (
                <GlassCard key={item.id} className="p-6 animate-fade-in">
                  <div className="flex flex-col md:flex-row gap-6">
                    {item.photo_url && (
                      <div className="w-full md:w-48 h-48 rounded-lg overflow-hidden flex-shrink-0">
                        <img src={item.photo_url} alt={item.title} className="w-full h-full object-cover" />
                      </div>
                    )}
                    <div className="flex-1 space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-xl font-semibold text-foreground">{item.title}</h3>
                          <p className="text-sm text-muted-foreground">
                            Submitted on {format(new Date(item.created_at), "MMM d, yyyy")}
                          </p>
                        </div>
                        <Badge className="bg-white/90 text-foreground border-black">{item.category}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{item.description}</p>
                      <div className="text-sm space-y-1">
                        <p><strong className="text-foreground">Location:</strong> <span className="text-muted-foreground">{item.location_found}</span></p>
                        <p><strong className="text-foreground">Date Found:</strong> <span className="text-muted-foreground">{format(new Date(item.date_found), "MMM d, yyyy")}</span></p>
                      </div>
                      <div className="flex gap-2 pt-4 flex-wrap">
                        <Button size="sm" onClick={() => handleApproveItem(item.id)} className="nb-button accent-green-border">
                          <Check className="w-4 h-4 mr-2" />Approve
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleRejectItem(item.id)} className="nb-outline text-foreground">
                          <X className="w-4 h-4 mr-2" />Reject
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => handleDeleteItem(item.id)} className="nb-outline text-foreground">
                          <Trash2 className="w-4 h-4 mr-2" />Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                </GlassCard>
              ))
            )}
          </TabsContent>

          {/* Pending Claims Tab */}
          <TabsContent value="claims" className="space-y-4">
            {claims.filter((claim) => claim.status === "pending").length === 0 ? (
              <GlassCard className="p-8 text-center">
                <p className="text-muted-foreground">No pending claims</p>
              </GlassCard>
            ) : (
              claims.filter((claim) => claim.status === "pending").map((claim) => (
                <GlassCard key={claim.id} className="p-6 animate-fade-in">
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-xl font-semibold mb-1 text-foreground">
                        Claim for: {claim.found_items?.title || "Unknown Item"}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Submitted on {format(new Date(claim.created_at), "MMM d, yyyy 'at' h:mm a")}
                      </p>
                    </div>
                    <div className="space-y-2 text-sm">
                      <p><strong className="text-foreground">Name:</strong> <span className="text-muted-foreground">{claim.claimant_name}</span></p>
                      <p><strong className="text-foreground">Email:</strong> <span className="text-muted-foreground">{claim.claimant_email}</span></p>
                      {claim.claimant_phone && (
                        <p><strong className="text-foreground">Phone:</strong> <span className="text-muted-foreground">{claim.claimant_phone}</span></p>
                      )}
                    </div>
                    <div>
                      <strong className="text-sm text-foreground">Description:</strong>
                      <p className="text-sm text-muted-foreground mt-1">{claim.description}</p>
                    </div>
                    <div className="flex gap-2 pt-4">
                      <Button size="sm" onClick={() => handleApproveClaim(claim)} className="nb-button accent-green-border">
                        <Check className="w-4 h-4 mr-2" />Approve & Email
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleRejectClaim(claim.id)} className="nb-outline text-foreground">
                        <X className="w-4 h-4 mr-2" />Reject
                      </Button>
                    </div>
                  </div>
                </GlassCard>
              ))
            )}
          </TabsContent>

          {/* Info Requests Tab */}
          <TabsContent value="info" className="space-y-4">
            {pendingInfoRequests.length === 0 ? (
              <GlassCard className="p-8 text-center">
                <p className="text-muted-foreground">No pending info requests</p>
              </GlassCard>
            ) : (
              pendingInfoRequests.map((request) => (
                <GlassCard key={request.id} className="p-6 animate-fade-in">
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-xl font-semibold mb-1 text-foreground">
                        Question about: {request.found_items?.title || "Unknown Item"}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Received on {format(new Date(request.created_at), "MMM d, yyyy 'at' h:mm a")}
                      </p>
                    </div>
                    <div className="space-y-2 text-sm">
                      <p><strong className="text-foreground">From:</strong> <span className="text-muted-foreground">{request.requester_name}</span></p>
                      <p><strong className="text-foreground">Email:</strong> <span className="text-muted-foreground">{request.requester_email}</span></p>
                    </div>
                    <div className="bg-secondary/30 rounded-lg p-4">
                      <strong className="text-sm text-foreground">Question:</strong>
                      <p className="text-sm text-muted-foreground mt-1">"{request.question}"</p>
                    </div>
                    <div className="flex gap-2 pt-4">
                      <Button size="sm" onClick={() => handleRespondToInfoRequest(request)} className="nb-button accent-gold-bg">
                        <MessageSquare className="w-4 h-4 mr-2" />Respond
                      </Button>
                    </div>
                  </div>
                </GlassCard>
              ))
            )}
          </TabsContent>

          {/* Approved Items Tab */}
          <TabsContent value="approved" className="space-y-4">
            {items.filter((item) => item.approved).length === 0 ? (
              <GlassCard className="p-8 text-center">
                <p className="text-muted-foreground">No approved listings</p>
              </GlassCard>
            ) : (
              items.filter((item) => item.approved).map((item) => (
                <GlassCard key={item.id} className="p-6 animate-fade-in">
                  <div className="flex flex-col md:flex-row gap-6">
                    {item.photo_url && (
                      <div className="w-full md:w-48 h-48 rounded-lg overflow-hidden flex-shrink-0">
                        <img src={item.photo_url} alt={item.title} className="w-full h-full object-cover" />
                      </div>
                    )}
                    <div className="flex-1 space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-xl font-semibold text-foreground">{item.title}</h3>
                          <p className="text-sm text-muted-foreground">
                            Approved • Found on {format(new Date(item.date_found), "MMM d, yyyy")}
                          </p>
                        </div>
                        <Badge className="bg-accent-green/20 text-accent-green border-accent-green">{item.category}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{item.description}</p>
                      <div className="text-sm space-y-1">
                        <p><strong className="text-foreground">Location:</strong> <span className="text-muted-foreground">{item.location_found}</span></p>
                        <p><strong className="text-foreground">Status:</strong> <span className="text-muted-foreground capitalize">{item.status}</span></p>
                      </div>
                      <div className="flex gap-2 pt-4 flex-wrap">
                        <Button size="sm" variant="outline" onClick={() => handleEditItem(item)} className="nb-outline text-foreground">
                          <Pencil className="w-4 h-4 mr-2" />Edit
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleDeleteItem(item.id)} className="nb-outline text-foreground hover:bg-destructive/10 hover:border-destructive">
                          <Trash2 className="w-4 h-4 mr-2" />Remove
                        </Button>
                      </div>
                    </div>
                  </div>
                </GlassCard>
              ))
            )}
          </TabsContent>
        </Tabs>
      </main>

      {/* Edit Item Dialog */}
      <Dialog open={!!editingItem} onOpenChange={() => setEditingItem(null)}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Item</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-title">Title</Label>
              <Input
                id="edit-title"
                value={editFormData.title}
                onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={editFormData.description}
                onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-category">Category</Label>
              <Input
                id="edit-category"
                value={editFormData.category}
                onChange={(e) => setEditFormData({ ...editFormData, category: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-location">Location Found</Label>
              <Input
                id="edit-location"
                value={editFormData.location_found}
                onChange={(e) => setEditFormData({ ...editFormData, location_found: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingItem(null)}>Cancel</Button>
            <Button onClick={handleSaveEdit} className="nb-button">Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Respond to Info Request Dialog */}
      <Dialog open={!!respondingTo} onOpenChange={() => setRespondingTo(null)}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Respond to Info Request</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {respondingTo && (
              <>
                <div className="bg-secondary/30 rounded-lg p-4">
                  <p className="text-sm text-muted-foreground">
                    <strong className="text-foreground">From:</strong> {respondingTo.requester_name} ({respondingTo.requester_email})
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    <strong className="text-foreground">Question:</strong> "{respondingTo.question}"
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="response">Your Response</Label>
                  <Textarea
                    id="response"
                    placeholder="Type your response here..."
                    value={responseText}
                    onChange={(e) => setResponseText(e.target.value)}
                    rows={4}
                  />
                </div>
              </>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRespondingTo(null)}>Cancel</Button>
            <Button 
              onClick={handleSendResponse} 
              disabled={!responseText.trim() || sendingResponse}
              className="nb-button accent-gold-bg"
            >
              <Send className="w-4 h-4 mr-2" />
              {sendingResponse ? "Sending..." : "Send Response"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
