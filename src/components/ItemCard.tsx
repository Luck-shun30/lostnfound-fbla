import { GlassCard } from "./GlassCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, HelpCircle } from "lucide-react";
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
  onRequestInfo: (id: string) => void;
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
  onRequestInfo,
  id,
}: ItemCardProps) => {
  return (
    <GlassCard hover className="overflow-hidden group animate-fade-in">
      <div className="aspect-video relative overflow-hidden bg-white/95">
        {photoUrl ? (
          <img
            src={photoUrl}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-4xl text-muted-foreground/50">📦</span>
          </div>
        )}
        <div className="absolute top-3 right-3">
          <Badge
            variant={status === "available" ? "default" : "secondary"}
            className={status === "available" ? "bg-accent-green text-white border-0" : "nb-card-subtle text-foreground"}
          >
            {status}
          </Badge>
        </div>
      </div>

      <div className="p-6 space-y-4">
        <div>
          <div className="flex items-start justify-between mb-2">
            <h3 className="text-xl font-semibold text-foreground">{title}</h3>
            <Badge variant="outline" className="border-black text-foreground">{category}</Badge>
          </div>
          <p className="text-sm text-muted-foreground line-clamp-2">
            {description}
          </p>
        </div>

        <div className="space-y-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-foreground" />
            <span>{location}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-foreground" />
            <span>Found on {format(new Date(dateFound), "MMM d, yyyy")}</span>
          </div>
        </div>

        {status === "available" && (
          <div className="flex gap-2">
            <Button 
              aria-label={`Claim item ${title}`} 
              onClick={() => onClaim(id)} 
              className="flex-1 nb-button bg-accent-green text-white hover:bg-accent-green/90 border-black"
            >
              Claim Item
            </Button>
            <Button 
              aria-label={`Request info about ${title}`} 
              onClick={() => onRequestInfo(id)} 
              variant="outline"
              className="nb-outline text-foreground"
            >
              <HelpCircle className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>
    </GlassCard>
  );
};
