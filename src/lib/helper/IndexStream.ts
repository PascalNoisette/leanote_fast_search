import { Indexable } from '../../interface/Indexable';
import { SearchQuery } from '../../interface/SearchQuery';

export class IndexStream {
  public model: Indexable;

  constructor(model: Indexable) {
    this.model = model;
  }

  reindexFromPrevious(cond: SearchQuery): void {
    const stream = this.model.getAllNotesIterator(cond);
    let counter = 0;
    let total = 0;

    stream.on('data', (doc) => {
      stream.pause();
      counter++;
      this.model.reindexOne(doc, function onIndex(indexErr: boolean) {
        counter--;
        if (indexErr) {
          console.log(indexErr);
        } else {
          total++;
        }
        stream.resume();
      });
    });

    stream.on('close', () => {
      if (counter === 0) {
        this.model.close();
        console.log('indexed ' + total + ' documents!');
      } else {
        const closeInterval = setInterval(() => {
          if (counter === 0) {
            clearInterval(closeInterval);
            this.model.close();
            console.log('indexed ' + total + ' documents!');
          }
        }, 2000);
      }
    });

    stream.on('error', console.log);
  }
}
