'use strict';

const { v4: uuid } = require('uuid');
const Account = require('../services/Account');
const { createMany: createNetworkAccounts } = require('./network-account-factory');
const { generateMnemonic } = require('../services/seed-service');
const { getNetworks } = require('../services/network-service');
const { getSwitches } = require('../services/switch-service');
const { getRandomAvatar } = require('../services/avatar-service');

const create = async ({
  id = uuid(),
  name = '',
  avatar = getRandomAvatar(),
  mnemonic = generateMnemonic(),
  pathIndexes = {},
}, rpcUrl = "") => {
  const switches = await getSwitches();
  const networks = await getNetworks();

  const networksAccounts = {};

  const enabledNetworks = networks.filter((network) => switches[network.id]?.enable);

  await Promise.all(
    enabledNetworks.map(async (network) => {
      const indexes = pathIndexes[network.id] || [0];
      
      // Updates Network RPC/Node URL with provided configuration
      network.config.nodeUrl = rpcUrl;

      networksAccounts[network.id] = await createNetworkAccounts({ network, mnemonic, indexes });
      return networksAccounts[network.id];
    })
  );

  return new Account(id, name, avatar, mnemonic, networksAccounts);
};

const createMany = async (accounts, rpcUrl = "") => {
  return Promise.all(accounts.map((account) => create(account, rpcUrl)));
};

module.exports = { create, createMany };
