// Source: https://docs.solana.com/developing/clients/javascript-reference#transaction
import * as web3 from '@solana/web3.js';
import nacl from 'tweetnacl';
import sleep from 'sleep';

export const main = async() => {
  let payerA = web3.Keypair.generate();
  let payerB = web3.Keypair.generate();
  console.log('payerA Public Key -> ', payerA.publicKey.toString());
  console.log('payerB Public Key -> ', payerB.publicKey.toString());


  // let connection = new web3.Connection(web3.clusterApiUrl('devnet'), 'confirmed');
  let connection = new web3.Connection('http://127.0.0.1:8899', 'confirmed');


  // --- Airdrop ---
  // Airdrop for PayerA
  console.log("Airdopping to PayerA");
  let airdropSignature = await connection.requestAirdrop(
      payerA.publicKey,
      web3.LAMPORTS_PER_SOL,
  );

  let latestBlockHash = await connection.getLatestBlockhash();

  await connection.confirmTransaction({
    blockhash: latestBlockHash.blockhash,
    lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
    signature: airdropSignature,
  });

  // For "Too Many Requests" error for Devnet
  console.log("sleep 10 sec...");
  sleep.sleep(10);

  // Airdrop for PayerB
  console.log("Airdopping to PayerB");
  let airdropSignaturePayerB = await connection.requestAirdrop(
      payerB.publicKey,
      web3.LAMPORTS_PER_SOL,
  );

  latestBlockHash = await connection.getLatestBlockhash();

  await connection.confirmTransaction({
    blockhash: latestBlockHash.blockhash,
    lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
    signature: airdropSignaturePayerB,
  });

  // For "Too Many Requests" error for Devnet
  console.log("sleep 10 sec...");
  sleep.sleep(10);


  // --- Transaction ---
  let transaction = new web3.Transaction();

  // Transaction PayerA
  transaction.add(web3.SystemProgram.transfer({
      fromPubkey: payerA.publicKey,
      toPubkey: payerB.publicKey,
      lamports: web3.LAMPORTS_PER_SOL * 0.0123,
  }));

  // Transaction PayerB
  transaction.add(web3.SystemProgram.transfer({
      fromPubkey: payerB.publicKey,
      toPubkey: payerA.publicKey,
      lamports: web3.LAMPORTS_PER_SOL * 0.0345,
  }));

  // Send and confirm transaction
  // Ref: https://solana-labs.github.io/solana-web3.js/modules.html#sendAndConfirmTransaction
  // Note: feePayer is by default the first signer, or payer, if the parameter is not set
  let signature = await web3.sendAndConfirmTransaction(
    connection, // Connection
    transaction, // Transaction
    [payerA, payerB] // Signer[]
  );

  console.log('Signature -> ', signature);
};

main();

/*
% ts-node <THIS JS FILE>
payerA Public Key ->  ZeKo8prhWKSSmvPrsv3js7TXyxQfiyiYMcWs1NBG4Vm
payerB Public Key ->  3fE3MAUwG45rYDH2RU8wsZDfterGjBxxffsLf24Ujiq8
Airdopping to PayerA
sleep 10 sec...
Airdopping to PayerB
sleep 10 sec...
Signature ->  FkF8LbjYGE4SprCZJSrrxboePnQ5GjTyQpURmo6SLXLtsbd5rS1ZsinUeMxuf8gM4L3Cby73wL5Lo6XEZ7Sqk8W
*/

/*
If you got following error, you should have more long sleep.

```
Error: 429 Too Many Requests:  {"jsonrpc":"2.0","error":{"code": 429, "message":"Too requests for a specific RPC call, contact your app developer or support@rpcpool.com."}, "id": "99ff2fa9-c7db-4a49-b218-829b859a7f3f" }
```
*/