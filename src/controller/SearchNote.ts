import { injectable } from 'inversify';
import express from 'express';
import 'reflect-metadata';
import { Controller } from '../interface/Controller';

@injectable()
export class SearchNote implements Controller {
  public register(app: express.Application): void {
    app.post('/*', async (req, res) => {
      res.send('Hello world');
    });
  }
}
