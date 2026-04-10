const mongoose = require('mongoose');
const User = require('./models/User');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const resetPassword = async (email, newPassword) => {
  await mongoose.connect(process.env.MONGO_URI);
  const salt = await bcrypt.genSalt(10);
  const hashed = await bcrypt.hash(newPassword, salt);
  const result = await User.updateOne({ email }, { $set: { password: hashed } });
  console.log(result.modifiedCount ? `✅ Password updated for ${email}` : '❌ User not found');
  mongoose.disconnect();
};

// Replace with the owner's email and new password
resetPassword('owner@test.com', '123456');