import { injectable, inject } from 'inversify';
import 'reflect-metadata';
import { Mongo } from './Mongo';
import mongoose from 'mongoose';
import { Indexable } from '../../interface/Indexable';
import { SearchQuery } from '../../interface/SearchQuery';
import AttachSchema from '../../schema/attach';
import missingAttachmentDocSearch from '../../schema/missing_attachment';
import fs from 'fs';
import { Installable } from '../../interface/Installable';
import async from 'async';
import Analyzer from '../../schema/analyzer';
import { Client } from 'elasticsearch';
import { Searchable } from '../../interface/Searchable';
import { SearchResult } from '../../interface/SearchResult';
/* eslint-disable-next-line @typescript-eslint/no-var-requires */
const mongoosastic = require('mongoosastic');

@injectable()
export class Attachment implements Indexable, Installable, Searchable {
  public schema: mongoose.Schema<mongoose.Document>;

  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  public model: any;
  public connection: Mongo;
  public storage_path = process.env.STORAGE_PATH || '/leanote/data/';

  public mongoCollectionName = 'attachs';
  public elasticIndexName = 'attachs';
  public elasticPipelineName = 'attachment';

  constructor(@inject('Mongo') connection: Mongo) {
    this.connection = connection;
    this.schema = new mongoose.Schema(AttachSchema);
    this.schema.plugin(
      mongoosastic,
      Object.assign(
        { index: this.elasticIndexName },
        connection.mongoosasticoption
      )
    );
    this.model = mongoose.model(
      'Attach',
      this.schema,
      this.mongoCollectionName
    );
  }

  search(
    opts: SearchQuery,
    callback?: (err: mongoose.CallbackError, doc: SearchResult) => void
  ): void {
    this.model.esSearch(
      {
        query: {
          bool: {
            must: [
              {
                term: {
                  UploadUserId: opts.UserId
                }
              },
              {
                bool: {
                  should: [
                    {
                      match: {
                        'attachment.content': opts.Match
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
  createIndex(callback: () => void): void {
    const client: Client = this.model.esClient;
    const optimizedMapping = {
      mappings: {
        properties: {
          'attachment.content': {
            type: 'text',
            analyzer: 'rebuilt_french'
          },
          Title: {
            type: 'text',
            analyzer: 'rebuilt_french'
          }
        }
      },
      settings: Analyzer
    };

    async.series(
      [
        (resolve: () => void) => {
          client.indices
            .delete({
              index: this.elasticIndexName
            })
            .finally(resolve);
        },
        (resolve: () => void) => {
          client.indices.create(
            {
              index: this.elasticIndexName,
              body: optimizedMapping
            },
            resolve
          );
        },
        (resolve: () => void) => {
          client.ingest
            .deletePipeline({
              id: this.elasticPipelineName
            })
            .finally(resolve);
        },
        (resolve: () => void) => {
          client.ingest.putPipeline(
            {
              id: this.elasticPipelineName,
              body: {
                description: 'Index note attachment',
                processors: [
                  {
                    attachment: {
                      field: 'Data',
                      properties: ['content'],
                      indexed_chars: 1500,
                      indexed_chars_field: 'max_size'
                    },
                    remove: {
                      field: 'Data'
                    }
                  }
                ]
              }
            },
            resolve
          );
        }
      ],
      function () {
        callback();
        mongoose.disconnect();
      }
    );
  }
  getAllNotesIterator(
    cond: mongoose.FilterQuery<mongoose.Document>
  ): mongoose.QueryCursor<mongoose.Document> {
    console.log(cond);
    return this.model.find(cond).batchSize(this.connection.bulk.batch).cursor();
  }
  close(): void {
    mongoose.disconnect();
  }
  getPreviousIndexedData(callback: (cond: SearchQuery) => void): void {
    this.model.esSearch(
      missingAttachmentDocSearch,
      /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
      (err: any, result: any) => {
        const supportedFormat: string =
          process.env.SUPPORTED_FORMAT || 'pdf,doc,docx,xls,xlsx,epub,ods,odt';
        if (!err && result && result.hits && result.hits.total > 0) {
          const doc = result.hits.hits[0]._source;
          console.log(`Note missing attachment from ${doc.CreatedTime}`);
          callback({
            CreatedTime: { $gt: doc.CreatedTime },
            Type: { $in: supportedFormat.split(',') }
          });
        } else {
          callback({
            Type: { $in: supportedFormat.split(',') }
          });
        }
      }
    );
  }
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/explicit-module-boundary-types */
  reindexOne(doc: any, callback: (indexErr: boolean) => void): void {
    try {
      doc.Data = fs
        .readFileSync(this.storage_path + doc.Path)
        .toString('base64');

      console.log(`Processing ${doc.Title} of ${doc.NoteId}`);
      this.model.esClient.index(
        {
          id: doc._id + '',
          index: this.elasticIndexName,
          pipeline: this.elasticPipelineName,
          body: doc
        },
        callback
      );
    } catch (e) {
      console.log(e);
      callback(false);
    }
  }
}
