import { GlassCard } from "./GlassCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin } from "lucide-react";
import { format } from "date-fns";

interface ItemCardProps {
  id: string;
  title: string;
  description: string;
  category: string;
  location: string;
  dateFound: string;
  photoUrl?: string;
  status: string;
  onClaim: (id: string) => void;
}

export const ItemCard = ({
  title,
  description,
  category,
  location,
  dateFound,
  photoUrl,
  status,
  onClaim,
  id,
}: ItemCardProps) => {
  return (
    <GlassCard hover className="overflow-hidden group animate-fade-in">
      <div className="aspect-video relative overflow-hidden bg-muted">
        {photoUrl ? (
          <img
            src={photoUrl}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-hero">
            <span className="text-4xl text-muted-foreground/50">📦</span>
          </div>
        )}
        <div className="absolute top-3 right-3">
          <Badge
            variant={status === "available" ? "default" : "secondary"}
            className="backdrop-blur-sm bg-glass/90"
          >
            {status}
          </Badge>
        </div>
      </div>

      <div className="p-6 space-y-4">
        <div>
          <div className="flex items-start justify-between mb-2">
            <h3 className="text-xl font-semibold text-foreground">{title}</h3>
            <Badge variant="outline">{category}</Badge>
          </div>
          <p className="text-sm text-muted-foreground line-clamp-2">
            {description}
          </p>
        </div>

        <div className="space-y-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            <span>{location}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            <span>Found on {format(new Date(dateFound), "MMM d, yyyy")}</span>
          </div>
        </div>

        {status === "available" && (
          <Button
            onClick={() => onClaim(id)}
            className="w-full bg-gradient-primary hover:opacity-90"
          >
            Claim This Item
          </Button>
        )}
      </div>
    </GlassCard>
  );
};
