import { useEffect } from 'react'
import {
    useAppKitState,
    useAppKitEvents,
    useAppKitAccount,
    useWalletInfo
     } from '@reown/appkit/react'
import { useChainId, useWaitForTransactionReceipt } from 'wagmi'
import { WalletCapabilities } from 'viem';

interface InfoListProps {
    hash: `0x${string}` | undefined;
    capabilities: WalletCapabilities | undefined;
    balance: string;
}

export const InfoList = ({ hash, balance, capabilities }: InfoListProps) => {
    const state = useAppKitState(); // AppKit hook to get the state
    const {address, caipAddress, isConnected, status, embeddedWalletInfo } = useAppKitAccount(); // AppKit hook to get the account information
    const events = useAppKitEvents() // AppKit hook to get the events
    const { walletInfo } = useWalletInfo() // AppKit hook to get the wallet info
    const chainId = useChainId();

    const { data: receipt } = useWaitForTransactionReceipt({ hash, confirmations: 2,  // Wait for at least 2 confirmation
        timeout: 300000,    // Timeout in milliseconds (5 minutes)
        pollingInterval: 1000,  })

    useEffect(() => {
        console.log("Events: ", events);
    }, [events]);

    useEffect(() => {
        console.log("Embedded Wallet Info: ", embeddedWalletInfo);
    }, [embeddedWalletInfo]);
  
  return (
    <>
        {balance && (
        <section>
            <h2>Balance: {balance}</h2>
        </section>
        )}
        {capabilities && (
            <section>
                <h2>Capabilities</h2>
                <pre>
                    capabilities for chainId: {chainId}<br />
                <ul>
                    <li>Paymaster Service Supported: {capabilities[chainId].paymasterService?.supported ? 'Yes' : 'No'}</li>
                    <li>Auxiliary Funds Supported: {capabilities[chainId].auxiliaryFunds?.supported === 'Yes' || 'No'}</li>
                </ul>
                </pre>
        </section>
        )}
        {hash && (
        <section>
            <h2>Transaction Hash</h2>
            <pre>
                Hash: {hash}<br />
                Status: {receipt?.status.toString()}<br />
            </pre>
        </section>
        )}
        <section>
            <h2>useAppKit</h2>
            <pre>
                Address: {address}<br />
                caip Address: {caipAddress}<br />
                Connected: {isConnected.toString()}<br />
                Status: {status}<br />
                Account Type: {embeddedWalletInfo?.accountType}<br />
                {embeddedWalletInfo?.user?.email && (`Email: ${embeddedWalletInfo?.user?.email}\n`)}
                {embeddedWalletInfo?.user?.username && (`Username: ${embeddedWalletInfo?.user?.username}\n`)}
                {embeddedWalletInfo?.authProvider && (`Provider: ${embeddedWalletInfo?.authProvider}\n`)}
            </pre>
        </section>

        <section>
            <h2>State</h2>
            <pre>
                activeChain: {state.activeChain}<br />
                loading: {state.loading.toString()}<br />
                open: {state.open.toString()}<br />
                selectedNetworkId: {state.selectedNetworkId?.toString()}<br />
            </pre>
        </section>

        <section>
            <h2>WalletInfo</h2>
            <pre>
                Name: {JSON.stringify(walletInfo)}<br />
            </pre>
        </section>
    </>
  )
}
