import { test } from "@jest/globals"
import { getPrices } from "../../../services/solana/solana-balance-service";
import { Connection, Keypair } from "@solana/web3.js";

test('It can retrieve prices from Orca Whirpools succesfully', async () => {
  const conn = new Connection(process.env.RPC_URL || "", "finalized")
  const keypair = Keypair.generate();
  console.log(await getPrices(conn, keypair.publicKey));
})