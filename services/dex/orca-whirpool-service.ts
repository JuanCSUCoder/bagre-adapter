import {
  ExecutableRoute,
  ORCA_WHIRLPOOLS_CONFIG,
  ORCA_WHIRLPOOL_PROGRAM_ID,
  WhirlpoolContext,
  WhirlpoolData,
  buildWhirlpoolClient,
  getAllWhirlpoolAccountsForConfig,
} from "@orca-so/whirlpools-sdk";
import { BN, Address } from "@coral-xyz/anchor";
import { PublicKey, Connection } from "@solana/web3.js";


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
): Promise<number | null> {
  const wclient = buildWhirlpoolClient(
    WhirlpoolContext.from(
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
    )
  );

  // Gets all the whirlpools from the default Whirlpool Config and Program
  if (!poolsAccounts) {
    poolsAccounts = await getAllWhirlpoolAccountsForConfig({
      connection: connection,
      programId: ORCA_WHIRLPOOL_PROGRAM_ID,
      configId: ORCA_WHIRLPOOLS_CONFIG,
    });
  }

  console.log("Found Whirlpool: " + JSON.stringify(Array.from(poolsAccounts.entries())[0]));

  const pools = Array.from(poolsAccounts.entries()).map((poolAccount) => poolAccount[0]);

  const router = await wclient.getRouter(pools);
  let route: ExecutableRoute | null = null;
  try {
    route = await router.findBestRoute({
      amountSpecifiedIsInput: true,
      tokenIn: tokenMint, // Token from which is required the price
      tokenOut: new PublicKey("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"), // Stablecoin Token on USD (USDC)
      tradeAmount: new BN(1000000), // TODO: Get the amount of tokens that the user have
    });
  } catch (error) {
    console.error("Error Finding Route");
    error;
    return null;
  }

  if (route) {
    return route[0].totalAmountOut.toNumber();

    // TODO: Get the decimals of the token
    // TODO: Divide by decimals
  } else {
    return null;
  }
}

export async function getTokensPrice(
  connection,
  publicKey
): Promise<number | null> {
  // TODO: List all Associated Token Accounts
  // TODO: Query Each price to Orca Whirpool Service

  return await getTokenPrice(
    connection,
    publicKey,
    new PublicKey("DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263") // BONK Token (For testing)
  );
}
