'use strict';

const networks = require('./networks.json');

const getNetworks = () => {
  /* if (promise) {
    return promise;
  }

  promise = axios.get(`${SALMON_API_URL}/v1/networks`).then(({ data }) => data);

  try {
    return await promise;
  } catch (error) {
    promise = null;
    throw error;
  } */

  return networks;
};

const getNetwork = async (id) => {
  return networks?.find((network) => network.id === id);
};

module.exports = { getNetwork, getNetworks };
