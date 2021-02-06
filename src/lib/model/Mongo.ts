import mongoose from 'mongoose';
import { injectable } from 'inversify';

@injectable()
export class Mongo {
  public es_host = process.env.ES_HOST || 'https://admin:admin@127.0.0.1';

  public mongo_host =
    process.env.MONGO_HOST || 'mongodb://127.0.0.1:27017/leanote';

  public bulk = {
    size: 100, // preferred number of docs to bulk index
    delay: 100, //milliseconds to wait for enough docs to meet size constraint
    batch: 50
  };

  public mongoosasticoption = {
    protocol: this.es_host.split('://')[0],
    host: this.es_host.split('://')[1].split('@')[1],
    auth: this.es_host.split('://')[1].split('@')[0],
    bulk: this.bulk
  };

  constructor() {
    mongoose.connect(this.mongo_host, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
  }
}
