import { injectable, inject } from 'inversify';
import 'reflect-metadata';
import { Installable } from '../../interface/Installable';
import { SearchQuery } from '../../interface/SearchQuery';
import { Mongo } from './Mongo';
import striptags from 'striptags';
import mongoose from 'mongoose';
import { SearchResult } from '../../interface/SearchResult';
import { Indexable } from '../../interface/Indexable';
import { Searchable } from '../../interface/Searchable';
import ContentSchema from '../../schema/note_contents';
import NoteSchema from '../../schema/notes';
import Analyzer from '../../schema/analyzer';
import keywordSearch from '../../schema/keyword_search';
import previouslyIndexedSearch from '../../schema/previouslyindexed';

/* eslint-disable-next-line @typescript-eslint/no-var-requires */
const htmlentities = require('html-entities');

/* eslint-disable-next-line @typescript-eslint/no-var-requires */
const mongoosastic = require('mongoosastic');
/* eslint-disable-next-line @typescript-eslint/no-var-requires */
const Generator = require('../../../node_modules/mongoosastic/lib/mapping-generator');

@injectable()
export class Leanote implements Installable, Indexable, Searchable {
  public Notes: mongoose.Schema<mongoose.Document>;
  public NoteContents: mongoose.Schema<mongoose.Document>;

  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  public NotesModel: any;
  public NoteContentModel: mongoose.Model<mongoose.Document>;

  public connection: Mongo;

  constructor(@inject('Mongo') connection: Mongo) {
    this.connection = connection;
    this.Notes = new mongoose.Schema(NoteSchema);
    this.NoteContents = new mongoose.Schema(ContentSchema);

    this.NoteContents.plugin(mongoosastic, connection.mongoosasticoption);
    this.Notes.plugin(mongoosastic, connection.mongoosasticoption);
    this.NotesModel = mongoose.model('Note', this.Notes);
    this.NoteContentModel = mongoose.model(
      'NoteContent',
      this.NoteContents,
      'note_contents'
    );
  }

  createIndex(callback: () => void): void {
    const generator = new Generator();
    const optimizedMapping = {
      mappings: generator.generateMapping(this.Notes),
      settings: Analyzer
    };
    // fix https://www.elastic.co/blog/strings-are-dead-long-live-strings
    for (const property in optimizedMapping.mappings.properties) {
      if (
        optimizedMapping.mappings.properties[property].index ==
          'not_analyzed' &&
        optimizedMapping.mappings.properties[property].type == 'text'
      ) {
        delete optimizedMapping.mappings.properties[property].index;
        optimizedMapping.mappings.properties[property].type = 'keyword';
      }
    }
    // check https://127.0.0.1:9200/notes/
    const client = this.NotesModel.esClient;
    const indexName = 'notes';

    client.indices.delete(
      {
        index: indexName
      },
      () => {
        return client.indices.create(
          {
            index: indexName,
            body: optimizedMapping
          },
          function () {
            callback();
            mongoose.disconnect();
          }
        );
      }
    );
  }

  getAllNotesIterator(
    cond: mongoose.FilterQuery<mongoose.Document>
  ): mongoose.QueryCursor<mongoose.Document> {
    return this.NotesModel.find(cond)
      .batchSize(this.connection.bulk.batch)
      .cursor();
  }

  findContentById(
    id: string,
    callback?: (
      err: mongoose.CallbackError,
      doc: mongoose.Document | null
    ) => void
  ): mongoose.Query<mongoose.Document, mongoose.Document, mongoose.Document> {
    return this.NoteContentModel.findById(id, callback);
  }

  close(): void {
    mongoose.disconnect();
  }

  search(
    opts: SearchQuery,
    callback?: (err: mongoose.CallbackError, doc: SearchResult) => void
  ): void {
    this.NotesModel.esSearch(keywordSearch(opts), callback);
  }

  getPreviousIndexedData(callback: (cond: SearchQuery) => void): void {
    this.NotesModel.esSearch(
      previouslyIndexedSearch,
      /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
      (err: any, result: any) => {
        if (!err && result && result.hits && result.hits.total > 0) {
          const doc = result.hits.hits[0]._source;
          console.log(`Last note was indexed ${doc.UpdatedTime}`);
          callback({ UpdatedTime: { $gt: doc.UpdatedTime } });
        } else {
          callback({});
        }
      }
    );
  }

  /* eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/no-explicit-any */
  reindexOne(doc: any, callback: (indexErr: boolean) => void): void {
    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
    this.findContentById(doc._id, function (err, enrich: any): void {
      if (!err && enrich) {
        const striped = striptags(enrich.Content, ['a']);
        doc.Content = htmlentities.decode(striped, { level: 'html5' });
      } else {
        console.log('No content for ' + doc._id);
      }
      doc.index(callback);
    });
  }
}
