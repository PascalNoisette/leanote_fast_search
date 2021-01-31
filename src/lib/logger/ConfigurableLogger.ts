import { injectable, inject, decorate } from 'inversify';
import { Logger, LoggerOptions } from 'winston';
import 'reflect-metadata';

decorate(injectable(), Logger);

@injectable()
export class ConfiguredLogger extends Logger {
  constructor(@inject('LoggerOptions') option?: LoggerOptions) {
    super(option);
  }
}
