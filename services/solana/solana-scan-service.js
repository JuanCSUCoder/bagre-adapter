"use strict";

const http = require('axios/dist/browser/axios.cjs'); // browser commonJS bundle
import { SALMON_API_URL } from "../../constants/environment";

const scanTransactions = async (
  network,
  userAccount,
  transactions,
  { origin, language }
) => {
  const url = `${SALMON_API_URL}/v1/${network.id}/scan/transactions`;

  const config = {
    params: Object.assign({}, language && { language }),
  };

  const payload = {
    transactions,
    userAccount,
    metadata: Object.assign({}, origin && { origin }),
  };

  const { data } = await http.post(url, payload, config);

  return data;
};

module.exports = { scanTransactions };
