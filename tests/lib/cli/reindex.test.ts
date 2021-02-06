import { expect } from 'chai';
import { IndexStream } from '../../../src/lib/helper/IndexStream';
import { Indexable } from '../../../src/interface/Indexable';
import { stubInterface } from 'ts-sinon';
import { SearchQuery } from '../../../src/interface/SearchQuery';

/* eslint-disable  @typescript-eslint/no-var-requires */
const resumer = require('resumer');

describe('stream', function () {
  it('iterate', async function () {
    const stream = resumer();
    const notes = stubInterface<Indexable>({
      getAllNotesIterator: stream
    });
    const input = ['1', '2', '3'];
    const output: number[] = [];
    notes.reindexOne.callsFake(
      /* eslint-disable  @typescript-eslint/no-explicit-any */
      (doc: any, callback: (indexErr: boolean) => void) => {
        output.push(doc);
        callback(false);
      }
    );
    new IndexStream(notes).reindexFromPrevious(stubInterface<SearchQuery>());
    input.forEach(stream.queue);
    await new Promise<void>((resolve) => {
      stream.on('close', () => {
        resolve();
      });
      stream.end();
    });
    expect(input).to.have.all.members(output);
  });
});
