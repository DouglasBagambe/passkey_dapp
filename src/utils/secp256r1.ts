import {
  Connection,
  PublicKey,
  Transaction,
  TransactionInstruction,
} from "@solana/web3.js";

// Secp256r1 Program ID
const SECP256R1_PROGRAM_ID = new PublicKey(
  "Secp256r1SigVerify1111111111111111111111111"
);

/**
 * Creates a transaction instruction for verifying a Secp256r1 signature
 */
export function createSecp256r1VerifyInstruction(
  sig: Uint8Array,
  publicKey: Uint8Array,
  message: Uint8Array
): TransactionInstruction {
  // Structure of the data:
  // 1 byte: number of signatures to verify (1-8)
  // 1 byte: padding
  // Then, for each signature, the following struct:
  // signature_offset: u16 (offset to signature of 64 bytes)
  // signature_instruction_index: u16 (instruction index to find signature)
  // public_key_offset: u16 (offset to compressed public key of 33 bytes)
  // public_key_instruction_index: u16 (instruction index to find public key)
  // message_data_offset: u16 (offset to start of message data)
  // message_data_size: u16 (size of message data)
  // message_instruction_index: u16 (index of instruction data to get message data)

  // We're going to put all data in one instruction

  // Calculate offsets
  const signatureOffset = 2 + 14; // 1 byte count + 1 byte padding + 14 bytes for the struct
  const publicKeyOffset = signatureOffset + sig.length;
  const messageOffset = publicKeyOffset + publicKey.length;

  // Create data buffer
  const dataLength = messageOffset + message.length;
  const data = Buffer.alloc(dataLength);

  // Write number of signatures (1)
  data.writeUInt8(1, 0);
  // Padding
  data.writeUInt8(0, 1);

  // Write offsets
  let offset = 2;
  // signature_offset
  data.writeUInt16LE(signatureOffset, offset);
  offset += 2;
  // signature_instruction_index
  data.writeUInt16LE(0, offset);
  offset += 2;
  // public_key_offset
  data.writeUInt16LE(publicKeyOffset, offset);
  offset += 2;
  // public_key_instruction_index
  data.writeUInt16LE(0, offset);
  offset += 2;
  // message_data_offset
  data.writeUInt16LE(messageOffset, offset);
  offset += 2;
  // message_data_size
  data.writeUInt16LE(message.length, offset);
  offset += 2;
  // message_instruction_index
  data.writeUInt16LE(0, offset);
  offset += 2;

  // Write signature, public key, and message
  data.set(sig, signatureOffset);
  data.set(publicKey, publicKeyOffset);
  data.set(message, messageOffset);

  return new TransactionInstruction({
    keys: [],
    programId: SECP256R1_PROGRAM_ID,
    data,
  });
}

/**
 * Verifies a Secp256r1 signature on-chain
 */
export async function verifySecp256r1Signature(
  connection: Connection,
  sig: Uint8Array,
  publicKey: Uint8Array,
  message: Uint8Array,
  feePayer: PublicKey
): Promise<string> {
  // Create instruction
  const instruction = createSecp256r1VerifyInstruction(sig, publicKey, message);

  // Create transaction
  const transaction = new Transaction().add(instruction);
  transaction.feePayer = feePayer;

  // Get recent blockhash
  const { blockhash } = await connection.getLatestBlockhash();
  transaction.recentBlockhash = blockhash;

  // Sign and send transaction
  // Note: This is a simplified example. In a real app, you'd need to handle
  // signing with the user's wallet
  const serializedTransaction = transaction.serialize();

  // Send transaction
  const signature = await connection.sendRawTransaction(serializedTransaction);

  // Confirm transaction
  await connection.confirmTransaction(signature);

  return signature;
}
