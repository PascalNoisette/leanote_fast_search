import mongoose from 'mongoose';
export interface SearchQuery {
  UserId?: string;
  Match?: string;
  UpdatedTime?: mongoose.FilterQuery<mongoose.Document>;
}
