// https://www.elastic.co/guide/en/elasticsearch/reference/current/analysis-lang-analyzer.html#french-analyzer
// @TODO it is good, but apparently two plugins ICU could be even better for chinese and french https://jolicode.com/blog/construire-un-bon-analyzer-francais-pour-elasticsearch#tldr
export default {
  analysis: {
    filter: {
      french_elision: {
        type: 'elision',
        articles_case: true,
        articles: [
          'l',
          'm',
          't',
          'qu',
          'n',
          's',
          'j',
          'd',
          'c',
          'jusqu',
          'quoiqu',
          'lorsqu',
          'puisqu'
        ]
      },
      french_stop: {
        type: 'stop',
        stopwords: '_french_'
      },
      french_keywords: {
        type: 'keyword_marker',
        keywords: ['Example']
      },
      french_stemmer: {
        type: 'stemmer',
        language: 'light_french'
      }
    },
    analyzer: {
      rebuilt_french: {
        tokenizer: 'standard',
        filter: [
          'french_elision',
          'lowercase',
          'french_stop',
          'french_keywords',
          'french_stemmer',
          'asciifolding'
        ]
      }
    }
  }
};
