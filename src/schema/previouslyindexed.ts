export default {
  query: {
    match_all: {}
  },
  size: 1,
  sort: [
    {
      UpdatedTime: {
        order: 'desc'
      }
    }
  ]
};
