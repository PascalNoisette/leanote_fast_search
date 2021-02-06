import { SearchQuery } from '../interface/SearchQuery';

/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
export default function (opts: SearchQuery): any {
  return {
    query: {
      bool: {
        must: [
          {
            term: {
              UserId: opts.UserId
            }
          },
          {
            bool: {
              should: [
                {
                  match: {
                    Content: opts.Match
                  }
                },
                {
                  match: {
                    Title: opts.Match
                  }
                }
              ],
              minimum_should_match: '1'
            }
          }
        ]
      }
    }
  };
}
