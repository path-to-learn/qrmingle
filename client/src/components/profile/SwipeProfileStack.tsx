import { useState } from "react";
import { motion, useMotionValue, useTransform, AnimatePresence } from "framer-motion";
import ProfileCard from "./ProfileCard";
import { Button } from "@/components/ui/button";
import { PlusIcon, ChevronLeft, ChevronRight } from "lucide-react";

interface SwipeProfileStackProps {
  profiles: any[];
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
  onNewProfile: () => void;
}

function SwipeCard({ profile, onEdit, onDelete, isTop, onSwipeLeft, onSwipeRight }: any) {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-8, 8]);
  const opacity = useTransform(x, [-150, -80, 0, 80, 150], [0, 1, 1, 1, 0]);

  const handleDragEnd = (_: any, info: any) => {
    if (Math.abs(info.offset.x) > 80) {
      if (info.offset.x > 0) onSwipeRight();
      else onSwipeLeft();
    }
  };

  if (!isTop) return null;

  return (
    <motion.div
      style={{ x, rotate, opacity }}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.7}
      onDragEnd={handleDragEnd}
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.95, opacity: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="w-full"
    >
      <div style={{ width: "100%", overflow: "hidden" }}><ProfileCard {...profile} onEdit={onEdit} onDelete={onDelete} /></div>
    </motion.div>
  );
}

export default function SwipeProfileStack({ profiles, onEdit, onDelete, onNewProfile }: SwipeProfileStackProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const goNext = () => {
    if (currentIndex < profiles.length - 1) setCurrentIndex(currentIndex + 1);
  };

  const goPrev = () => {
    if (currentIndex > 0) setCurrentIndex(currentIndex - 1);
  };

  if (profiles.length === 0) {
    return (
      <div
        className="border border-dashed border-muted-foreground rounded-lg flex items-center justify-center p-8 cursor-pointer"
        onClick={onNewProfile}
        style={{ minHeight: '300px' }}
      >
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
            <PlusIcon className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="font-medium">Create Your First Profile</h3>
          <p className="text-sm text-muted-foreground mt-1">Tap to get started</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 overflow-hidden" style={{ width: "100%", maxWidth: "100%" }}>
      {/* Dot indicators */}
      <div className="flex items-center justify-center gap-2">
        {profiles.map((_: any, i: number) => (
          <div
            key={i}
            onClick={() => setCurrentIndex(i)}
            className={`h-2 rounded-full transition-all cursor-pointer ${
              i === currentIndex ? 'w-6 bg-primary' : 'w-2 bg-muted-foreground/30'
            }`}
          />
        ))}
      </div>

      {/* Card */}
      <div className="w-full overflow-hidden">
        <AnimatePresence mode="wait">
          <SwipeCard
            key={currentIndex}
            profile={profiles[currentIndex]}
            onEdit={onEdit}
            onDelete={onDelete}
            isTop={true}
            onSwipeLeft={goNext}
            onSwipeRight={goPrev}
          />
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between px-4">
        <Button
          variant="outline"
          size="icon"
          onClick={goPrev}
          disabled={currentIndex === 0}
          className="rounded-full h-10 w-10"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <span className="text-sm text-muted-foreground">
          {currentIndex + 1} / {profiles.length}
        </span>

        <Button
          variant="outline"
          size="icon"
          onClick={goNext}
          disabled={currentIndex === profiles.length - 1}
          className="rounded-full h-10 w-10"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Add new */}
      <Button onClick={onNewProfile} className="w-full">
        <PlusIcon className="mr-2 h-4 w-4" />
        Create New Profile
      </Button>
    </div>
  );
}
