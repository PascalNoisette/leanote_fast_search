import { Cli } from '../../interface/Cli';
import { LoggerInstance } from 'winston';
import { injectable, inject } from 'inversify';
import 'reflect-metadata';
import { Notes } from '../../interface/Notes';

@injectable()
export class Install implements Cli {
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
    return 'install';
  }
  getDescription(): string {
    return 'Create an empty optimized elasticsearch index for notes';
  }
  /* eslint-disable  @typescript-eslint/no-explicit-any */
  /* eslint-disable  @typescript-eslint/no-unused-vars */
  action(...args: any[]): void | Promise<void> {
    this.notes.createIndex(() => {
      this.logger.info('done');
    });
  }
}
