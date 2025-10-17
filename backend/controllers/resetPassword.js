import User from "../models/userModel.js";
import bcrypt from "bcryptjs";

// Temporary password reset for development
export const resetUserPassword = async (req, res) => {
  try {
    const { email, newPassword } = req.body;
    
    if (!email || !newPassword) {
      return res.status(400).json({ message: "Email and new password required" });
    }
    
    // Find user
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    // Hash new password
    const hashedPassword = bcrypt.hashSync(newPassword, 10);
    
    // Update password
    await User.findByIdAndUpdate(user._id, { password: hashedPassword });
    
    res.json({ 
      message: "Password reset successfully",
      email: user.email,
      username: user.username
    });
    
  } catch (error) {
    console.error("Password reset error:", error);
    res.status(500).json({ message: "Server error" });
  }
};