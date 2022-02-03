const { Client } = require("@elastic/elasticsearch");

const {
  helper: { generateMainConfig, initialStrapi },
} = require("./services");
const {
  logger,
  migrateModel,
  find,
  findOne,
  createOrUpdate,
  destroy,
  migrateById,
} = require("./services");

const registerPermissionActions = () => {
  const { actionProvider } = strapi.admin.services.permission;
  actionProvider.register({
    section: "plugins",
    displayName: "Read",
    uid: "read",
    pluginName: "elastic",
  });
};

module.exports = async () => {
  /**
   * generate elasticsearch config file
   */
  generateMainConfig();

  /**
   * initialize strapi.elastic object
   */
  if (strapi.config.elasticsearch) {
    const { connection } = strapi.config.elasticsearch;

    const client = new Client(connection);

    strapi.elastic = client;

    initialStrapi();

    const functions = {
      findOne,
      find,
      destroy,
      createOrUpdate,
      migrateModel,
      transferModelData: migrateModel,
      migrateById,
      transferModelDataById: migrateById,
      log: logger,
    };

    Object.assign(strapi.elastic, functions);

    strapi.log.info("The elastic plugin is running");
  }

  registerPermissionActions();
};
