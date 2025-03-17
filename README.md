# Candide InstaGas | AppKit sponsored calls example using wagmi (Vite + React)

This example dapp follows EIP-5792 for batch calls and EIP-7677 for gas sponsorship

## Usage

1. Go to [Candide Dashboard](https://dashboard.candide.dev) and create both an app and a gas policy
2. Copy your paymaster URL from the app and the Sponsorship Policy ID from the gas policy
3. Rename `.env.example` to `.env` and paste in `VITE_PAYMASTER_URL` and `VITE_SPONSORSHIP_POLICY_ID`
4. Run `pnpm install` to install dependencies
5. Run `pnpm run dev` to start the development server

## Resources

- [Candide — Gas Policies](https://docs.candide.dev/instagas/gas-policies)