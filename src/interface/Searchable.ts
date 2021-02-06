import mongoose from 'mongoose';
import { SearchQuery } from '../interface/SearchQuery';
import { SearchResult } from './SearchResult';

export interface Searchable {
  search(
    opts: SearchQuery,
    callback?: (err: mongoose.CallbackError, doc: SearchResult) => void
  ): void;
}
