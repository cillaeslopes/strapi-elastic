[![No Maintenance Intended](http://unmaintained.tech/badge.svg)](http://unmaintained.tech/)

<p align="center">
  <a href="https://github.com/cillaeslopes/strapi-elastic" rel="noopener">
 <img src="https://i.ibb.co/zG6Nj3g/Untitled-1.jpg" alt="Project logo" width=800></a>
  <br/>
  <br/>
</p>

<hr>
<h4 align="center">
  <b>⚠️ WARNING: This repository is no longer being maintained </b>
</h4>
<hr >
<h4 align="center">
  tested on strapi v4.x

  latest test: v4.0.6
</h4>
<bt/>
<h4 align="center">
  This plugin has been tested on postgres
</h4>
<hr/>
<br/>

<p align="center"> 
  The purpose of developing this plugin is to use the elastic search engine in Strapi to help the application development process
</p>

<p align="center">
  This plugin has been develop from archived repo 
  <a href="https://github.com/marefati110/strapi-plugin-elastic" rel="noopener">strapi-plugin-elastic</a> Developed by <a href="https://github.com/marefati110" rel="noopener">marefati110</a>. The repository has been developed for strapi v3 and we have addapted it for v4
</p>

## 📝 Table of Contents

- [Prerequisites](#prerequisites)
- [Getting Started](#getting_started)
- [How plugin work](#how_work)
- [How plugin work](#strapi_setup)
- [Usage](#usage)
  - [scenario 1](#scenario-1)
  - [scenario 2](#scenario-2)
  - [scenario 3](#scenario-3)
  - [scenario 4](#scenario-4)
- [Functions](#functions)
- [Api](#api)
- [Example](#example)
- [Logging](#logging)
- [Authors](#authors)

## Prerequisites <a name="prerequisites"></a>

<hr />

Install Elasticsearch - https://www.elastic.co/downloads/elasticsearch

Install plugin

- Go to the project path

  - `cd PROJECT/src/plugins`

- Clone the project

  - `git submodule add https://github.com/cillaeslopes/strapi-elastic ./elastic`

- Install dependencies

  - `yarn install`

# 🏁 Getting Started <a name = "getting_started"></a>

## Strapi setup <a name="strapi_setup"></a>

In order to activate plugin, you need to add the following settings to `PROJECT/config/plugins.js`

```js
module.exports = ({ env }) => ({
  ...
  elastic: {
    enabled: true,
    resolve: "./src/plugins/elastic",
  },
  ...
});
```

And you will need to activate the plugin middleware in `PROJECT/config/middlewares.js`

```js
module.exports = [
  ...
  "plugin::elastic.elasticMiddleware",
  ...
];

```

## How plugin works? <a name="how_work"></a>

After the first run of the project, it creates a config file at `PROJECT/config/elasticsearch.js`

**config file should look like below:**

```js
module.exports = ({ env }) => ({
  connection: {
    // https://www.elastic.co/guide/en/elasticsearch/client/javascript-api/current/au th-reference.html
    node: env('ELASTICSEARCH_HOST', 'http://127.0.0.1:9200'),
    auth: {
      username: env('ELASTICSEARCH_USERNAME'),
      password: env('ELASTICSEARCH_PASSWORD'),
    },
  },
  settings: {
    version: 1,
    validStatus: [200, 201], validMethod: ['PUT', 'POST', 'DELETE'], fillByResponse: false, importLimit: 3000, index_prefix: '', index_postfix: '',
    removeExistIndexForMigration: false,
  },
  models: [
    {
      model: 'article',
      pk: 'id', 
      plugin: null, 
      enable: false, 
      index: 'article', 
      relations: [], 
      conditions: {}, 
      fillByResponse: true, 
      migration: false, 
      supportAdminPanel: true, 
      supportDefaultApis: true, 
      urls: [],
    }
  ]
})
```

By default, syncing occurs in two ways

The answer of any request that makes a change in the model is stored in Elasticsearch this is especially true for the Strap panel admin

Or in response to any request, search for the pk of model the model in which the change was made, and after retrieving the information from the database, stores it in the elasticsearch

In the following, solutions are prepared for more complex scenarios.

After installing the plugin and running it, it creates an config file in the `PROJECT/config/elasticsearch.js`

In the connections section, the settings related to the connection to the elasticsearch are listed, there is also a help link

In the setting section, there are the initial settings related to the elastic plugin.

In the models section for all models in the `Project/src/api/**` path there is a model being built and you can change the initial settings

<hr/>

# 🎈 Usage <a name="usage"></a>

### Scenario 1 <a name="scenario-1"></a>

For example, we want to make changes to the article model and then see the changes in the Elasticsearch.

The first step is to activate in the settings related to this model

After saving and restarting the plugin, it creates an index for this model in the elasticsearch.

Note that the name selected for the index can be changed in the settings of the model.

At the end of the settings should be as follows

```js
{
  model: "article",
  content: "article",
  index: "articles",
  enabled: true,
  migration: true,
  pk: "id",
  relations: [],
  conditions: {},
  fillByResponse: false,
  supportAdminPanel: true,
  urls: ["/articles"],
}
```

Now in the strapi admin panel, by making an creating , deleting or updating , you can see the changes in Elasticsearch.

### Scenario 2 <a name="scenario-2"></a>

In this scenario, we want to make a change in the model using the rest api and see the result in Elasticsearch.

After sending a post request to `/articles`, changes will be applied and we will receive a response to this

```json
{
  "id": 1,
  "title": "title",
  "content": "content"
}
```

and model config should change to

```js
{
  model: "article",
  content: "article",
  index: "articles",
  enabled: true,
  migration: true,
  pk: "id",
  relations: [],
  conditions: {},
  fillByResponse: true, // changed
  supportAdminPanel: true,
  urls: ["/articles"],
},
```

If the `fillByResponse` settings are enabled for the model, the same data will be stored in Elasticsearch, otherwise the data will be retrieved from the database using pk and stored in Elasticsearch.

# Functions <a name="functions"></a>

| Command                         | Description                    |           example            |
| :------------------------------ | :----------------------------- | :--------------------------: |
| `strapi.elastic`                | official elasticsearch package |     [example](#elastic)      |
| `strapi.elastic.createOrUpdate` | Create to update data          | [example](#create_or_update) |
| `strapi.elastic.findOne`        | Find specific data by id       |     [example](#findOne)      |
| `strapi.elastic.destroy`        | delete data                    |     [example](#destroy)      |
| `strapi.elastic.migrateById`    | migrate data                   |   [example](#migrateById)    |
| `strapi.elastic.migrateModel`   | migrate specific data          |   [example](#migrateModel)   |
| `strapi.elastic.models`         | migrate all enabled models     |      [example](#models)      |
| `strapi.log`                    | log data to elasticsearch      |     [example](#logging)      |

# Api <a name="api"></a>

| Url            | Method | Description            | body                   |
| :------------- | :----: | :--------------------- | ---------------------- |
| /migrate-Model |  POST  | Migrate specific model | `{model:'MODEL_NAME'}` |

# Examples <a name="example"></a>

### elastic

For use official Elasticsearch package we can use `strapi.elastic`, and can access builtin function
[elasticsearch reference api](https://www.elastic.co/guide/en/elasticsearch/client/javascript-api/current/api-reference.html)

```js
const count = strapi.elastic.count({ index: "article" }); // https://www.elastic.co/guide/en/elasticsearch/client/javascript-api/current/api-reference.html#_count

const article = strapi.elastic.get({ index: "article", id: 1 }); // https://www.elastic.co/guide/en/elasticsearch/client/javascript-api/current/api-reference.html#_get
```

### CreateOrUpdate <a name="create_or_update"></a>

```js
const result = strapi.elastic.createOrUpdate("article", {
  id: 1,
  data: { title: "title", content: "content" },
});
```

### findOne <a name="findOne"></a>

```js
const result = strapi.elastic.findOne("article", { id: 1 });
```

### destroy <a name="destroy"></a>

```js
const result_one = strapi.elastic.destroy("article", { id: 1 });
// or
const result_two = strapi.elastic.destroy("article", { id_in: [1, 2, 3] });
```

### migrateById <a name="migrateById"></a>

```js
const result_one = strapi.elastic.migrateById("article", { id: 1 });

const result_two = strapi.elastic.migrateById("article", { id_in: [1, 2, 3] });
```

### migrateModel <a name="migrateModel"></a>

```js
const result = strapi.elastic.migrateModel("article", {
  conditions, // optional
});
```

# Logging <a name="logging"></a>

strapi use Pino to logging but can store logs or send it to elasticsearch

at now wen can send logs to elasticsearch by `strapi.elastic.log` there is no difference between `strapi.elastic.log` with `strapi.log` to call functions.

```js
strapi.log.info("log message in console");
strapi.elastic.log.info("log message console and store it to elasticsearch");

strapi.log.debug("log message");
strapi.elastic.log.debug("log message console and store it to elasticsearch");

strapi.log.warn("log message");
strapi.elastic.log.warn("log message console and store it to elasticsearch");

strapi.log.error("log message");
strapi.elastic.log.error("log message console and store it to elasticsearch");

strapi.log.fatal("log message");
strapi.elastic.log.fatal("log message console and store it to elasticsearch");
```

Also there is some more options

```js
// just send log to elastic and avoid to display in console
strapi.elastic.log.info("some message", { setting: { show: false } });

// just display  relations, // optional ni console and avoid to save it to elastic search
strapi.elastic.log.info("some message", { setting: { saveToElastic: false } });

// send more data to elasticsearch
const logData = { description: "description" };
strapi.elastic.log.info("some message", logData);
```

**By default `strapi.log` send some metaData to elasticsearch such as `free memory`, `cpu load avg`, `current time`, `hostname` ,...**

### ✍️ Authors <a name = ""></a>

- [@cillaeslopes](https://github.com/cillaeslopes)
- [@nayara](https://github.com/nayara)
