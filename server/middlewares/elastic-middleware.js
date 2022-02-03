const { elasticsearchManager } = require("../services");

module.exports = (options, { strapi }) => {
  return async (ctx, next) => {
    await next();

    elasticsearchManager(ctx);
  };
};
