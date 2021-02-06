import mongoose from 'mongoose';
export default {
  UserId: mongoose.Types.ObjectId,
  Content: String,
  Abstract: String,
  CreatedTime: Date,
  UpdatedTime: Date,
  UpdatedUserId: mongoose.Types.ObjectId
};
