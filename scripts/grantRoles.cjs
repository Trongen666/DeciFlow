// scripts/grantRoles.js
const hre = require("hardhat");

async function main() {
    console.log("🚀 Granting roles...");

    // Load deployed.json
    const deployed = require("../deployed.json");

    // AccessControlManager address
    const accessAddr = deployed.contracts.AccessControl;
    console.log("🔗 AccessControlManager at:", accessAddr);

    // Get the contract instance (uses Hardhat signer[0] by default)
    const access = await hre.ethers.getContractAt("AccessControlManager", accessAddr);

    // Your MetaMask wallet address (the one imported into MM)
    const myWallet = "0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199";
    console.log("👤 Assigning roles to:", myWallet);

    // Load role identifiers
    const ADMIN_ROLE         = await access.DEFAULT_ADMIN_ROLE();
    const MANUFACTURER_ROLE  = await access.MANUFACTURER_ROLE();
    const DISTRIBUTOR_ROLE   = await access.DISTRIBUTOR_ROLE();
    const RETAILER_ROLE      = await access.RETAILER_ROLE();

    // Grant roles
    await access.grantRole(ADMIN_ROLE, myWallet);
    await access.grantRole(MANUFACTURER_ROLE, myWallet);
    await access.grantRole(DISTRIBUTOR_ROLE, myWallet);
    await access.grantRole(RETAILER_ROLE, myWallet);

    console.log("🎉 All roles granted successfully!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
      console.error("❌ ERROR:", error);
      process.exit(1);
  });
