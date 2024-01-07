import { test } from "@jest/globals"
import { getPrices } from "../../../src/services/solana/solana-balance-service";
import { Connection, Keypair, PublicKey } from "@solana/web3.js";

test('It can retrieve prices from Orca Whirpools succesfully', async () => {
  const conn = new Connection(process.env.RPC_URL || "", "finalized")
  const keypair = Keypair.generate();
  
  const price = await getPrices(conn, new PublicKey(process.env.TEST_PUBKEY || keypair.publicKey.toString()));
  console.log(` Price in USDC: ${JSON.stringify(price)}`);

  expect(price).not.toBeNull();
}, 30000)