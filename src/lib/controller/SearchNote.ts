import { injectable, inject } from 'inversify';
import express from 'express';
import 'reflect-metadata';
import { LoggerInstance } from 'winston';
import { Controller } from '../../interface/Controller';
import { Notes } from '../../interface/Notes';
import bodyParser from 'body-parser';
import cookie from 'cookie';

@injectable()
export class SearchNote implements Controller {
  public logger: LoggerInstance;
  public notes: Notes;

  constructor(
    @inject('Logger') logger: LoggerInstance,
    @inject('Notes') notes: Notes
  ) {
    this.notes = notes;
    this.logger = logger;
  }

  public register(app: express.Application): void {
    app.use(bodyParser.urlencoded({ extended: true }));
    app.post('/*', async (req, res) => {
      const cookies = cookie.parse(req.headers.cookie || '');
      if (typeof cookies.LEANOTE_SESSION == 'undefined') {
        res.statusCode = 401;
        return res.send([]);
      }
      const session = cookies.LEANOTE_SESSION.split('\x00')
        .filter((x: string) => x && x.indexOf(':') + 1)
        /* eslint-disable  @typescript-eslint/no-explicit-any */
        .reduce((res: any, x: string) => {
          res[x.split(':')[0]] = x.split(':')[1];
          return res;
        }, {});

      const valid = await this.notes.isSessionValid(session);
      if (!valid) {
        res.statusCode = 401;
        return res.send([]);
      }
      if (
        typeof req.body == 'undefined' ||
        typeof req.body.key == 'undefined'
      ) {
        res.statusCode = 400;
        return res.send([]);
      }
      this.notes.search(
        { UserId: session.UserId, Match: req.body.key },
        function (err, results) {
          const found = results.hits.hits.map(function (notemodel: any) {
            delete notemodel._source['Content'];
            notemodel._source.NoteId = notemodel._id;
            return notemodel._source;
          });
          res.send(found);
        }
      );
    });
  }
}
