// Submit page: allows signed-in users to report found items with optional photo upload.
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { GlassCard } from "@/components/GlassCard";
// OrbBackground removed to keep pages visually consistent with neobrutal theme
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

const itemSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(100),
  description: z.string().min(10, "Description must be at least 10 characters").max(1000),
  category: z.string().min(1, "Please select a category"),
  location: z.string().min(3, "Location must be at least 3 characters").max(100),
});

const categories = [
  "Electronics",
  "Clothing",
  "Books",
  "Accessories",
  "Sports Equipment",
  "Keys",
  "ID Cards",
  "Other",
];

export default function Submit() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    location: "",
    dateFound: new Date().toISOString().split("T")[0],
  });

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        toast.error("Please sign in to submit items");
        navigate("/");
      } else {
        setUserId(session.user.id);
      }
    });
  }, [navigate]);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image must be less than 5MB");
        return;
      }
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;

    setLoading(true);

    try {
      const validation = itemSchema.safeParse(formData);
      if (!validation.success) {
        toast.error(validation.error.errors[0].message);
        setLoading(false);
        return;
      }

      let photoUrl = null;

      if (photoFile) {
        const fileExt = photoFile.name.split(".").pop();
        const fileName = `${userId}/${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from("item-photos")
          .upload(fileName, photoFile);

        if (uploadError) throw uploadError;

        const {
          data: { publicUrl },
        } = supabase.storage.from("item-photos").getPublicUrl(fileName);

        photoUrl = publicUrl;
      }

      const { error } = await supabase.from("found_items").insert({
        title: formData.title,
        description: formData.description,
        category: formData.category,
        location_found: formData.location,
        date_found: formData.dateFound,
        photo_url: photoUrl,
        submitted_by: userId,
      });

      if (error) throw error;

      toast.success("Item submitted successfully! It will appear once approved.");
      navigate("/items");
    } catch (error) {
      toast.error("Failed to submit item");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative">
      <Navbar />

      <main className="container mx-auto px-4 pt-24 pb-12 relative z-10">
        <Button
          variant="ghost"
          aria-label="Go back"
          onClick={() => navigate(-1)}
          className="mb-6 animate-fade-in text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        {/* Form container: report a found item */}
        <div className="max-w-2xl mx-auto animate-scale-in">
          <GlassCard className="p-8">
            <h1 className="text-3xl font-bold mb-2 text-foreground">Report Found Item</h1>
            <p className="text-muted-foreground mb-8">Help reunite lost items with their owners</p>

            {/* Submit form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Item Title *</Label>
                <Input
                  id="title"
                  placeholder="e.g., Blue Backpack"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  required
                  maxLength={100}
                  className="bg-secondary/50 border-border/50 focus:border-foreground"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  placeholder="Provide details about the item..."
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  required
                  maxLength={1000}
                  rows={4}
                  className="bg-secondary/50 border-border/50 focus:border-foreground"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) =>
                      setFormData({ ...formData, category: value })
                    }
                    required
                  >
                    <SelectTrigger id="category" className="bg-secondary/50 border-border/50">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent className="liquid-glass border-border/50">
                      {categories.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dateFound">Date Found *</Label>
                  <Input
                    id="dateFound"
                    type="date"
                    value={formData.dateFound}
                    onChange={(e) =>
                      setFormData({ ...formData, dateFound: e.target.value })
                    }
                    max={new Date().toISOString().split("T")[0]}
                    required
                    className="bg-secondary/50 border-border/50 focus:border-foreground"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location Found *</Label>
                <Input
                  id="location"
                  placeholder="e.g., Library 2nd Floor"
                  value={formData.location}
                  onChange={(e) =>
                    setFormData({ ...formData, location: e.target.value })
                  }
                  required
                  maxLength={100}
                    className="bg-secondary/50 border-border/50 focus:border-foreground"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="photo">Photo (optional)</Label>
                <div className="flex items-center gap-4">
                  <Button
                    type="button"
                    aria-label={photoFile ? "Change uploaded photo" : "Upload photo"}
                    variant="outline"
                    onClick={() => document.getElementById("photo")?.click()}
                    className="w-full border-border/50 nb-outline"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    {photoFile ? "Change Photo" : "Upload Photo"}
                  </Button>
                  <input
                    id="photo"
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoChange}
                    className="hidden"
                  />
                </div>
                {photoPreview && (
                  <div className="mt-4 rounded-lg overflow-hidden border border-border/50">
                    <img src={photoPreview} alt="Preview" className="w-full h-64 object-cover" />
                  </div>
                )}
              </div>

              <Button
                type="submit"
                aria-label="Submit found item"
                className="w-full nb-button accent-gold-bg font-semibold"
                disabled={loading}
              >
                {loading ? "Submitting..." : "Submit Item"}
              </Button>
            </form>
          </GlassCard>
        </div>
      </main>
    </div>
  );
}
