import express from 'express';
import container from './inversify.config';

import { Registrable } from './interface/Registrable';
import { LoggerInstance } from 'winston';

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
