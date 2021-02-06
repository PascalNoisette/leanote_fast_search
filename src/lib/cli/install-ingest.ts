import { Cli } from '../../interface/Cli';
import { LoggerInstance } from 'winston';
import { injectable, inject } from 'inversify';
import 'reflect-metadata';
import { Installable } from '../../interface/Installable';

@injectable()
export class Install implements Cli {
  public logger: LoggerInstance;
  public notes: Installable;

  constructor(
    @inject('Logger') logger: LoggerInstance,
    @inject('Attachment') notes: Installable
  ) {
    this.notes = notes;
    this.logger = logger;
  }

  getCommand(): string {
    return 'install-ingest';
  }
  getDescription(): string {
    return 'Create an empty optimized elasticsearch index for notes';
  }

  /* eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
  action(...args: any[]): void | Promise<void> {
    this.notes.createIndex(() => {
      this.logger.info('done');
    });
  }
}
