// Claim page: view item details and submit a claim or info request.
import { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { GlassCard } from "@/components/GlassCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, MapPin, Calendar } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { z } from "zod";

const claimSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().email("Invalid email address").max(255),
  phone: z.string().min(10, "Phone must be at least 10 digits").max(20).optional().or(z.literal("")),
  description: z.string().min(20, "Description must be at least 20 characters").max(1000),
});

const infoSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().email("Invalid email address").max(255),
  question: z.string().min(10, "Question must be at least 10 characters").max(500),
});

interface FoundItem {
  id: string;
  title: string;
  description: string;
  category: string;
  location_found: string;
  date_found: string;
  photo_url: string | null;
}

export default function Claim() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialMode = searchParams.get("mode") === "info" ? "info" : "claim";
  
  const [loading, setLoading] = useState(false);
  const [item, setItem] = useState<FoundItem | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState(initialMode);

  const [claimData, setClaimData] = useState({ name: "", email: "", phone: "", description: "" });
  const [infoData, setInfoData] = useState({ name: "", email: "", question: "" });

  useEffect(() => {
    fetchItem();
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setUserId(session.user.id);
        setClaimData((prev) => ({ ...prev, email: session.user.email || "" }));
        setInfoData((prev) => ({ ...prev, email: session.user.email || "" }));
      }
    });
  }, [id]);

  const fetchItem = async () => {
    try {
      const { data, error } = await supabase.from("found_items").select("*").eq("id", id).single();
      if (error) throw error;
      setItem(data);
    } catch (error) {
      toast.error("Failed to load item");
      navigate("/items");
    }
  };

  const handleClaimSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const validation = claimSchema.safeParse(claimData);
      if (!validation.success) { toast.error(validation.error.errors[0].message); setLoading(false); return; }
      const { error } = await supabase.from("claims").insert({
        item_id: id, claimant_name: claimData.name, claimant_email: claimData.email,
        claimant_phone: claimData.phone || null, description: claimData.description, user_id: userId,
      });
      if (error) throw error;
      toast.success("Claim submitted successfully!");
      navigate("/items");
    } catch (error) { toast.error("Failed to submit claim"); } 
    finally { setLoading(false); }
  };

  const handleInfoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const validation = infoSchema.safeParse(infoData);
      if (!validation.success) { toast.error(validation.error.errors[0].message); setLoading(false); return; }
      const { error } = await supabase.from("info_requests").insert({
        item_id: id, requester_name: infoData.name, requester_email: infoData.email,
        question: infoData.question, user_id: userId,
      });
      if (error) throw error;
      toast.success("Info request submitted! You'll receive an email response.");
      navigate("/items");
    } catch (error) { toast.error("Failed to submit request"); } 
    finally { setLoading(false); }
  };

  if (!item) {
    return (
      <div className="min-h-screen relative">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh] relative z-10">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative">
      <Navbar />
      <main className="container mx-auto px-4 pt-24 pb-12 relative z-10">
        <Button variant="ghost" onClick={() => navigate("/items")} className="mb-6 animate-fade-in text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-4 h-4 mr-2" />Back to Items
        </Button>
        <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          <GlassCard className="p-6 animate-fade-in">
            <h2 className="text-2xl font-bold mb-4 text-foreground">Item Details</h2>
            {item.photo_url && <div className="mb-6 rounded-lg overflow-hidden"><img src={item.photo_url} alt={item.title} className="w-full h-64 object-cover" /></div>}
            <h3 className="text-xl font-semibold mb-2 text-foreground">{item.title}</h3>
            <p className="text-muted-foreground mb-4">{item.description}</p>
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground"><MapPin className="w-4 h-4 text-foreground" /><span>Found at: {item.location_found}</span></div>
              <div className="flex items-center gap-2 text-muted-foreground"><Calendar className="w-4 h-4 text-foreground" /><span>Found on: {format(new Date(item.date_found), "MMM d, yyyy")}</span></div>
            </div>
          </GlassCard>

          <GlassCard className="p-6 animate-scale-in">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="claim">Claim Item</TabsTrigger>
                <TabsTrigger value="info">Request Info</TabsTrigger>
              </TabsList>
              <TabsContent value="claim">
                <p className="text-muted-foreground mb-6">Provide details to verify ownership</p>
                <form onSubmit={handleClaimSubmit} className="space-y-4">
                  <div className="space-y-2"><Label htmlFor="claim-name">Full Name *</Label><Input id="claim-name" value={claimData.name} onChange={(e) => setClaimData({ ...claimData, name: e.target.value })} required className="bg-secondary/50 border-border/50" /></div>
                  <div className="space-y-2"><Label htmlFor="claim-email">Email *</Label><Input id="claim-email" type="email" value={claimData.email} onChange={(e) => setClaimData({ ...claimData, email: e.target.value })} required className="bg-secondary/50 border-border/50" /></div>
                  <div className="space-y-2"><Label htmlFor="claim-phone">Phone (optional)</Label><Input id="claim-phone" type="tel" value={claimData.phone} onChange={(e) => setClaimData({ ...claimData, phone: e.target.value })} className="bg-secondary/50 border-border/50" /></div>
                  <div className="space-y-2"><Label htmlFor="claim-desc">Why is this your item? *</Label><Textarea id="claim-desc" value={claimData.description} onChange={(e) => setClaimData({ ...claimData, description: e.target.value })} required rows={4} className="bg-secondary/50 border-border/50" /></div>
                  <Button type="submit" className="w-full nb-button accent-gold-bg font-semibold" disabled={loading}>{loading ? "Submitting..." : "Submit Claim"}</Button>
                </form>
              </TabsContent>
              <TabsContent value="info">
                <p className="text-muted-foreground mb-6">Ask a question about this item</p>
                <form onSubmit={handleInfoSubmit} className="space-y-4">
                  <div className="space-y-2"><Label htmlFor="info-name">Your Name *</Label><Input id="info-name" value={infoData.name} onChange={(e) => setInfoData({ ...infoData, name: e.target.value })} required className="bg-secondary/50 border-border/50" /></div>
                  <div className="space-y-2"><Label htmlFor="info-email">Email *</Label><Input id="info-email" type="email" value={infoData.email} onChange={(e) => setInfoData({ ...infoData, email: e.target.value })} required className="bg-secondary/50 border-border/50" /></div>
                  <div className="space-y-2"><Label htmlFor="info-question">Your Question *</Label><Textarea id="info-question" placeholder="e.g., Does it have any specific markings?" value={infoData.question} onChange={(e) => setInfoData({ ...infoData, question: e.target.value })} required rows={4} className="bg-secondary/50 border-border/50" /></div>
                  <Button type="submit" className="w-full nb-button font-semibold" disabled={loading}>{loading ? "Submitting..." : "Submit Question"}</Button>
                </form>
              </TabsContent>
            </Tabs>
          </GlassCard>
        </div>
      </main>
    </div>
  );
}
