module.exports = [
  {
    method: "POST",
    path: "/migrate-model",
    handler: "elasticsearch.migrateModel",
    config: {
      policies: [],
    },
  },
  {
    method: "POST",
    path: "/create-index",
    handler: "elasticsearch.createIndex",
    config: {
      policies: [],
    },
  },
  {
    method: "POST",
    path: "/delete-index",
    handler: "elasticsearch.deleteIndex",
    config: {
      policies: [],
    },
  },
  {
    method: "GET",
    path: "/models",
    handler: "elasticsearch.fetchModels",
    config: {
      policies: [],
    },
  },
  {
    method: "GET",
    path: "/model",
    handler: "elasticsearch.fetchModel",
    config: {
      policies: [],
    },
  },
];
