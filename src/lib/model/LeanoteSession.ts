import mongoose from 'mongoose';
import { injectable, inject } from 'inversify';
import { Mongo } from './Mongo';
import { Session } from '../../interface/Session';
import SessionSchema from '../../schema/sessions';

@injectable()
export class LeanoteSession implements Session {
  public UserId = '';
  public _ID = '';
  public connection: Mongo;
  public Sessions: mongoose.Schema<mongoose.Document>;
  public SessionsModel: mongoose.Model<mongoose.Document>;

  constructor(@inject('Mongo') connection: Mongo) {
    this.connection = connection; //unsed but must be loaded by its constructor so inject anyway
    this.Sessions = new mongoose.Schema(SessionSchema);
    this.SessionsModel = mongoose.model('Session', this.Sessions);
  }

  async isSessionValid(cookies: { [key: string]: string }): Promise<boolean> {
    cookies.LEANOTE_SESSION.split('\x00')
      .filter((x: string) => x && x.indexOf(':') + 1)
      /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
      .reduce((session: any, x: string) => {
        session[x.split(':')[0]] = x.split(':')[1];
        return session;
      }, this);

    if (typeof this.UserId == 'undefined') {
      return false;
    }
    if (typeof this._ID == 'undefined') {
      return false;
    }
    try {
      const valid = await this.SessionsModel.findOne({
        SessionId: this._ID
      });
      return valid;
    } catch (err) {
      return false;
    }
    return true;
  }
}
