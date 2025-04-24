/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { Connection } from "@solana/web3.js";
import { FC, useEffect } from "react";
import wallet from "../../lib/lazorkit-wrapper.cjs";

const LazorConnect = wallet.LazorConnect;
const useWallet = wallet.useWallet;

// Initialize Solana connection (use mainnet for production)
const connection = new Connection("https://api.devnet.solana.com");

interface PasskeyConnectProps {
  onSuccess?: (publicKey: string) => void;
}

const PasskeyConnect: FC<PasskeyConnectProps> = ({ onSuccess }) => {
  const { isConnected, publicKey, connect, disconnect, error } =
    useWallet(connection);

  useEffect(() => {
    if (isConnected && publicKey && onSuccess) {
      onSuccess(publicKey);
    }
  }, [isConnected, publicKey, onSuccess]);

  return (
    <div className="p-4 bg-slate-100 rounded-lg w-full max-w-md">
      <h2 className="text-2xl font-bold mb-4">Passkey Authentication</h2>

      {!isConnected ? (
        <div>
          <p className="mb-4">
            Connect with a secure passkey - no seed phrase needed!
          </p>
          <LazorConnect
            connection={connection}
            onConnect={(pubkey: any) => console.log("Connected:", pubkey)}
          />
        </div>
      ) : (
        <div>
          <p className="mb-2">Connected with Passkey</p>
          <p className="text-sm font-mono mb-4 truncate">{publicKey}</p>
          <button
            onClick={disconnect}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Disconnect
          </button>
        </div>
      )}

      {error && <p className="text-red-500 mt-2">{error}</p>}
    </div>
  );
};

export default PasskeyConnect;
