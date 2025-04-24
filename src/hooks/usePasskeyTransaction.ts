/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Connection,
  Transaction,
  TransactionInstruction,
  PublicKey,
} from "@solana/web3.js";
import { useState } from "react";
import wallet from "../lib/lazorkit-wrapper.cjs";

const useWallet = wallet.useWallet;

const connection = new Connection("https://api.devnet.solana.com");

export function usePasskeyTransaction() {
  const { signMessage, isConnected, publicKey } = useWallet(connection);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createAndSignTransaction = async (
    instructions: TransactionInstruction[],
    signers?: PublicKey[]
  ) => {
    if (!isConnected || !publicKey) {
      setError("Wallet not connected");
      return null;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Create transaction
      const transaction = new Transaction();

      // Add instructions
      transaction.add(...instructions);

      // Get recent blockhash
      const { blockhash } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = new PublicKey(publicKey);

      // Sign the transaction with Passkey
      const serializedMessage = transaction.serializeMessage();
      const signature = await signMessage(serializedMessage);

      // Add signature to transaction
      transaction.addSignature(
        new PublicKey(publicKey),
        Buffer.from(signature)
      );

      return transaction;
    } catch (err: any) {
      setError(err.message || "Failed to create or sign transaction");
      console.error("Transaction error:", err);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    createAndSignTransaction,
    isLoading,
    error,
  };
}
