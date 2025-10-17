import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Camera, Type, Palette } from "lucide-react";
import api from "../api/axios";
import { toast } from "react-toastify";

export default function SimpleStoryCreator({ user, onClose, onStoryCreated }) {
  const [content, setContent] = useState("");
  const [backgroundColor, setBackgroundColor] = useState("#000000");
  const [textColor, setTextColor] = useState("#ffffff");
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const backgroundColors = [
    "#000000", "#1f2937", "#7c3aed", "#dc2626", "#ea580c",
    "#ca8a04", "#16a34a", "#0891b2", "#c2410c", "#be185d"
  ];

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        toast.error("File size must be less than 10MB");
        return;
      }
      
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!content.trim() && !selectedFile) {
      toast.error("Please add some content or select an image");
      return;
    }

    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append("content", content);
      formData.append("backgroundColor", backgroundColor);
      formData.append("textColor", textColor);
      
      if (selectedFile) {
        formData.append("media", selectedFile);
      }

      const response = await api.post("/api/stories", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      toast.success("Story created successfully!");
      onStoryCreated();
      onClose();
    } catch (error) {
      console.error("Error creating story:", error);
      toast.error(error.response?.data?.message || "Failed to create story");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">Create Story</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Preview */}
          <div
            className="w-full h-64 rounded-lg flex items-center justify-center relative overflow-hidden"
            style={{ backgroundColor }}
          >
            {previewUrl ? (
              <img
                src={previewUrl}
                alt="Preview"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="text-center">
                <Camera size={48} className="mx-auto mb-2 text-gray-400" />
                <p className="text-gray-400">No image selected</p>
              </div>
            )}
            
            {content && (
              <div className="absolute inset-0 flex items-center justify-center p-4">
                <p
                  className="text-center text-lg font-medium break-words"
                  style={{ color: textColor }}
                >
                  {content}
                </p>
              </div>
            )}
          </div>

          {/* Text Input */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <Type size={16} />
              Story Text
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="What's on your mind?"
              className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
              maxLength={200}
            />
            <p className="text-xs text-gray-500 mt-1">
              {content.length}/200 characters
            </p>
          </div>

          {/* File Input */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <Camera size={16} />
              Add Image
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="w-full p-2 border border-gray-300 rounded-lg file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
          </div>

          {/* Color Pickers */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <Palette size={16} />
                Background
              </label>
              <div className="flex flex-wrap gap-2">
                {backgroundColors.map((color) => (
                  <button
                    key={color}
                    onClick={() => setBackgroundColor(color)}
                    className={`w-8 h-8 rounded-full border-2 ${
                      backgroundColor === color ? "border-blue-500" : "border-gray-300"
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Text Color
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => setTextColor("#ffffff")}
                  className={`w-8 h-8 rounded-full border-2 bg-white ${
                    textColor === "#ffffff" ? "border-blue-500" : "border-gray-300"
                  }`}
                />
                <button
                  onClick={() => setTextColor("#000000")}
                  className={`w-8 h-8 rounded-full border-2 bg-black ${
                    textColor === "#000000" ? "border-blue-500" : "border-gray-300"
                  }`}
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            disabled={isLoading || (!content.trim() && !selectedFile)}
            className="w-full bg-blue-500 text-white py-3 rounded-lg font-medium hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? "Creating..." : "Share Story"}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}