# Candide InstaGas | Batched sponsored transactions example using wagmi

This example dapp follows EIP-5792 for batch calls and EIP-7677 for gas sponsorship. 

- Wallet connector library: Appkit by reown
- Ethereum Interface library: wagmi and viem

## How It Works

1. **Wallet Capability Check**  
   The dapp uses wagmi's [useCapabilities](https://wagmi.sh/react/api/hooks/useCapabilities) hook to assess the features of the connected wallet, such as sponsorship capabilities.

2. **Transaction Submission**  
   If the wallet supports sponsorship through paymaster capabilities, the dapp proceeds to send the transaction using the [useSendCalls](https://wagmi.sh/react/api/hooks/useSendCalls) hook, which includes the paymaster URL and the sponsorship policy ID in the context field.

3. **Transaction Status Tracking**  
   The dapp uses [useCallsStatus](https://wagmi.sh/react/api/hooks/useCallsStatus) hook to monitor the status of the transaction..

4. **Fallback Mechanism**  
   In cases where the wallet does not support any capabilities, the dapp fallback to wagmi's standard [useSendTransaction](https://wagmi.sh/react/api/hooks/useSendTransaction) hook to handle sending the transaction.

## How to run

1. Go to [Candide Dashboard](https://dashboard.candide.dev) and create both an app and a gas policy.
2. Copy your api key from the app and the Sponsorship Policy ID from the gas policy.
3. Rename `.env.example` to `.env` and paste in your api key and policy id.
4. Run `pnpm install` to install dependencies.
5. Run `pnpm run dev` to start the development server.

## Resources

- [Candide — Gas Policies](https://docs.candide.dev/instagas/gas-policies)
- [EIP-5972 using viem](https://viem.sh/docs/actions/wallet/sendCalls#sendcalls)