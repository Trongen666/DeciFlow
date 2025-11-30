const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
    console.log("🌱 Generating Dummy Data...");

    // Load deployed addresses
    const deploymentPath = path.join(__dirname, "..", "deployed.json");
    if (!fs.existsSync(deploymentPath)) {
        throw new Error("❌ deployed.json not found. Run deploy script first.");
    }
    const deployed = JSON.parse(fs.readFileSync(deploymentPath, "utf8"));

    // Get signers
    const [admin, manufacturer, distributor, retailer, customer] = await hre.ethers.getSigners();
    console.log(`Admin: ${admin.address}`);
    console.log(`Manufacturer: ${manufacturer.address}`);
    console.log(`Distributor: ${distributor.address}`);

    // Connect to contracts
    const AccessControl = await hre.ethers.getContractAt("AccessControlManager", deployed.contracts.AccessControl);
    const SupplyChain = await hre.ethers.getContractAt("SupplyChain", deployed.contracts.SupplyChain);
    const AlertSystem = await hre.ethers.getContractAt("AlertSystem", deployed.contracts.AlertSystem);

    // 1. Register Users
    console.log("\n👤 Registering Users...");

    // Manufacturer
    let tx = await AccessControl.connect(manufacturer).registerUser(
        "Acme Corp",
        "Global Manufacturing",
        await AccessControl.MANUFACTURER_ROLE()
    );
    await tx.wait();
    console.log("✅ Manufacturer registered");

    // Distributor
    tx = await AccessControl.connect(distributor).registerUser(
        "FastLogistics",
        "Global Logistics",
        await AccessControl.DISTRIBUTOR_ROLE()
    );
    await tx.wait();
    console.log("✅ Distributor registered");

    // Retailer
    tx = await AccessControl.connect(retailer).registerUser(
        "SuperMart",
        "Retail Chain",
        await AccessControl.RETAILER_ROLE()
    );
    await tx.wait();
    console.log("✅ Retailer registered");

    // 2. Create Products
    console.log("\n📦 Creating Products...");

    // Product 1: Apples (Perishable)
    tx = await SupplyChain.connect(manufacturer).createProduct({
        name: "Organic Apples",
        serialNumber: "SN-APP-001",
        batchNumber: "BATCH-2023-A",
        category: 1, // Perishable
        quantity: 1000,
        unitCost: hre.ethers.utils.parseEther("0.001"),
        expiryDate: Math.floor(Date.now() / 1000) + 86400 * 14, // 2 weeks expiry
        requiresTemperatureControl: true, // Requires temp control
        minTemperature: 2, // Min 2°C
        maxTemperature: 8  // Max 8°C
    });
    await tx.wait();
    console.log("✅ Product 1 created: Organic Apples");

    // Product 2: Electronics (Dry Goods)
    tx = await SupplyChain.connect(manufacturer).createProduct({
        name: "Smart Widget",
        serialNumber: "SN-WDG-999",
        batchNumber: "BATCH-TECH-X",
        category: 0, // DryGoods
        quantity: 500,
        unitCost: hre.ethers.utils.parseEther("0.1"),
        expiryDate: 0, // No expiry
        requiresTemperatureControl: false,
        minTemperature: 0,
        maxTemperature: 0
    });
    await tx.wait();
    console.log("✅ Product 2 created: Smart Widget");

    // 3. Transfer Product
    console.log("\n🚚 Transferring Product...");
    tx = await SupplyChain.connect(manufacturer).transferProduct(1, distributor.address);
    await tx.wait();
    console.log("✅ Product 1 transferred to Distributor");

    // 4. Record Environmental Data (Simulate Violation)
    console.log("\n🌡️ Recording Environmental Data...");
    tx = await SupplyChain.connect(distributor).recordEnvironmentalData(
        1,
        10, // 10°C (Violation! Max is 8°C)
        60
    );
    await tx.wait();
    console.log("✅ Environmental data recorded (Violation simulated)");

    console.log("\n🎉 Dummy data generation complete!");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
