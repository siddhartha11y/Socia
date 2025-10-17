import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus } from "lucide-react";
import api from "../api/axios";
import { toast } from "react-toastify";
import SimpleStoryCreator from "./SimpleStoryCreator";
import SimpleStoryViewer from "./SimpleStoryViewer";

export default function SimpleStoriesCarousel({ user }) {
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedUserStories, setSelectedUserStories] = useState(null);
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);

  // Fetch stories from followed users
  useEffect(() => {
    fetchStories();
  }, []);

  const fetchStories = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/api/stories");
      setStories(data);
    } catch (error) {
      console.error("Error fetching stories:", error);
      toast.error("Failed to load stories");
    } finally {
      setLoading(false);
    }
  };

  const handleStoryCreated = () => {
    fetchStories(); // Refresh stories after creating new one
    setShowCreateModal(false);
  };

  const openStoryViewer = (userStories, startIndex = 0) => {
    setSelectedUserStories(userStories);
    setCurrentStoryIndex(startIndex);
  };

  const closeStoryViewer = () => {
    setSelectedUserStories(null);
    setCurrentStoryIndex(0);
    // Refresh stories to update viewed status
    fetchStories();
  };

  if (loading) {
    return (
      <div className="flex space-x-4 p-4 overflow-x-auto">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex-shrink-0">
            <div className="w-20 h-20 bg-gray-700 rounded-full animate-pulse"></div>
            <div className="w-16 h-3 bg-gray-700 rounded mt-2 mx-auto animate-pulse"></div>
          </div>
        ))}
      </div>
    );
  }

  // Separate own stories from others
  const ownStory = stories.find((story) => story.author._id === user?._id);
  const otherStories = stories.filter(
    (story) => story.author._id !== user?._id
  );

  return (
    <>
      <div className="bg-black border-b border-gray-800">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex space-x-4 overflow-x-auto">
            {/* Your Story - Show your story if you have one, otherwise show create button */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                if (ownStory) {
                  openStoryViewer(ownStory.stories, 0);
                } else {
                  setShowCreateModal(true);
                }
              }}
              className="flex-shrink-0 cursor-pointer text-center"
            >
              <div className="relative">
                <div
                  className={`w-20 h-20 rounded-full ${
                    ownStory
                      ? `p-1 ${
                          ownStory.hasUnviewed
                            ? "bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500"
                            : "bg-gray-600"
                        }`
                      : "bg-gray-600"
                  }`}
                >
                  <div
                    className={`w-full h-full rounded-full ${
                      ownStory ? "bg-black p-1" : ""
                    }`}
                  >
                    <img
                      src={
                        user?.profilePicture && user.profilePicture !== null
                          ? `${import.meta.env.VITE_API_BASE_URL}${user.profilePicture}`
                          : "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80' viewBox='0 0 80 80'%3E%3Ccircle cx='40' cy='40' r='40' fill='%236B7280'/%3E%3Ccircle cx='40' cy='30' r='12' fill='%239CA3AF'/%3E%3Cpath d='M15 65 C15 52, 27 45, 40 45 C53 45, 65 52, 65 65' fill='%239CA3AF'/%3E%3C/svg%3E"
                      }
                      alt={user?.username}
                      className="w-full h-full rounded-full object-cover"
                      onError={(e) => {
                        e.target.src =
                          "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80' viewBox='0 0 80 80'%3E%3Ccircle cx='40' cy='40' r='40' fill='%236B7280'/%3E%3Ccircle cx='40' cy='30' r='12' fill='%239CA3AF'/%3E%3Cpath d='M15 65 C15 52, 27 45, 40 45 C53 45, 65 52, 65 65' fill='%239CA3AF'/%3E%3C/svg%3E";
                      }}
                    />
                  </div>
                </div>

                {/* Plus icon for creating story (only when no story exists) */}
                {!ownStory && (
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center border-2 border-gray-900">
                    <Plus size={12} className="text-white" />
                  </div>
                )}
              </div>
              <p className="text-xs text-center mt-2 text-gray-300 max-w-[80px] truncate">
                Your Story
              </p>
            </motion.div>

            {/* Stories from other users */}
            {otherStories.map((userStory) => (
              <motion.div
                key={userStory.author._id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => openStoryViewer(userStory.stories, 0)}
                className="flex-shrink-0 cursor-pointer text-center"
              >
                <div className="relative">
                  {/* Story Ring - Different colors based on viewed status */}
                  <div
                    className={`w-20 h-20 rounded-full p-1 ${
                      userStory.hasUnviewed
                        ? "bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500"
                        : "bg-gray-600"
                    }`}
                  >
                    <div className="w-full h-full rounded-full bg-black p-1">
                      <img
                        src={
                          userStory.author.profilePicture &&
                          userStory.author.profilePicture !==
                            "/images/default-avatar.png" &&
                          userStory.author.profilePicture !==
                            "/images/default-avatar.svg"
                            ? `${import.meta.env.VITE_API_BASE_URL}${
                                userStory.author.profilePicture
                              }`
                            : "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80' viewBox='0 0 80 80'%3E%3Ccircle cx='40' cy='40' r='40' fill='%236B7280'/%3E%3Ccircle cx='40' cy='30' r='12' fill='%239CA3AF'/%3E%3Cpath d='M15 65 C15 52, 27 45, 40 45 C53 45, 65 52, 65 65' fill='%239CA3AF'/%3E%3C/svg%3E"
                        }
                        alt={userStory.author.username}
                        className="w-full h-full rounded-full object-cover"
                        onError={(e) => {
                          e.target.src =
                            "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80' viewBox='0 0 80 80'%3E%3Ccircle cx='40' cy='40' r='40' fill='%236B7280'/%3E%3Ccircle cx='40' cy='30' r='12' fill='%239CA3AF'/%3E%3Cpath d='M15 65 C15 52, 27 45, 40 45 C53 45, 65 52, 65 65' fill='%239CA3AF'/%3E%3C/svg%3E";
                        }}
                      />
                    </div>
                  </div>
                </div>
                <p className="text-xs text-center mt-2 text-gray-300 max-w-[80px] truncate">
                  {userStory.author.username}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Simple Story Creator */}
      <AnimatePresence>
        {showCreateModal && (
          <SimpleStoryCreator
            user={user}
            onClose={() => setShowCreateModal(false)}
            onStoryCreated={handleStoryCreated}
          />
        )}
      </AnimatePresence>

      {/* Simple Story Viewer */}
      <AnimatePresence>
        {selectedUserStories && (
          <SimpleStoryViewer
            stories={selectedUserStories}
            currentIndex={currentStoryIndex}
            user={user}
            onClose={closeStoryViewer}
            onNext={() => {
              if (currentStoryIndex < selectedUserStories.length - 1) {
                setCurrentStoryIndex(currentStoryIndex + 1);
              } else {
                closeStoryViewer();
              }
            }}
            onPrevious={() => {
              if (currentStoryIndex > 0) {
                setCurrentStoryIndex(currentStoryIndex - 1);
              }
            }}
          />
        )}
      </AnimatePresence>
    </>
  );
}