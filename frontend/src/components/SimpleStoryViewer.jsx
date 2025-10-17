import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import api from "../api/axios";

export default function SimpleStoryViewer({
  stories,
  currentIndex,
  onClose,
  onNext,
  onPrevious,
  user,
}) {
  const [isPlaying, setIsPlaying] = useState(true);
  const [progress, setProgress] = useState(0);

  const currentStory = stories[currentIndex];
  const STORY_DURATION = 5000; // 5 seconds

  // Auto-progress story
  useEffect(() => {
    if (!isPlaying || !currentStory) return;

    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const newProgress = Math.min((elapsed / STORY_DURATION) * 100, 100);
      
      setProgress(newProgress);
      
      if (newProgress >= 100) {
        clearInterval(interval);
        setTimeout(() => onNext(), 100);
      }
    }, 50);

    return () => clearInterval(interval);
  }, [currentIndex, isPlaying, onNext, currentStory]);

  // Reset progress when story changes
  useEffect(() => {
    setProgress(0);
    setIsPlaying(true);
  }, [currentIndex]);

  // Mark story as viewed
  useEffect(() => {
    if (currentStory) {
      api.get(`/api/stories/${currentStory._id}`).catch(console.error);
    }
  }, [currentStory]);

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleStoryClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const width = rect.width;

    if (clickX < width / 2) {
      onPrevious();
    } else {
      onNext();
    }
  };

  if (!currentStory) return null;

  const formatTime = (timestamp) => {
    const now = new Date();
    const storyTime = new Date(timestamp);
    const diffInHours = Math.floor((now - storyTime) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return "now";
    if (diffInHours < 24) return `${diffInHours}h`;
    return `${Math.floor(diffInHours / 24)}d`;
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black z-50 flex items-center justify-center"
    >
      {/* Progress Bars */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 w-full max-w-md px-4 flex space-x-1 z-10">
        {stories.map((_, index) => (
          <div
            key={index}
            className="flex-1 h-1 bg-gray-600 rounded-full overflow-hidden"
          >
            <div
              className="h-full bg-white transition-all duration-100"
              style={{
                width:
                  index < currentIndex
                    ? "100%"
                    : index === currentIndex
                    ? `${progress}%`
                    : "0%",
              }}
            />
          </div>
        ))}
      </div>

      {/* Header */}
      <div className="absolute top-8 left-1/2 transform -translate-x-1/2 w-full max-w-md px-4 flex items-center justify-between z-10">
        <div className="flex items-center space-x-3">
          <img
            src={
              currentStory.author?.profilePicture
                ? `${import.meta.env.VITE_API_BASE_URL}${currentStory.author.profilePicture}`
                : "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 40 40'%3E%3Ccircle cx='20' cy='20' r='20' fill='%236B7280'/%3E%3Ccircle cx='20' cy='15' r='6' fill='%239CA3AF'/%3E%3Cpath d='M8 32 C8 26, 13 22, 20 22 C27 22, 32 26, 32 32' fill='%239CA3AF'/%3E%3C/svg%3E"
            }
            alt={currentStory.author?.username}
            className="w-10 h-10 rounded-full object-cover border-2 border-white"
            onError={(e) => {
              e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 40 40'%3E%3Ccircle cx='20' cy='20' r='20' fill='%236B7280'/%3E%3Ccircle cx='20' cy='15' r='6' fill='%239CA3AF'/%3E%3Cpath d='M8 32 C8 26, 13 22, 20 22 C27 22, 32 26, 32 32' fill='%239CA3AF'/%3E%3C/svg%3E";
            }}
          />
          <div>
            <p className="text-white font-semibold">
              {currentStory.author?.username}
            </p>
            <p className="text-gray-300 text-sm">
              {formatTime(currentStory.createdAt)}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={togglePlayPause}
            className="p-2 rounded-full bg-black bg-opacity-50 text-white hover:bg-opacity-70 transition-colors"
          >
            {isPlaying ? <Pause size={20} /> : <Play size={20} />}
          </button>

          <button
            onClick={onClose}
            className="p-2 rounded-full bg-black bg-opacity-50 text-white hover:bg-opacity-70 transition-colors"
          >
            <X size={20} />
          </button>
        </div>
      </div>

      {/* Story Content */}
      <div
        className="relative w-full max-w-md h-full max-h-[80vh] cursor-pointer"
        onClick={handleStoryClick}
      >
        {currentStory.media ? (
          <div className="relative w-full h-full">
            <img
              src={`${import.meta.env.VITE_API_BASE_URL}${currentStory.media}`}
              alt="Story"
              className="w-full h-full object-cover rounded-lg"
              onError={(e) => {
                console.error("Failed to load story image:", e.target.src);
                e.target.style.display = 'none';
              }}
            />
            {currentStory.content && (
              <div className="absolute bottom-16 left-4 right-4">
                <p className="text-white text-lg font-medium bg-black bg-opacity-50 p-3 rounded-lg">
                  {currentStory.content}
                </p>
              </div>
            )}
          </div>
        ) : (
          <div
            className="w-full h-full rounded-lg flex items-center justify-center p-8"
            style={{ backgroundColor: currentStory.backgroundColor }}
          >
            <p
              className="text-center text-xl font-medium break-words"
              style={{ color: currentStory.textColor }}
            >
              {currentStory.content}
            </p>
          </div>
        )}

        {/* Navigation Areas */}
        <div className="absolute inset-0 flex">
          <div
            className="flex-1"
            onClick={(e) => {
              e.stopPropagation();
              onPrevious();
            }}
          />
          <div
            className="flex-1"
            onClick={(e) => {
              e.stopPropagation();
              onNext();
            }}
          />
        </div>
      </div>

      {/* Navigation Buttons */}
      {currentIndex > 0 && (
        <button
          onClick={onPrevious}
          className="absolute left-4 top-1/2 transform -translate-y-1/2 p-3 rounded-full bg-black bg-opacity-50 text-white hover:bg-opacity-70 transition-colors"
        >
          <ChevronLeft size={24} />
        </button>
      )}

      {currentIndex < stories.length - 1 && (
        <button
          onClick={onNext}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 p-3 rounded-full bg-black bg-opacity-50 text-white hover:bg-opacity-70 transition-colors"
        >
          <ChevronRight size={24} />
        </button>
      )}
    </motion.div>
  );
}