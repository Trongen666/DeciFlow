1. Prerequisites
Node.js (v16+)
MetaMask installed in your browser
2. Setup Local Blockchain
Open a terminal and run:

npx hardhat node
Keep this terminal running. It will give you 20 test accounts. Import the first one (Account #0) into MetaMask using its Private Key.

3. Deploy Contracts
Open a new terminal and run:

npx hardhat run scripts/deploy.js --network localhost
This will:

Deploy all 5 smart contracts.
Create deployed.json in the root directory.
4. Generate Dummy Data (Optional)
To seed the system with users and products:

npx hardhat run scripts/generateDummyData.js --network localhost
5. Start Backend Services
Listener Service
Open a new terminal:

node backend/listener/index.js
This will listen for blockchain events.

API Server
Open a new terminal:

node backend/api/server.js
Server running at http://localhost:3001

6. Start Frontend
Open a new terminal:

npm run dev
Frontend running at http://localhost:5173

7. Verification
Connect Wallet: Open the frontend and click "Connect Wallet".
View Dashboard: You should see the "Total Products" count (from dummy data).
Check Provenance: Go to /products (or use the ID from dummy data) to see the history.
Test Events: If you create a product or trigger an alert, check the "Listener Service" terminal to see the logs.
8. Run Tests
To verify the smart contracts:

npx hardhat test
