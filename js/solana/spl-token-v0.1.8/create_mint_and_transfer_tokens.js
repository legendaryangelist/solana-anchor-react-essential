// Source:
//    TS: https://github.com/solana-labs/solana-program-library/blob/%40solana/spl-token%40v0.1.8/token/program/src/instruction.rs
//    JS: https://github.com/solana-labs/solana-program-library/blob/%40solana/spl-token%40v0.1.8/token/js/examples/create_mint_and_transfer_tokens.js
var web3 = require('@solana/web3.js');
var splToken = require('@solana/spl-token');

(async () => {
  // Connect to cluster
  var connection = new web3.Connection(
    web3.clusterApiUrl('devnet'),
    'confirmed',
  );

  // Generate a new wallet keypair and airdrop SOL
  var fromWallet = web3.Keypair.generate();
  var fromAirdropSignature = await connection.requestAirdrop(
    fromWallet.publicKey,
    web3.LAMPORTS_PER_SOL,
  );
  //wait for airdrop confirmation
  await connection.confirmTransaction(fromAirdropSignature);

  // Generate a new wallet to receive newly minted token
  var toWallet = web3.Keypair.generate();

  //create new token mint
  // Source?: https://github.com/solana-labs/solana-program-library/blob/50f165ba0359285f3f2f85540aeb8a6d59c7c51a/token/program/src/instruction.rs#L700
  let mint = await splToken.Token.createMint(
    connection,
    fromWallet,
    fromWallet.publicKey,
    null,
    9,
    splToken.TOKEN_PROGRAM_ID,
  );

  //get the token account of the fromWallet Solana address, if it does not exist, create it
  let fromTokenAccount = await mint.getOrCreateAssociatedAccountInfo(
    fromWallet.publicKey,
  );

  //get the token account of the toWallet Solana address, if it does not exist, create it
  var toTokenAccount = await mint.getOrCreateAssociatedAccountInfo(
    toWallet.publicKey,
  );

  //minting 1 new token to the "fromTokenAccount" account we just returned/created
  // Source?: https://github.com/solana-labs/solana-program-library/blob/50f165ba0359285f3f2f85540aeb8a6d59c7c51a/token/program/src/instruction.rs#L1010
  await mint.mintTo(
    fromTokenAccount.address,
    fromWallet.publicKey,
    [],
    1000000000,
  );

  // Add token transfer instructions to transaction
  // Source: https://github.com/solana-labs/solana-program-library/blob/50f165ba0359285f3f2f85540aeb8a6d59c7c51a/token/program/src/instruction.rs#L889
  var transaction = new web3.Transaction().add(
    splToken.Token.createTransferInstruction(
      splToken.TOKEN_PROGRAM_ID,
      fromTokenAccount.address,
      toTokenAccount.address,
      fromWallet.publicKey,
      [],
      1,
    ),
  );

  // Sign transaction, broadcast, and confirm
  var signature = await web3.sendAndConfirmTransaction(
    connection,
    transaction,
    [fromWallet],
    {commitment: 'confirmed'},
  );
  console.log('SIGNATURE', signature);
})();
