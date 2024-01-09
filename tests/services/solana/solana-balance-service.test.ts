import { test } from "@jest/globals"
import { getBalance, getPrices } from "../../../src/services/solana/solana-balance-service";
import { Connection, Keypair, PublicKey } from "@solana/web3.js";

test('It can retrieve prices from Orca Whirpools succesfully', async () => {
  const conn = new Connection(process.env.RPC_URL || "", "finalized")
  const keypair = Keypair.generate();
  
  const prices = await getPrices(conn, new PublicKey(process.env.TEST_PUBKEY || keypair.publicKey.toString()));
  console.log(` Price in USDC: ${JSON.stringify(prices)}`);

  expect(prices).not.toBeNull();
}, 30000)

test('It can calculate the balance from Whirlpools data succesfully',async () => {
  const conn = new Connection(process.env.RPC_URL || "", "finalized");
  const keypair = Keypair.generate();

  const balances = await getBalance(conn, new PublicKey(process.env.TEST_PUBKEY || keypair.publicKey.toString()));
  console.log(`Balances in USDC: ${JSON.stringify(balances)}`);
})