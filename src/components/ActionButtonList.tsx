import { useEffect } from 'react';
import { useDisconnect, useAppKit, useAppKitNetwork, useAppKitAccount } from '@reown/appkit/react';
import { Hex, parseGwei, WalletCapabilities, type Address } from 'viem';
import { useSendTransaction } from 'wagmi';
import { useCallsStatus, useSendCalls } from 'wagmi/experimental';
import { useCapabilities } from 'wagmi/experimental';
import { sepolia } from '@reown/appkit/networks'


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

const paymasterUrl = import.meta.env.VITE_PAYMASTER_URL;
const sponsorshipPolicyId = import.meta.env.VITE_SPONSORSHIP_POLICY_ID;

export const ActionButtonList = ({ sendHash, sendCapabilities, sendStatus, sendError }: ActionButtonListProps) => {
  const { disconnect } = useDisconnect(); // AppKit hook to disconnect
  const { open } = useAppKit(); // AppKit hook to open the modal
  const { switchNetwork } = useAppKitNetwork(); // AppKit hook to switch network
  const { address, isConnected } = useAppKitAccount(); // AppKit hook to get the address and check if the user is connected

  const { data: hash, sendTransaction } = useSendTransaction(); // Wagmi hook to send a transaction
  const { sendCalls, data: id } = useSendCalls();
  const { data: capabilities } = useCapabilities({
    account: address as Address,
  });

  useEffect(() => {
    if (hash) {
      sendHash(hash);
      console.log("Hash: ", hash)
    }
  }, [hash]);

  // Check if capabilities are available
  useEffect(() => {
    if(capabilities) {
      sendCapabilities(capabilities);
      console.log("capabilities: ", capabilities);
    }
  }, [capabilities]);


  // Function to send transactions
  const handleSendTx = () => {
    // check if capabilities are supported
    try {
      if (capabilities) {
        sendCalls({
          calls: [TEST_TX, TEST_TX],
          // and sponsor the tx
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
        // fallback to regular sendTransactions
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
    if (callStatusData?.status === "CONFIRMED") {
      refetchCallStatus();
      const receipts = callStatusData.receipts;
      sendStatus(callStatusData.status)
      if (receipts && receipts.length > 0) {
        sendHash(receipts[0].transactionHash);
      }
    } else if(callStatusData?.status === "PENDING"){
      sendStatus(callStatusData.status)
    }
  }, [callStatusData?.status, refetchCallStatus, sendHash]);

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
        <button onClick={() => switchNetwork(sepolia)}>Switch to Sepolia</button>
        <button onClick={handleSendTx}>Send tx</button>
      </div>
    )
  );
};
