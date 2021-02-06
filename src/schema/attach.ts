import mongoose from 'mongoose';
export default {
  NoteId: { type: mongoose.Types.ObjectId, es_indexed: true },
  UploadUserId: { type: mongoose.Types.ObjectId, es_indexed: true },
  Name: { type: String, es_indexed: true, es_analyzer: 'rebuilt_french' },
  Title: { type: String, es_indexed: true, es_analyzer: 'rebuilt_french' },
  Data: { type: String, es_indexed: true, es_analyzer: 'rebuilt_french' },
  Size: { type: Number, es_indexed: true },
  Type: { type: String, es_indexed: true, es_index: 'not_analyzed' },
  Path: { type: String, es_indexed: true, es_index: 'not_analyzed' },
  CreatedTime: { type: Date, es_indexed: true }
};
