'use client'

import { useState } from "react";
import { Play, Pause } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AudioPlayerProps {
  beatTitle: string;
  duration: number;
}

export default function AudioPlayer({ beatTitle, duration }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const togglePlayback = () => {
    // In a real implementation, this would control actual audio playback
    setIsPlaying(!isPlaying);
  };

  return (
    <div className="flex items-center justify-between mt-2">
      <Button
        variant="ghost"
        size="icon"
        onClick={togglePlayback}
        className="h-8 w-8 text-current hover:text-current/80"
      >
        {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
      </Button>
      <span className="text-xs text-gray-400">
        {formatDuration(duration)}
      </span>
    </div>
  );
}