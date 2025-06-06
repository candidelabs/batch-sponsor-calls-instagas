import { useEffect, useState } from 'react'
import { createAppKit, useAppKitAccount } from '@reown/appkit/react'
import { WagmiProvider } from 'wagmi'
import type { Capabilities } from 'viem';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import { ActionButtonList } from './components/ActionButtonList'
import { InfoList } from './components/InfoList'
import { projectId, metadata, networks, wagmiAdapter } from './config'

import "./App.css"

const queryClient = new QueryClient()

const generalConfig = {
  projectId,
  networks,
  metadata,
  themeMode: 'light' as const,
  themeVariables: {
    '--w3m-accent': '#000000',
  }
}

// Create modal
createAppKit({
  adapters: [wagmiAdapter],
  ...generalConfig,
  features: {
    analytics: true // Optional - defaults to your Cloud configuration
  }
})

export function App() {
  const [transactionHash, setTransactionHash] = useState<`0x${string}` | undefined>(undefined);
  const [capabilities, setCapabilities] = useState<Capabilities | undefined>(undefined);
  const [error, setError] = useState('');
  const [status, setStatus] = useState<string | undefined>('');

  const account = useAppKitAccount();

  useEffect(() => {
    if (!account.isConnected) {
      setError('');
      setStatus('');
      setCapabilities(undefined);
      setTransactionHash(undefined);
    }
  }, [account]);


  const receiveHash = (hash: `0x${string}`) => {
    setTransactionHash(hash); // Update the state with the transaction hash
  };

  const receiveCapabilities = (capabilities: Capabilities) => {
    setCapabilities(capabilities);
  }

  const receiveError = (error: string) => {
    setError(error);
  }

  const receiveStatus = (status: string | undefined) => {
    setStatus(status);
  }

  return (
    <div className={"pages"}>
      <img src="/candide-instagas-logo.svg" alt="Candide InstaGas" style={{ width: '150px', height: '150px' }} />
      <h1>Candide InstaGas | Batched and Sponsored Transactions</h1>
      <h3>Using wagmi/viem</h3>

      <WagmiProvider config={wagmiAdapter.wagmiConfig}>
        <QueryClientProvider client={queryClient}>
            <appkit-button />
            <ActionButtonList sendHash={receiveHash} sendCapabilities={receiveCapabilities} sendError={receiveError} sendStatus={receiveStatus}/>
            <div className="advice">
              <p>
                See console for logging and errors<br/>
                Go to <a href="https://dashboard.candide.dev/" target="_blank" className="link-button" rel="Candide Dashboard">Candide Dashboard</a> to get setup a gas policy.
              </p>
            </div>
            <InfoList hash={transactionHash} capabilities={capabilities} error={error} status={status}/>
        </QueryClientProvider>
      </WagmiProvider>
    </div>
  )
}

export default App
