import { injectable } from 'inversify';
import express from 'express';
import bodyParser from 'body-parser';
import 'reflect-metadata';
import { Handler } from '../interface/Handler';

@injectable()
export class XformUrlEncoded implements Handler {
  public register(app: express.Application): void {
    app.use(bodyParser.urlencoded({ extended: true }));
  }
}
