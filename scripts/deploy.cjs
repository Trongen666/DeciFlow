const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("🚀 Starting deployment process...");

  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  // 1. Deploy AccessControl
  console.log("Deploying AccessControlManager...");
  const AccessControl = await hre.ethers.getContractFactory("AccessControlManager");
  const accessControl = await AccessControl.deploy();
  await accessControl.deployed();
  console.log("✅ AccessControlManager deployed to:", accessControl.address);

  // 2. Deploy AlertSystem
  console.log("Deploying AlertSystem...");
  const AlertSystem = await hre.ethers.getContractFactory("AlertSystem");
  const alertSystem = await AlertSystem.deploy(accessControl.address);
  await alertSystem.deployed();
  console.log("✅ AlertSystem deployed to:", alertSystem.address);

  // 3. Deploy SupplyChain
  console.log("Deploying SupplyChain...");
  const SupplyChain = await hre.ethers.getContractFactory("SupplyChain");
  const supplyChain = await SupplyChain.deploy(accessControl.address, alertSystem.address);
  await supplyChain.deployed();
  console.log("✅ SupplyChain deployed to:", supplyChain.address);

  // 4. Deploy InventoryManagement
  console.log("Deploying InventoryManagement...");
  const InventoryManagement = await hre.ethers.getContractFactory("InventoryManagement");
  const inventoryManagement = await InventoryManagement.deploy(supplyChain.address);
  await inventoryManagement.deployed();
  console.log("✅ InventoryManagement deployed to:", inventoryManagement.address);

  // 5. Deploy FinancialTracking
  console.log("Deploying FinancialTracking...");
  const FinancialTracking = await hre.ethers.getContractFactory("FinancialTracking");
  const financialTracking = await FinancialTracking.deploy(supplyChain.address);
  await financialTracking.deployed();
  console.log("✅ FinancialTracking deployed to:", financialTracking.address);

  // Save deployment info
  const deploymentInfo = {
    network: hre.network.name,
    chainId: hre.network.config.chainId,
    contracts: {
      AccessControl: accessControl.address,
      AlertSystem: alertSystem.address,
      SupplyChain: supplyChain.address,
      InventoryManagement: inventoryManagement.address,
      FinancialTracking: financialTracking.address
    },
    timestamp: new Date().toISOString()
  };

  const deploymentPath = path.join(__dirname, "..", "deployed.json");
  fs.writeFileSync(deploymentPath, JSON.stringify(deploymentInfo, null, 2));
  console.log(`\n💾 Deployment info saved to ${deploymentPath}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });