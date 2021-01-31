import { Cli } from '../../interface/Cli';
import { LoggerInstance } from 'winston';
import { injectable, inject } from 'inversify';
import 'reflect-metadata';
import { Notes } from '../../interface/Notes';
import striptags from 'striptags';
/* eslint-disable  @typescript-eslint/no-var-requires */
const htmlentities = require('html-entities');

@injectable()
export class Reindex implements Cli {
  public logger: LoggerInstance;
  public notes: Notes;

  constructor(
    @inject('Logger') logger: LoggerInstance,
    @inject('Notes') notes: Notes
  ) {
    this.notes = notes;
    this.logger = logger;
  }

  getCommand(): string {
    return 'reindex';
  }
  getDescription(): string {
    return 'Index into elasticsearch notes from mongodb';
  }
  /* eslint-disable  @typescript-eslint/no-explicit-any */
  /* eslint-disable  @typescript-eslint/no-unused-vars */
  action(...args: any[]): void | Promise<void> {
    let counter = 0;
    let total = 0;

    this.notes.getPreviousIndexedData((previous) => {
      const stream = this.notes.getAllNotesIterator(previous);

      stream.on('data', (doc) => {
        stream.pause();
        counter++;

        this.notes.findContentById(doc._id, function (err, enrich: any) {
          if (!err && enrich) {
            const striped = striptags(enrich.Content, ['a']);
            doc.Content = htmlentities.decode(striped, { level: 'html5' });
          } else {
            console.log('No content for ' + doc._id);
          }
          doc.index(function onIndex(indexErr: boolean) {
            counter--;
            if (indexErr) {
              console.log(indexErr);
            } else {
              total++;
            }
            stream.resume();
          });
        });
      });

      stream.on('close', () => {
        const closeInterval = setInterval(() => {
          if (counter === 0) {
            clearInterval(closeInterval);
            console.log('indexed ' + total + ' documents!');
            this.notes.close();
          }
        }, 2000);
      });

      stream.on('error', (err) => {
        console.log(err);
      });
    });
  }
}
