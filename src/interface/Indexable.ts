import mongoose from 'mongoose';
import { SearchQuery } from './SearchQuery';

export interface Indexable {
  getAllNotesIterator(
    cond: mongoose.FilterQuery<mongoose.Document>
  ): mongoose.QueryCursor<mongoose.Document>;

  close(): void;

  getPreviousIndexedData(callback: (cond: SearchQuery) => void): void;

  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  reindexOne(doc: any, callback: (indexErr: boolean) => void): void;
}
