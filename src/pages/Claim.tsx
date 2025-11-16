import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { GlassCard } from "@/components/GlassCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
  const [loading, setLoading] = useState(false);
  const [item, setItem] = useState<FoundItem | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    description: "",
  });

  useEffect(() => {
    fetchItem();
    
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setUserId(session.user.id);
        setFormData((prev) => ({
          ...prev,
          email: session.user.email || "",
        }));
      }
    });
  }, [id]);

  const fetchItem = async () => {
    try {
      const { data, error } = await supabase
        .from("found_items")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      setItem(data);
    } catch (error) {
      toast.error("Failed to load item");
      navigate("/items");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const validation = claimSchema.safeParse(formData);
      if (!validation.success) {
        toast.error(validation.error.errors[0].message);
        setLoading(false);
        return;
      }

      const { error } = await supabase.from("claims").insert({
        item_id: id,
        claimant_name: formData.name,
        claimant_email: formData.email,
        claimant_phone: formData.phone || null,
        description: formData.description,
        user_id: userId,
      });

      if (error) throw error;

      toast.success("Claim submitted successfully! We'll review it soon.");
      navigate("/items");
    } catch (error) {
      toast.error("Failed to submit claim");
    } finally {
      setLoading(false);
    }
  };

  if (!item) {
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
        <Button
          variant="ghost"
          onClick={() => navigate("/items")}
          className="mb-6 animate-fade-in"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Items
        </Button>

        <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          <GlassCard className="p-6 animate-fade-in">
            <h2 className="text-2xl font-bold mb-4 text-foreground">
              Item Details
            </h2>

            {item.photo_url && (
              <div className="mb-6 rounded-lg overflow-hidden">
                <img
                  src={item.photo_url}
                  alt={item.title}
                  className="w-full h-64 object-cover"
                />
              </div>
            )}

            <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
            <p className="text-muted-foreground mb-4">{item.description}</p>

            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="w-4 h-4" />
                <span>Found at: {item.location_found}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="w-4 h-4" />
                <span>
                  Found on: {format(new Date(item.date_found), "MMM d, yyyy")}
                </span>
              </div>
            </div>
          </GlassCard>

          <GlassCard className="p-6 animate-scale-in">
            <h2 className="text-2xl font-bold mb-2 bg-gradient-primary bg-clip-text text-transparent">
              Claim This Item
            </h2>
            <p className="text-muted-foreground mb-6">
              Please provide details to verify ownership
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  placeholder="Your full name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                  maxLength={100}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  required
                  maxLength={255}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number (optional)</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="(123) 456-7890"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  maxLength={20}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">
                  Why do you believe this is your item? *
                </Label>
                <Textarea
                  id="description"
                  placeholder="Describe the item in detail, include unique features..."
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  required
                  maxLength={1000}
                  rows={5}
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-primary hover:opacity-90"
                disabled={loading}
              >
                {loading ? "Submitting..." : "Submit Claim"}
              </Button>
            </form>
          </GlassCard>
        </div>
      </main>
    </div>
  );
}
