// Submit page: allows signed-in users to report found items with optional photo upload.
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import { GlassCard } from "@/components/GlassCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, ArrowLeft, Sparkles, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { generateItemDetails } from "@/utils/gemini";

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
  const [loadingAutofill, setLoadingAutofill] = useState(false);
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

  const handleAutofill = async () => {
    if (!photoFile) return;

    setLoadingAutofill(true);
    try {
      const details = await generateItemDetails(photoFile);
      if (details) {
        setFormData(prev => ({
          ...prev,
          title: details.title,
          description: details.description,
          category: categories.includes(details.category) ? details.category : "Other",
        }));
        toast.success("Item details autofilled!");
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to autofill details. Please try again.");
    } finally {
      setLoadingAutofill(false);
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

              {/* Photo Upload - Moved to Top */}
              <div className="space-y-2">
                <div className="flex justify-between items-center mb-2">
                  <Label htmlFor="photo" className="text-base font-semibold">Item Photo (Recommended)</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAutofill}
                    disabled={!photoFile || loadingAutofill}
                    className="h-8 border-violet-200 hover:bg-violet-50 hover:text-violet-700 hover:border-violet-300 transition-colors"
                  >
                    {loadingAutofill ? (
                      <Loader2 className="w-3 h-3 mr-1.5 animate-spin" />
                    ) : (
                      <Sparkles className="w-3 h-3 mr-1.5 text-violet-500" />
                    )}
                    Autofill with AI
                  </Button>
                </div>

                <div className="flex flex-col gap-4">
                  {photoPreview ? (
                    <div className="relative rounded-lg overflow-hidden border border-border/50 group">
                      <img src={photoPreview} alt="Preview" className="w-full h-64 object-cover" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Button
                          type="button"
                          variant="secondary"
                          onClick={() => document.getElementById("photo")?.click()}
                        >
                          Change Photo
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div
                      onClick={() => document.getElementById("photo")?.click()}
                      className="border-2 border-dashed border-border/50 rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer hover:border-gray-400 hover:bg-gray-50/50 transition-all min-h-[200px]"
                    >
                      <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                        <Upload className="w-6 h-6 text-gray-500" />
                      </div>
                      <p className="font-medium text-gray-700">Click to upload photo</p>
                      <p className="text-sm text-gray-400 mt-1">PNG, JPG up to 5MB</p>
                    </div>
                  )}
                  <input
                    id="photo"
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoChange}
                    className="hidden"
                  />
                  {!photoFile && (
                    <p className="text-xs text-muted-foreground">
                      Upload a photo to enable AI autofill for item details.
                    </p>
                  )}
                </div>
              </div>

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
