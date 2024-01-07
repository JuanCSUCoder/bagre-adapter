import {
  ExecutableRoute,
  ORCA_SUPPORTED_TICK_SPACINGS,
  ORCA_WHIRLPOOLS_CONFIG,
  ORCA_WHIRLPOOL_PROGRAM_ID,
  PriceModule,
  WhirlpoolContext,
  WhirlpoolData,
  buildWhirlpoolClient,
  getAllWhirlpoolAccountsForConfig,
} from "@orca-so/whirlpools-sdk";
import { BN, Address } from "@coral-xyz/anchor";
import { PublicKey, Connection } from "@solana/web3.js";
import Decimal from "decimal.js";


let poolsAccounts: ReadonlyMap<string, WhirlpoolData> | null = null;

/**
 *
 * @param {Connection} connection - The RPC connection handler from solana SDK
 * @param {PublicKey} publicKey - The public key of the wallet account
 * @param {Address} tokenMint - The public key address of the token mint account of the requested token
 */
export async function getTokenPrice(
  connection: Connection,
  publicKey: PublicKey,
  tokenMint: Address
): Promise<Decimal | null> {
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
  const wclient = buildWhirlpoolClient(ctx);
  
  /* if (!poolsAccounts) {
    poolsAccounts = await getAllWhirlpoolAccountsForConfig({
      connection: connection,
      programId: ORCA_WHIRLPOOL_PROGRAM_ID,
      configId: ORCA_WHIRLPOOLS_CONFIG
    });
  } */

  const USDC_MINT_KEY = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v";
  const USDC_MINT = new PublicKey(USDC_MINT_KEY);

  const prices = await PriceModule.fetchTokenPricesByMints(ctx.fetcher, [
    tokenMint,
    USDC_MINT, //  USDC Stablecoin Token
  ], {
    quoteTokens: [
      USDC_MINT,
    ],
    programId: ORCA_WHIRLPOOL_PROGRAM_ID,
    whirlpoolsConfig: ORCA_WHIRLPOOLS_CONFIG,
    tickSpacings: ORCA_SUPPORTED_TICK_SPACINGS,
  });
  return prices[tokenMint.toString()]
}

export async function getTokensPrice(
  connection,
  publicKey
): Promise<Decimal | null> {
  // TODO: List all Associated Token Accounts
  // TODO: Query Each price to Orca Whirpool Service

  return await getTokenPrice(
    connection,
    publicKey,
    "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263" // BONK Token (For testing)
  );
}
