import { injectable, inject } from 'inversify';
import express, { Request, Response } from 'express';
import 'reflect-metadata';
import { LoggerInstance } from 'winston';
import { Controller } from '../../interface/Controller';
import { Searchable } from '../../interface/Searchable';
import cookie from 'cookie';
import { Session } from '../../interface/Session';

@injectable()
export class SearchNote implements Controller {
  public logger: LoggerInstance;
  public notes: Searchable;
  public attachment: Searchable;
  public session: Session;

  constructor(
    @inject('Logger') logger: LoggerInstance,
    @inject('Leanote') notes: Searchable,
    @inject('Attachment') attachment: Searchable,
    @inject('LeanoteSession') session: Session
  ) {
    this.notes = notes;
    this.logger = logger;
    this.session = session;
    this.attachment = attachment;
  }

  public register(app: express.Application): void {
    app.post('/*', this.search.bind(this));
  }

  public async search(req: Request, res: Response): Promise<void> {
    const cookies = cookie.parse(req.headers.cookie || '');
    if (typeof cookies.LEANOTE_SESSION == 'undefined') {
      res.statusCode = 401;
      res.send([]);
      return;
    }

    const valid = await this.session.isSessionValid(cookies);
    if (!valid) {
      res.statusCode = 401;
      res.send([]);
      return;
    }
    if (typeof req.body == 'undefined' || typeof req.body.key == 'undefined') {
      res.statusCode = 400;
      res.send([]);
      return;
    }
    this.notes.search(
      { UserId: this.session.UserId, Match: req.body.key },
      (err, results) => {
        const duplicates: string[] = [];
        const found: unknown[] = [];
        /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
        results.hits.hits.map(function (notemodel: any) {
          if (duplicates.indexOf(notemodel._id) != -1) {
            return false;
          }
          delete notemodel._source['Content'];
          notemodel._source.NoteId = notemodel._id;
          duplicates.push(notemodel._id);
          found.push(notemodel._source);
        });
        this.attachment.search(
          { UserId: this.session.UserId, Match: req.body.key },
          (err, results) => {
            /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
            results.hits.hits.map((notemodel: any) => {
              if (duplicates.indexOf(notemodel._source['NoteId']) != -1) {
                return false;
              }
              found.push(this.convertAsNote(notemodel._source));
            });
            res.send(found);
          }
        );
      }
    );
  }

  /* eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/explicit-module-boundary-types */
  convertAsNote(attach: any): any {
    return {
      NoteId: attach['NoteId'],
      UserId: attach['UploadUserId'],
      NotebookId: '',
      Title: attach['Title'],
      Desc: attach['Type'],
      ImgSrc: '',
      IsTrash: false,
      UrlTitle: attach['Name'],
      HasSelfDefined: false,
      IsMarkdown: false,
      AttachNum: 1,
      CreatedTime: attach['CreatedTime'],
      UpdatedTime: attach['CreatedTime'],
      PublicTime: attach['CreatedTime'],
      UpdatedUserId: attach['UploadUserId'],
      Usn: 1,
      IsDeleted: false
    };
  }
}
