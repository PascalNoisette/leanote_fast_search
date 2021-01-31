import container from '../inversify.config';
import { Program } from '../interface/Program';
import { Registrable } from '../interface/Registrable';
import { LoggerInstance } from 'winston';
import { injectable } from 'inversify';
import express from 'express';
import 'reflect-metadata';

@injectable()
export class Serve implements Program {
  getCommand(): string {
    return 'serve';
  }
  getDescription(): string {
    return 'Launch http service';
  }
  /* eslint-disable  @typescript-eslint/no-explicit-any */
  /* eslint-disable  @typescript-eslint/no-unused-vars */
  action(...args: any[]): void | Promise<void> {
    const app: express.Application = express();

    container
      .getAll<Registrable>('Registrable')
      .forEach((plugin: Registrable) => plugin.register(app));

    const port = process.env.BACKEND_PORT || 3000;
    app.listen(port, function () {
      container
        .get<LoggerInstance>('Logger')
        .info(`Example app listening on port ${port}`);
    });
  }
}
