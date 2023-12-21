"use strict";

/* const axios = require('axios').default;
const { SALMON_API_URL } = require('../constants/environment'); */

const getMetadata = async (url) => {
  /* const { data } = await axios.get(`${SALMON_API_URL}/v1/dapp/metadata`, {
    params: { url },
  }); */
  return {
    error: "client_error",
    error_description: "Feature disabled",
  };
};

module.exports = { getMetadata };
