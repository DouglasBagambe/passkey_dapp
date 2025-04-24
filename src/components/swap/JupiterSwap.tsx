import { useJupiter } from "@jup-ag/react-hook";
import { Connection, PublicKey } from "@solana/web3.js";
import { FC, useState } from "react";
import { useWallet } from "@lazorkit/wallet";

// Token constants
const USDC_MINT = new PublicKey("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v");
const SOL_MINT = new PublicKey("So11111111111111111111111111111111111111112");

const connection = new Connection("https://api.devnet.solana.com");

interface JupiterSwapProps {
  userPublicKey: string | null;
}

const JupiterSwap: FC<JupiterSwapProps> = ({ userPublicKey }) => {
  const [amount, setAmount] = useState("0.1");
  const [inputToken, setInputToken] = useState(SOL_MINT.toString());
  const [outputToken, setOutputToken] = useState(USDC_MINT.toString());
  const { signMessage } = useWallet(connection);

  const { exchange, routes, loading, error } = useJupiter({
    amount: parseFloat(amount) * 1_000_000_000, // Convert to lamports
    inputMint: new PublicKey(inputToken),
    outputMint: new PublicKey(outputToken),
    slippage: 1, // 1% slippage
    debounceTime: 250,
  });

  const handleSwap = async () => {
    if (!routes || routes.length === 0 || !userPublicKey) return;

    try {
      // Get the best route
      const bestRoute = routes[0];

      // Prepare the transaction
      const { swapTransaction } = await exchange({
        routeInfo: bestRoute,
        userPublicKey: new PublicKey(userPublicKey),
      });

      if (!swapTransaction) {
        console.error("Failed to create swap transaction");
        return;
      }

      // Convert transaction to message for signing
      const message = swapTransaction.serializeMessage();

      // Sign the transaction with Passkey
      const signature = await signMessage(message.serialize());
      console.log("Transaction signed:", signature);

      // Here you would normally submit the transaction to the network
      // This is a simplified example
    } catch (err) {
      console.error("Swap error:", err);
    }
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow-md w-full max-w-md">
      <h2 className="text-2xl font-bold mb-4">Swap Tokens</h2>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">From</label>
        <select
          value={inputToken}
          onChange={(e) => setInputToken(e.target.value)}
          className="w-full p-2 border rounded"
        >
          <option value={SOL_MINT.toString()}>SOL</option>
          <option value={USDC_MINT.toString()}>USDC</option>
        </select>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">To</label>
        <select
          value={outputToken}
          onChange={(e) => setOutputToken(e.target.value)}
          className="w-full p-2 border rounded"
        >
          <option value={USDC_MINT.toString()}>USDC</option>
          <option value={SOL_MINT.toString()}>SOL</option>
        </select>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Amount</label>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="w-full p-2 border rounded"
          min="0.000001"
          step="0.01"
        />
      </div>

      {routes && routes.length > 0 && (
        <div className="mb-4 p-2 bg-gray-50 rounded">
          <p className="font-medium">Best price:</p>
          <p>
            {routes[0].outAmount / 1_000_000_000}{" "}
            {outputToken === SOL_MINT.toString() ? "SOL" : "USDC"}
          </p>
        </div>
      )}

      <button
        onClick={handleSwap}
        disabled={loading || !routes || routes.length === 0 || !userPublicKey}
        className="w-full py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-300"
      >
        {loading ? "Loading routes..." : "Swap"}
      </button>

      {error && <p className="text-red-500 mt-2">{error.toString()}</p>}
    </div>
  );
};

export default JupiterSwap;
