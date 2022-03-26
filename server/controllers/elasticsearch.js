const _ = require("lodash");
const {
  helper: { findMappingConfig },
} = require("../services");

module.exports = {
  fetchModels: (ctx) => {
    const { models } = strapi.config.elasticsearch;

    const enabledModels = models.filter((model) => model.enabled);

    const sortedEnabledModels = _.orderBy(enabledModels, ["model"], ["asc"]);

    const disabledModels = models.filter((model) => !model.enabled);

    const sortedDisabledModels = _.orderBy(disabledModels, ["model"], ["asc"]);

    // there is a bug here
    // models are not sorted
    const allModels = [...sortedEnabledModels, ...sortedDisabledModels];

    const response = _.map(
      allModels,
      _.partialRight(_.pick, [
        "model",
        "content",
        "plugin",
        "index",
        "migration",
        "pk",
        "enabled",
      ])
    );

    return ctx.send(response);
  },
  fetchModel: async (ctx) => {
    const { index, _start, _limit } = ctx.query;
    let data, count, map;
    let status = {};

    try {
      count = await strapi.elastic.count({ index });
      map = await strapi.elastic.indices.getMapping({ index });
      status = {
        deleted: false,
        created: true,
      };
    } catch (e) {
      status = {
        deleted: true,
        created: false,
      };
    }

    status.hasMapping = status.created && !_.isEmpty(map[index]);

    try {
      data = await strapi.elastic.find(index, _limit, _start);
    } catch (e) {
      console.log(e);
      return ctx.send({ data: null, total: 0, status });
    }

    return ctx.send({
      data: sanitizeHits(data.hits.hits),
      total: count && count.body && count.body.count,
      status,
    });
  },
  migrateModel: async (ctx) => {
    const { model } = ctx.request.body;

    await strapi.elastic.migrateModel(model);
    return ctx.send({ success: true });
  },
  createIndex: async (ctx) => {
    const { model } = ctx.request.body;

    const { models } = strapi.config.elasticsearch;
    const targetModel = models.find((item) => item.model === model);

    const mapping = await findMappingConfig({ targetModel });

    const indexConfig = strapi.elastic.indicesMapping[targetModel.model];

    const options = {
      index: targetModel.index,
    };

    if (mapping || indexConfig) {
      options.body = mapping ? mapping[targetModel.index] : indexConfig;
    }

    await strapi.elastic.indices.create(options);

    return ctx.send({ success: true });
  },
  deleteIndex: async (ctx) => {
    const { model } = ctx.request.body;

    const { models } = strapi.config.elasticsearch;
    const targetModel = models.find((item) => item.model === model);

    try {
      await strapi.elastic.indices.delete({
        index: targetModel.index,
      });
      return ctx.send({ success: true });
    } catch (e) {
      return ctx.throw(500);
    }
  },
};

function sanitizeHits(hits) {
  const data = [];
  for (const item of hits) {
    const source = item["_source"];
    if (!_.isEmpty(source)) {
      const sourceKeys = Object.keys(source);

      for (const key of sourceKeys) {
        if (_.isArray(source[key])) {
          source[key] = "[Array]";
        } else if (_.isObject(source[key])) {
          source[key] = "[Object]";
        }
      }
      data.push(source);
    }
  }

  return data;
}
