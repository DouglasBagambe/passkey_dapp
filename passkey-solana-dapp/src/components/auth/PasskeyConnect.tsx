import { LazorConnect, useWallet } from '@lazorkit/wallet';
import { Connection } from '@solana/web3.js';
import { FC, useEffect } from 'react';

const connection = new Connection('https://api.devnet.solana.com');

const PasskeyConnect: FC = () => {
  const { isConnected, publicKey, connect, disconnect } = useWallet(connection);

  useEffect(() => {
    if (isConnected && publicKey) {
      console.log('Connected with:', publicKey);
    }
  }, [isConnected, publicKey]);

  return (
    <div className="p-4 bg-slate-100 rounded-lg">
      {!isConnected ? (
        <LazorConnect
          connection={connection}
          onConnect={(pubkey) => console.log('Connected:', pubkey)}
        />
      ) : (
        <div>
          <p className="mb-2">Connected: {publicKey}</p>
          <button
            onClick={disconnect}
            className="px-4 py-2 bg-red-500 text-white rounded"
          >
            Disconnect
          </button>
        </div>
      )}
    </div>
  );
};

export default PasskeyConnect;
