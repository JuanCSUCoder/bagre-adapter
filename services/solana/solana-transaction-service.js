"use strict";

import axios from "axios";
import { SALMON_API_URL } from "../../constants/environment";

const http = axios;

const find = async (network, address, id) => {
  const url = `${SALMON_API_URL}/v1/${network.id}/account/${address}/transactions/${id}`;

  const { data } = await http.get(url);

  return data;
};

const list = async (network, address, paging) => {
  const { nextPageToken, pageSize } = paging || {};

  const url = `${SALMON_API_URL}/v1/${network.id}/account/${address}/transactions`;

  const params = {};
  if (nextPageToken) {
    params.pageToken = nextPageToken;
  }
  if (pageSize) {
    params.pageSize = pageSize;
  }

  const { data } = await http.get(url, { params });

  return data;
};

module.exports = { find, list };
