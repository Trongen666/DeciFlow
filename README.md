# DeciFlow

## Frontend / UI
Run the dev server and open the app in your browser.

Recommended quick local steps

1. Start a local Hardhat node in a terminal:

```powershell
npm run node
```

2. In another terminal deploy contracts to the local node:

```powershell
npm run deploy
```

3. Start the frontend dev server:

```powershell
npm run dev
```

4. Open your browser and point MetaMask to the local network (usually http://127.0.0.1:8545), add an unlocked account and make sure the account is funded by the Hardhat node. Now connect in the UI.

### Connecting your wallet and troubleshooting

- The frontend expects a browser wallet (e.g. MetaMask) available at window.ethereum. If you see 'Please install MetaMask!', install MetaMask and configure it.
- Make sure MetaMask is connected to the same local network where the contracts are deployed (the default project uses a local Hardhat network). The deployed contract addresses are written into `deployed.json` at the project root — confirm the addresses are there.
- If you connect the wallet and still see "No on-chain contract loaded yet", open the browser console to check for errors and confirm MetaMask has an unlocked account. You can also use the small status information on the Home page which shows whether the SupplyChain and AccessControl contracts are loaded.

### Role-based access and how it works

- Roles are managed by the `AccessControlManager` contract. It provides bytes32 constants such as `MANUFACTURER_ROLE`, `DISTRIBUTOR_ROLE`, and `RETAILER_ROLE`.
- Only accounts with `MANUFACTURER_ROLE` can call `createProduct` on the `SupplyChain` contract — the UI checks for this role and shows warnings when a non-manufacturer tries to create products.
- The demo maps some known addresses to roles in `src/utils/users.js` so you can try different personas during development.
# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
