import { test } from "@jest/globals"
import { getPrices } from "../../../services/solana/solana-balance-service";

test('It can retrieve prices from Orca Whirpools succesfully', () => {
  console.log(getPrices());
})