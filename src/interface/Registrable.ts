import * as express from 'express';

export interface Registrable {
  register(app: express.Application): void;
}
