import { injectable } from 'inversify';
import 'reflect-metadata';
import { Notes as INotes } from '../interface/Notes';
import { Session as ISession } from '../interface/Session';
import { SearchQuery } from '../interface/SearchQuery';

import mongoose from 'mongoose';
import { SearchResult } from '../interface/SearchResult';
/* eslint-disable  @typescript-eslint/no-var-requires */
const mongoosastic = require('mongoosastic');
/* eslint-disable  @typescript-eslint/no-var-requires */
const Generator = require('../../node_modules/mongoosastic/lib/mapping-generator');

@injectable()
export class Leanote implements INotes {
  public Notes: mongoose.Schema<mongoose.Document>;
  public NoteContents: mongoose.Schema<mongoose.Document>;
  public Sessions: mongoose.Schema<mongoose.Document>;

  /* eslint-disable  @typescript-eslint/no-explicit-any */
  public NotesModel: any;
  public NoteContentModel: mongoose.Model<mongoose.Document>;
  public SessionsModel: mongoose.Model<mongoose.Document>;

  public bulk = {
    size: 100, // preferred number of docs to bulk index
    delay: 100, //milliseconds to wait for enough docs to meet size constraint
    batch: 50
  };

  constructor() {
    /* eslint-disable  @typescript-eslint/no-var-requires */
    this.Notes = new mongoose.Schema(require('../schema/notes'));
    this.NoteContents = new mongoose.Schema(require('../schema/note_contents'));
    this.Sessions = new mongoose.Schema(require('../schema/sessions'));

    const es_host = process.env.ES_HOST || 'https://admin:admin@127.0.0.1';
    const mongoosasticoption = {
      protocol: es_host.split('://')[0],
      host: es_host.split('://')[1].split('@')[1],
      auth: es_host.split('://')[1].split('@')[0],
      bulk: this.bulk
    };
    this.NoteContents.plugin(mongoosastic, mongoosasticoption);
    this.Notes.plugin(mongoosastic, mongoosasticoption);

    const mongo_host =
      process.env.MONGO_HOST || 'mongodb://127.0.0.1:27017/leanote';
    mongoose.connect(mongo_host, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    this.NotesModel = mongoose.model('Note', this.Notes);
    this.NoteContentModel = mongoose.model(
      'NoteContent',
      this.NoteContents,
      'note_contents'
    );
    this.SessionsModel = mongoose.model('Session', this.Sessions);
  }

  createIndex(callback: () => void): void {
    const generator = new Generator();
    const optimizedMapping = {
      mappings: generator.generateMapping(this.Notes),
      /* eslint-disable  @typescript-eslint/no-var-requires */
      settings: require('../schema/analyzer')
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
    return this.NotesModel.find(cond).batchSize(this.bulk.batch).cursor();
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

  async isSessionValid(session: ISession): Promise<boolean> {
    if (typeof session.UserId == 'undefined') {
      return false;
    }
    if (typeof session._ID == 'undefined') {
      return false;
    }
    try {
      const valid = await this.SessionsModel.findOne({
        SessionId: session._ID
      });
      return valid;
    } catch (err) {
      return false;
    }
    return true;
  }

  search(
    opts: SearchQuery,
    callback?: (err: mongoose.CallbackError, doc: SearchResult) => void
  ): void {
    this.NotesModel.esSearch(
      {
        query: {
          bool: {
            must: [
              {
                term: {
                  UserId: opts.UserId
                }
              },
              {
                bool: {
                  should: [
                    {
                      match: {
                        Content: opts.Match
                      }
                    },
                    {
                      match: {
                        Title: opts.Match
                      }
                    }
                  ],
                  minimum_should_match: '1'
                }
              }
            ]
          }
        }
      },
      callback
    );
  }

  getPreviousIndexedData(callback: (cond: SearchQuery) => void): void {
    this.NotesModel.esSearch(
      {
        query: {
          match_all: {}
        },
        size: 1,
        sort: [
          {
            UpdatedTime: {
              order: 'desc'
            }
          }
        ]
      },
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
}
