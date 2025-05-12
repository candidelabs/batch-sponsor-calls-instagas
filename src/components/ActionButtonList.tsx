import { useEffect } from 'react';
import { useDisconnect, useAppKit, useAppKitAccount } from '@reown/appkit/react';
import { Hex, parseGwei, toHex, type Address, Capabilities, zeroAddress } from 'viem';
import {
  useChainId,
  useSendTransaction,
  useSendCalls,
  useCallsStatus,
  useCapabilities
} from 'wagmi';

// Test transaction
const TEST_TX = {
  to: zeroAddress as Address,
  value: parseGwei('0'),
  data: zeroAddress as Hex,
};

interface ActionButtonListProps {
  sendHash: (hash: `0x${string}`) => void;
  sendCapabilities: (capabilities: Capabilities) => void
  sendStatus: (status: string | undefined) => void
  sendError: (error: string) => void
}

const chainIdToNetwork = {
  1: 'ethereum',
  84532: 'base-sepolia',
  11155111: 'sepolia',
  10: 'optimism',
};

const chainIdToSponsorshipPolicyId = {
  1: import.meta.env.VITE_ETHEREUM_SPONSORSHIP_POLICY_ID,
  84532: import.meta.env.VITE_BASE_SEPOLIA_SPONSORSHIP_POLICY_ID,
  11155111: import.meta.env.VITE_SEPOLIA_SPONSORSHIP_POLICY_ID,
  10: import.meta.env.VITE_OPTIMISM_SPONSORSHIP_POLICY_ID,
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
        if (capabilities[chainId].atomic?.status == "supported" || "ready") {
          if (capabilities[chainId].paymasterService?.supported) {
            sendCalls({
              calls: [TEST_TX, TEST_TX],
              // and sponsor the tx, optionally with a sponsorshipPolicyId
              capabilities: {
                paymasterService: {
                  [toHex(chainId)]: {
                    url: paymasterUrl,
                    optional: true,
                    context: {
                      sponsorshipPolicyId: sponsorshipPolicyId,
                    }
                  }
                }
              },
            });
          } else {
            sendCalls({
              calls: [TEST_TX, TEST_TX],
            });
          }
        }
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
    id: id?.id || '',
    query: {
      enabled: !!id,
      refetchInterval: (data) =>
        data.state.data?.status === "success" ? false : 1000,
    },
  });

  useEffect(() => {
    if (!callStatusData) return;

    sendStatus(callStatusData.status);

    if (callStatusData.status === "success") {
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
