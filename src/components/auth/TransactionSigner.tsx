/* eslint-disable @typescript-eslint/no-explicit-any */
import { Connection } from "@solana/web3.js";
import { FC, useState } from "react";
import wallet from "../../lib/lazorkit-wrapper.cjs";

const useWallet = wallet.useWallet;

const connection = new Connection("https://api.devnet.solana.com");

interface TransactionSignerProps {
  instructionToSign?: Uint8Array;
  onSignSuccess?: (signature: Uint8Array) => void;
}

const TransactionSigner: FC<TransactionSignerProps> = ({
  instructionToSign,
  onSignSuccess,
}) => {
  const { signMessage, isConnected } = useWallet(connection);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSign = async () => {
    if (!instructionToSign || !isConnected) return;

    try {
      setIsLoading(true);
      setError(null);

      // Sign the instruction with Passkey
      const signature = await signMessage(instructionToSign);

      if (onSignSuccess) {
        onSignSuccess(signature);
      }

      console.log("Signature:", signature);
    } catch (err: any) {
      setError(err.message || "Failed to sign transaction");
      console.error("Signing error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isConnected) {
    return <p>Connect your wallet first</p>;
  }

  return (
    <div className="mt-4">
      <button
        onClick={handleSign}
        disabled={isLoading || !instructionToSign}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-300"
      >
        {isLoading ? "Signing..." : "Sign Transaction"}
      </button>

      {error && <p className="text-red-500 mt-2">{error}</p>}
    </div>
  );
};

export default TransactionSigner;
