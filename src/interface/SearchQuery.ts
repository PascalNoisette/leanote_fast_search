import mongoose from 'mongoose';
export interface SearchQuery {
  UserId?: string;
  Match?: string;
  UpdatedTime?: mongoose.FilterQuery<mongoose.Document>;
  CreatedTime?: mongoose.FilterQuery<mongoose.Document>;
  Type?: mongoose.FilterQuery<mongoose.Document>;
  $and?: SearchQuery[];
}
