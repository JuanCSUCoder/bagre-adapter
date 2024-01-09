import { TOKEN_2022_PROGRAM_ID, TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { Connection, PublicKey } from "@solana/web3.js";
import { SOL_ADDRESS } from "../../constants/token-constants";

export async function getWalletMintsAccounts(
  connection: Connection,
  publicKey: PublicKey
): Promise<string[]> {
  let addresses: string[] = [SOL_ADDRESS];

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

  return addresses;
}
