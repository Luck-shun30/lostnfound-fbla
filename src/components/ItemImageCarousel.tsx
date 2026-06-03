import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight, ImageIcon } from "lucide-react";

interface ItemImageCarouselProps {
  images?: Array<string | null | undefined>;
  title: string;
  className?: string;
  imageClassName?: string;
}

export const ItemImageCarousel = ({
  images,
  title,
  className,
  imageClassName,
}: ItemImageCarouselProps) => {
  const validImages = useMemo(() => images?.filter(Boolean) as string[] | undefined, [images]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const hasImages = Boolean(validImages?.length);
  const hasMultipleImages = Boolean(validImages && validImages.length > 1);

  useEffect(() => {
    setCurrentIndex(0);
  }, [validImages?.length]);

  const showPrevious = () => {
    if (!validImages?.length) return;
    setCurrentIndex((current) => (current === 0 ? validImages.length - 1 : current - 1));
  };

  const showNext = () => {
    if (!validImages?.length) return;
    setCurrentIndex((current) => (current + 1) % validImages.length);
  };

  return (
    <div className={cn("relative overflow-hidden bg-white/95", className)}>
      {hasImages ? (
        <img
          src={validImages?.[currentIndex]}
          alt={`${title} photo ${currentIndex + 1}`}
          className={cn("w-full h-full object-cover", imageClassName)}
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <ImageIcon className="w-12 h-12 text-muted-foreground/50" />
        </div>
      )}

      {hasMultipleImages && (
        <>
          <Button
            type="button"
            variant="secondary"
            size="icon"
            aria-label="Previous image"
            onClick={showPrevious}
            className="absolute left-3 top-1/2 h-8 w-8 -translate-y-1/2 rounded-full bg-white/90 text-foreground shadow-sm hover:bg-white"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="secondary"
            size="icon"
            aria-label="Next image"
            onClick={showNext}
            className="absolute right-3 top-1/2 h-8 w-8 -translate-y-1/2 rounded-full bg-white/90 text-foreground shadow-sm hover:bg-white"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-black/70 px-2 py-1 text-xs font-medium text-white">
            {currentIndex + 1} / {validImages?.length}
          </div>
        </>
      )}
    </div>
  );
};
