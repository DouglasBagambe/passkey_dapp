/* eslint-disable @typescript-eslint/no-unused-vars */
import { useEffect, useState } from "react";
import { setupPolyfills } from "../utils/polyfills";
import PasskeyConnect from "../components/auth/PasskeyConnect";
import JupiterSwap from "../components/swap/JupiterSwap";

// Setup polyfills
setupPolyfills();

export default function Home() {
  const [userPublicKey, setUserPublicKey] = useState<string | null>(null);

  const handleConnectionSuccess = (publicKey: string) => {
    setUserPublicKey(publicKey);
  };

  return (
    <main className="flex min-h-screen flex-col items-center p-8">
      <h1 className="text-4xl font-bold mb-8">Solana Passkey DeFi</h1>

      <div className="w-full max-w-4xl flex flex-col md:flex-row gap-8">
        <div className="flex-1">
          <PasskeyConnect onSuccess={handleConnectionSuccess} />
        </div>

        <div className="flex-1">
          {userPublicKey ? (
            <JupiterSwap userPublicKey={userPublicKey} />
          ) : (
            <div className="p-4 bg-slate-100 rounded-lg">
              <p>Connect your wallet to swap tokens</p>
            </div>
          )}
        </div>
      </div>

      <footer className="mt-16 text-center text-gray-500">
        <p>Built with Lazorkit for Passkey Authentication on Solana</p>
      </footer>
    </main>
  );
}
