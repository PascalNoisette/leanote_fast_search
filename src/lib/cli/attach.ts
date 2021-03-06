import { Cli } from '../../interface/Cli';
import { LoggerInstance } from 'winston';
import { injectable, inject } from 'inversify';
import 'reflect-metadata';
import { IndexStream } from '../helper/IndexStream';
import { Indexable } from '../../interface/Indexable';

@injectable()
export class Attach implements Cli {
  public logger: LoggerInstance;
  public notes: Indexable;

  constructor(
    @inject('Logger') logger: LoggerInstance,
    @inject('Attachment') notes: Indexable
  ) {
    this.notes = notes;
    this.logger = logger;
  }

  getCommand(): string {
    return 'attach';
  }
  getDescription(): string {
    return 'Add attachment to notes into elasticsearch';
  }
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
  action(...args: any[]): void | Promise<void> {
    const stream = new IndexStream(this.notes);
    this.notes.getPreviousIndexedData(stream.reindexFromPrevious.bind(stream));
  }
}
