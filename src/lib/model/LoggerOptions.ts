import { injectable } from 'inversify';
import 'reflect-metadata';
import winston from 'winston';

@injectable()
export class LoggerOptions implements winston.LoggerOptions {
  public exitOnError = false;
  public transports: winston.ConsoleTransportInstance[] = [
    new winston.transports.Console()
  ];
}
