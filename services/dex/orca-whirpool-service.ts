import {
  ExecutableRoute,
  ORCA_SUPPORTED_TICK_SPACINGS,
  ORCA_WHIRLPOOLS_CONFIG,
  ORCA_WHIRLPOOL_PROGRAM_ID,
  PREFER_CACHE,
  PriceCalculationData,
  PriceMap,
  PriceModule,
  PriceModuleUtils,
  WhirlpoolAccountFetcherInterface,
  WhirlpoolContext,
  WhirlpoolData,
  buildWhirlpoolClient,
  getAllWhirlpoolAccountsForConfig,
} from "@orca-so/whirlpools-sdk";
import { BN, Address } from "@coral-xyz/anchor";
import { PublicKey, Connection } from "@solana/web3.js";
import Decimal from "decimal.js";
import { TOKEN_2022_PROGRAM_ID, TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { getWalletMintsAccounts } from "../solana/solana-token-mint-service";


let availableData: Partial<PriceCalculationData> = {};

async function tryUpdatingAvailableData(fetcher: WhirlpoolAccountFetcherInterface, mints: Address[]) {
  availableData.poolMap = availableData.poolMap
    ? availableData.poolMap
    : await PriceModuleUtils.fetchPoolDataFromMints(fetcher, mints);
  availableData.decimalsMap = availableData.decimalsMap
    ? availableData.decimalsMap
    : await PriceModuleUtils.fetchDecimalsForMints(fetcher, mints, PREFER_CACHE);
  availableData.tickArrayMap = availableData.tickArrayMap
    ? availableData.tickArrayMap
    : await PriceModuleUtils.fetchTickArraysForPools(fetcher, availableData.poolMap)
}

/**
 *
 * @param {Connection} connection - The RPC connection handler from solana SDK
 * @param {PublicKey} publicKey - The public key of the wallet account
 * @param {Address} tokenMint - The public key address of the token mint account of the requested token
 */
export async function getTokensPriceMap(
  connection: Connection,
  publicKey: PublicKey,
  tokensMints: Address[]
): Promise<PriceMap | null> {
  const ctx = WhirlpoolContext.from(
    connection,
    {
      publicKey: publicKey,
      signAllTransactions: async () => {
        return [];
      },
      signTransaction: async () => {
        throw "error";
      },
    },
    ORCA_WHIRLPOOL_PROGRAM_ID
  );

  // Declares the mint account address of the USDC Stablecoin
  const USDC_MINT_KEY = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v";
  const USDC_MINT = new PublicKey(USDC_MINT_KEY);

  const mints = tokensMints.concat([USDC_MINT]);

  await tryUpdatingAvailableData(ctx.fetcher, mints);

  const prices = await PriceModule.fetchTokenPricesByMints(
    ctx.fetcher,
    mints,
    {
      quoteTokens: [
        USDC_MINT,
      ],
      programId: ORCA_WHIRLPOOL_PROGRAM_ID,
      whirlpoolsConfig: ORCA_WHIRLPOOLS_CONFIG,
      tickSpacings: ORCA_SUPPORTED_TICK_SPACINGS,
    },
    undefined,
    undefined,
    availableData
  );
  return prices
}

type Prices = {
  mint: string;
  usdPrice: Decimal
}[];

export async function getWalletTokensPrice(
  connection: Connection,
  publicKey: PublicKey
): Promise<Prices | null> {
  const addresses = await getWalletMintsAccounts(connection, publicKey);

  console.log(`Mint Addresses: ${JSON.stringify(addresses)}`);

  const priceMap = await getTokensPriceMap(
    connection,
    publicKey,
    addresses,
  );

  return addresses.map(mint => ({
    mint: mint,
    usdPrice: priceMap[mint],
  }))
}
