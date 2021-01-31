import { Cli } from '../../interface/Cli';
import { Registrable } from '../../interface/Registrable';
import { Controller } from '../../interface/Controller';
import { Handler } from '../../interface/Handler';
import { LoggerInstance } from 'winston';
import { injectable, inject, multiInject } from 'inversify';
import express from 'express';
import 'reflect-metadata';

@injectable()
export class Serve implements Cli {
  public controllers: Controller[];
  public handlers: Handler[];
  public logger: LoggerInstance;

  constructor(
    @multiInject('Controller') controllers: Controller[],
    @multiInject('Handler') handlers: Handler[],
    @inject('Logger') logger: LoggerInstance
  ) {
    this.controllers = controllers;
    this.handlers = handlers;
    this.logger = logger;
  }

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

    this.handlers.forEach((plugin: Registrable) => plugin.register(app));
    this.controllers.forEach((plugin: Registrable) => plugin.register(app));

    const port = process.env.BACKEND_PORT || 3000;
    app.listen(port, () => {
      this.logger.info(`Example app listening on port ${port}`);
    });
  }
}
