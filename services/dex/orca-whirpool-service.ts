import * as whirpools from "@orca-so/whirlpools-sdk";
import { BN, Address } from "@coral-xyz/anchor";
import { PublicKey, Connection } from "@solana/web3.js";

/**
 * 
 * @param {Connection} connection - The RPC connection handler from solana SDK
 * @param {PublicKey} publicKey - The public key of the wallet account
 * @param {Address} tokenMint - The public key address of the token mint account of the requested token
 */
export async function getTokenPrice(connection: Connection, publicKey: PublicKey, tokenMint: Address): Promise<number | undefined> {
  const wclient = whirpools.buildWhirlpoolClient(
    whirpools.WhirlpoolContext.from(
      connection,
      {
        publicKey: publicKey,
        signAllTransactions: async () => { return [] },
        signTransaction: async () => { throw "error" },
      },
      whirpools.ORCA_WHIRLPOOL_PROGRAM_ID
    )
  );

  const router = await wclient.getRouter([])
  const route = await router
    .findBestRoute({
      amountSpecifiedIsInput: true,
      tokenIn: tokenMint, // Token from which is required the price
      tokenOut: new PublicKey("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"), // Stablecoin Token on USD (USDC)
      tradeAmount: new BN(1000000), // TODO: Get the amount of tokens that the user have
    });
  
  if (route) {
    return route[0].totalAmountOut.toNumber();

    // TODO: Get the decimals of the token
    // TODO: Divide by decimals
  } else {
    return undefined;
  }
}

export async function getTokensPrice(connection, publicKey) {
  // TODO: List all Associated Token Accounts
  // TODO: Query Each price to Orca Whirpool Service

  return await getTokenPrice(
    connection,
    publicKey,
    new PublicKey("DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263") // BONK Token (For testing)
  );
}
