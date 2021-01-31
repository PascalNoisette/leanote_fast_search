import mongoose from 'mongoose';
import { Session as ISession } from '../interface/Session';
import { SearchQuery } from '../interface/SearchQuery';
import { SearchResult } from './SearchResult';

export interface Notes {
  createIndex(callback: () => void): void;

  getAllNotesIterator(
    cond: mongoose.FilterQuery<mongoose.Document>
  ): mongoose.QueryCursor<mongoose.Document>;

  findContentById(
    id: string,
    callback?: (
      err: mongoose.CallbackError,
      doc: mongoose.Document | null
    ) => void
  ): mongoose.Query<mongoose.Document, mongoose.Document, mongoose.Document>;

  close(): void;

  isSessionValid(session: ISession): Promise<boolean>;

  search(
    opts: SearchQuery,
    callback?: (err: mongoose.CallbackError, doc: SearchResult) => void
  ): void;

  getPreviousIndexedData(callback: (cond: SearchQuery) => void): void;
}
