const { getDataConnect, validateArgs } = require('firebase/data-connect');

const connectorConfig = {
  connector: 'default',
  service: 'dashcode-nextjs-starter-kit',
  location: 'us-central1'
};
exports.connectorConfig = connectorConfig;

