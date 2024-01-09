import { LAMPORTS_PER_SOL, Connection, PublicKey } from "@solana/web3.js";
import {
  decorateBalanceList,
  decorateBalancePrices,
} from "../token-decorator";
import {
  getTokensByOwner,
  getTokenList,
} from "./solana-token-list-service";
import {
  SOL_DECIMALS,
  SOL_SYMBOL,
  SOL_NAME,
  SOL_LOGO,
  SOL_ADDRESS,
} from "../../constants/token-constants.js";
import { getLast24HoursChange } from "../common-balance-service";
import {
  getWalletTokensPrice,
} from "../dex/orca-whirpool-service";

export const getSolanaBalance = async (connection, publicKey) => {
  const balance = await connection.getBalance(publicKey);
  const uiAmount = balance / LAMPORTS_PER_SOL;
  return {
    mint: SOL_ADDRESS,
    owner: publicKey.toBase58(),
    amount: balance,
    decimals: SOL_DECIMALS,
    uiAmount: uiAmount,
    symbol: SOL_SYMBOL,
    name: SOL_NAME,
    logo: SOL_LOGO,
    address: SOL_ADDRESS,
  };
};

const getTokensBalance = async (connection: Connection, publicKey: PublicKey) => {
  const ownerTokens = await getTokensByOwner(connection, publicKey);
  const notEmptyTokens = ownerTokens.filter((t) => t.amount && t.amount > 0);
  const tokens = await getTokenList();
  return decorateBalanceList(notEmptyTokens, tokens);
};

export const getPrices = async (connection: Connection, publicKey: PublicKey) => {
  try {
    return await getWalletTokensPrice(connection, publicKey);
  } catch (e) {
    console.log("Could not get prices", e.message);
    return null;
  }
};

export const getBalance = async (connection: Connection, publicKey: PublicKey) => {
  const tokensBalance = await getTokensBalance(connection, publicKey);
  const solanaBalance = await getSolanaBalance(connection, publicKey);
  const prices = await getPrices(connection, publicKey);
  const balances = await decorateBalancePrices(
    [solanaBalance, ...tokensBalance],
    prices
  );
  if (prices) {
    const sortedBalances = balances.sort((a, b) => a.usdBalance < b.usdBalance);
    const usdTotal = balances.reduce(
      (currentValue, next) => (next.usdBalance || 0) + currentValue,
      0
    );
    const last24HoursChange = getLast24HoursChange(balances, usdTotal);
    return { usdTotal, last24HoursChange, items: sortedBalances };
  } else {
    return { items: balances };
  }
};