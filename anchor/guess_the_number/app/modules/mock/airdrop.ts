import { PublicKey, Keypair, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js';

export const airdrop = async(connection: any, publicKey: PublicKey) => {
  let latestBlockHash: any;
  let airdropSignature: any;

  airdropSignature = await connection.requestAirdrop(publicKey, LAMPORTS_PER_SOL);
  latestBlockHash = await connection.getLatestBlockhash();

  await connection.confirmTransaction({
    blockhash: latestBlockHash.blockhash,
    lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
    signature: airdropSignature,
  })
};