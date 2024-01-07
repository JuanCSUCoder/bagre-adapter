import {
  ExecutableRoute,
  ORCA_SUPPORTED_TICK_SPACINGS,
  ORCA_WHIRLPOOLS_CONFIG,
  ORCA_WHIRLPOOL_PROGRAM_ID,
  PriceMap,
  PriceModule,
  WhirlpoolContext,
  WhirlpoolData,
  buildWhirlpoolClient,
  getAllWhirlpoolAccountsForConfig,
} from "@orca-so/whirlpools-sdk";
import { BN, Address } from "@coral-xyz/anchor";
import { PublicKey, Connection } from "@solana/web3.js";
import Decimal from "decimal.js";
import { TOKEN_2022_PROGRAM_ID, TOKEN_PROGRAM_ID } from "@solana/spl-token";


let poolsAccounts: ReadonlyMap<string, WhirlpoolData> | null = null;

/**
 *
 * @param {Connection} connection - The RPC connection handler from solana SDK
 * @param {PublicKey} publicKey - The public key of the wallet account
 * @param {Address} tokenMint - The public key address of the token mint account of the requested token
 */
export async function getTokensPrice(
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
  
  /* if (!poolsAccounts) {
    poolsAccounts = await getAllWhirlpoolAccountsForConfig({
      connection: connection,
      programId: ORCA_WHIRLPOOL_PROGRAM_ID,
      configId: ORCA_WHIRLPOOLS_CONFIG
    });
  } */

  const USDC_MINT_KEY = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v";
  const USDC_MINT = new PublicKey(USDC_MINT_KEY);

  const prices = await PriceModule.fetchTokenPricesByMints(
    ctx.fetcher,
    tokensMints.concat([USDC_MINT]),
    {
      quoteTokens: [
        USDC_MINT,
      ],
      programId: ORCA_WHIRLPOOL_PROGRAM_ID,
      whirlpoolsConfig: ORCA_WHIRLPOOLS_CONFIG,
      tickSpacings: ORCA_SUPPORTED_TICK_SPACINGS,
    }
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
  let addresses: string[] = [];

  const handle = connection
    .getParsedTokenAccountsByOwner(publicKey, {
      programId: TOKEN_PROGRAM_ID,
    })
    .then((accounts) => {
      const newAddrs = accounts.value.map(
        (account) => account.account.data.parsed.info.mint
      );
      addresses = addresses.concat(newAddrs);
    });

  const handle2022 = connection
    .getParsedTokenAccountsByOwner(publicKey, {
      programId: TOKEN_2022_PROGRAM_ID,
    })
    .then((accounts) => {
      const newAddrs = accounts.value.map(
        (account) => account.account.data.parsed.info.mint
      );
      addresses = addresses.concat(newAddrs);
    });
  
  await handle.finally();
  await handle2022.finally();

  console.log(`Mint Addresses: ${JSON.stringify(addresses)}`);

  const priceMap = await getTokensPrice(
    connection,
    publicKey,
    addresses,
  );

  return addresses.map(mint => ({
    mint: mint,
    usdPrice: priceMap[mint],
  }))
}
