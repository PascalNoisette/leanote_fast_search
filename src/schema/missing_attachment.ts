export default {
  query: {
    match_all: {}
  },
  size: 1,
  sort: [
    {
      CreatedTime: {
        order: 'desc'
      }
    }
  ]
};
