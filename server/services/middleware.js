const _ = require("lodash");

const {
  findModel,
  isContentManagerUrl,
  isDeleteAllUrl,
  checkRequest,
} = require("./helper");

/**
 *
 * @param {string} models
 * @param {string} url
 * @returns {null| Object}
 */
const findTargetModel = async (models, url) => {
  let targetModel;

  targetModel = await isContentManagerUrl({ models, reqUrl: url });

  if (!targetModel) {
    targetModel = await isDeleteAllUrl({ models, reqUrl: url });
  }

  if (!targetModel) {
    targetModel = await findModel({ models, reqUrl: url });
  }

  return targetModel;
};

/**
 *
 * @param {string} url request url
 * @param {object} body request body
 * @param {object} targetModel model config in elasticsearch config file
 * @param {number|string} id record primary key
 */
const deleteData = async (targetModel, ids) => {
  if (_.isEmpty(ids)) return;
  await strapi.elastic.destroy(targetModel.model, { id_in: ids });
};

/**
 *
 * @param {object} body request body
 * @param {object} targetModel model config in elasticsearch config file
 * @param {*} id record primary key
 */
const createOrUpdateData = async (body, targetModel, id) => {
  let data = targetModel.fillByResponse ? body : null;

  if (!data) {
    const queryKey = `api::${targetModel.model}.${targetModel.content}`;
    data = await strapi.db
      .query(queryKey)
      .findOne({ where: { id, ...targetModel.conditions } });
  }

  if (!data || !id) return;

  await strapi.elastic.createOrUpdate(targetModel.model, { id, data });
};

const verifyBulkDelete = (url, method) => {
  const bulkDeleteUrlPattern =
    /\/content-manager\/(?:collection-types|single-types)\/(\w+)::([a-zA-Z-_]+).([a-zA-Z0-9_-]+)\/actions\/bulkDelete/;

  const result = bulkDeleteUrlPattern.test(url);

  return method === "POST" && !!result;
};

module.exports = {
  /**
   *
   * @param {Object} ctx request context
   */
  elasticsearchManager: async (ctx) => {
    const isValidReq = checkRequest(ctx);
    if (!isValidReq) return;

    const { url, method } = ctx.request;
    const { models } = strapi.config.elasticsearch;

    const targetModel = await findTargetModel(models, url);
    if (!targetModel) return;

    const pk = targetModel.pk || "id";

    const { id } =
      _.pick(ctx.body, pk) || _.pick(ctx.params, pk) || _.pick(ctx.query, pk);

    const shouldUpdate = method === "POST" || method === "PUT";
    const shouldDelete = method === "DELETE";
    const shouldBulkDelete = verifyBulkDelete(url, method);

    if (shouldBulkDelete) {
      await deleteData(targetModel, ctx.request.body?.ids || []);
    } else if (shouldDelete) {
      await deleteData(targetModel, [id]);
    } else if (shouldUpdate) {
      await createOrUpdateData(ctx.body, targetModel, id);
    }
  },
};
