import { useEffect } from 'react';
import { useDisconnect, useAppKit, useAppKitAccount } from '@reown/appkit/react';
import { Hex, parseGwei, WalletCapabilities, type Address } from 'viem';
import { useChainId, useSendTransaction } from 'wagmi';
import { useCallsStatus, useSendCalls } from 'wagmi/experimental';
import { useCapabilities } from 'wagmi/experimental';


// Test transaction
const TEST_TX = {
  to: "0xd8da6bf26964af9d7eed9e03e53415d37aa96045" as Address, // Vitalik's address
  value: parseGwei('0'),
  data: "0x" as Hex,
};

interface ActionButtonListProps {
  sendHash: (hash: `0x${string}`) => void;
  sendCapabilities: (capabilities: WalletCapabilities) => void
  sendStatus: (error: string) => void
  sendError: (error: string) => void
}

const chainIdToNetwork = {
  84532: 'base-sepolia',
  137: 'polygon',
  11155111: 'sepolia',
};

const chainIdToSponsorshipPolicyId = {
  84532: import.meta.env.VITE_BASE_SEPOLIA_SPONSORSHIP_POLICY_ID,
  137: import.meta.env.VITE_POLYGON_SPONSORSHIP_POLICY_ID,
  11155111: import.meta.env.VITE_SEPOLIA_SPONSORSHIP_POLICY_ID
};

const candideApiKey = import.meta.env.VITE_CANDIDE_APY_KEY
const candidePaymasterVersion = "v3";

export const ActionButtonList = ({
  sendHash,
  sendCapabilities,
  sendStatus,
  sendError
}: ActionButtonListProps) => {
  const chainId = useChainId() as keyof typeof chainIdToNetwork;
  
  const sponsorshipPolicyId = chainIdToSponsorshipPolicyId[chainId];
  const paymasterUrl = `https://api.candide.dev/paymaster/${candidePaymasterVersion}/${chainIdToNetwork[chainId]}/${candideApiKey}`;

  const { disconnect } = useDisconnect(); // AppKit hook to disconnect
  const { open } = useAppKit(); // AppKit hook to open the modal
  const { address, isConnected } = useAppKitAccount(); // AppKit hook to get the address and check if the user is connected
  

  const { data: capabilities } = useCapabilities({
    account: address as Address,
  }); // Wagmi hook to check wallet capabilities (for sponsorship)
  const { sendCalls, data: id } = useSendCalls(); // Wagmi hook to send sponsored and batch transactions
  const { data: hash, sendTransaction } = useSendTransaction(); // Wagmi hook to send standard transaction

  useEffect(() => {
    if (hash) {
      sendHash(hash);
      console.log("Hash: ", hash)
    }
  }, [hash]);

  // Check if capabilities are available
  useEffect(() => {
    if (capabilities && address && chainId) {
      sendCapabilities(capabilities);
      console.log("capabilities: ", capabilities);
    }
  }, [capabilities, address, chainId]);


  // Function to send transactions
  const handleSendTx = () => {
    // if smart capabilities are supported, send a sponsored batched transaction
    try {
      if (capabilities) {
        sendCalls({
          calls: [TEST_TX, TEST_TX],
          // and sponsor the tx, optionally with a sponsorshipPolicyId
          capabilities: {
            paymasterService: {
              url: paymasterUrl,
              context: {
                sponsorshipPolicyId,
              }
            }
          },
        });
      } else {
        // if not, fallback to standard sendTransactions
        sendTransaction(TEST_TX);
      }
    } catch (err) {
      sendError(`Error sending transaction:'${err}`)
      console.log('Error sending transaction:', err);
    }
  };

  // get status of sendCalls
  const { data: callStatusData, refetch: refetchCallStatus } = useCallsStatus({
    id: id as string,
    query: {
      enabled: !!id,
      refetchInterval: (data) =>
        data.state.data?.status === "CONFIRMED" ? false : 1000,
    },
  });

  useEffect(() => {
    if (!callStatusData) return;
    
    sendStatus(callStatusData.status);

    if (callStatusData.status === "CONFIRMED") {
      refetchCallStatus();
      const receipts = callStatusData.receipts;
      if (receipts && receipts.length > 0) {
        sendHash(receipts[0].transactionHash);
      }
    }
  }, [callStatusData, refetchCallStatus, sendHash, sendStatus]);

  const handleDisconnect = async () => {
    try {
      await disconnect();
    } catch (error) {
      sendError(`Error sending transaction:'${error}`)
      console.error("Failed to disconnect:", error);
    }
  };

  return (
    isConnected && (
      <div>
        <button onClick={() => open()}>Open</button>
        <button onClick={handleDisconnect}>Disconnect</button>
        <button onClick={handleSendTx}>Send tx</button>
      </div>
    )
  );
};
