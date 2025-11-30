const ethers = require("ethers");
const fs = require("fs");
const path = require("path");
const productHandler = require("./handlers/productHandler");
const alertHandler = require("./handlers/alertHandler");

// Load deployment info
const deploymentPath = path.join(__dirname, "..", "..", "deployed.json");
if (!fs.existsSync(deploymentPath)) {
    console.error("❌ deployed.json not found. Run deploy script first.");
    process.exit(1);
}
const deployed = JSON.parse(fs.readFileSync(deploymentPath, "utf8"));

// Configuration
const RPC_URL = "http://127.0.0.1:8545"; // Localhost
const provider = new ethers.providers.JsonRpcProvider(RPC_URL);

async function startListener() {
    console.log("🎧 Starting Blockchain Event Listener...");
    console.log(`Connecting to ${RPC_URL}`);

    // Load ABIs (Assuming artifacts are in src/artifacts)
    // For simplicity in this demo, we'll use the deployed address and minimal ABIs or full artifacts
    // In a real app, you'd import the JSON artifacts

    const getContract = (name, address) => {
        const artifactPath = path.join(__dirname, "..", "..", "artifacts", "contracts", `${name}.sol`, `${name}.json`);
        const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));
        return new ethers.Contract(address, artifact.abi, provider);
    };

    const supplyChain = getContract("SupplyChain", deployed.contracts.SupplyChain);
    const alertSystem = getContract("AlertSystem", deployed.contracts.AlertSystem);

    console.log("✅ Contracts loaded. Listening for events...");

    // --- SupplyChain Events ---

    supplyChain.on("ProductCreated", (id, name, manufacturer, event) => {
        console.log(`\n📦 [EVENT] ProductCreated: #${id} ${name}`);
        productHandler.handleProductCreated({ id, name, manufacturer, event });
    });

    supplyChain.on("ProductTransferred", (id, from, to, status, event) => {
        console.log(`\n🚚 [EVENT] ProductTransferred: #${id} From: ${from} To: ${to}`);
        productHandler.handleProductTransferred({ id, from, to, status, event });
    });

    supplyChain.on("EnvironmentalDataRecorded", (productId, temp, humidity, event) => {
        console.log(`\n🌡️ [EVENT] EnvironmentalData: #${productId} Temp: ${temp}°C Humidity: ${humidity}%`);
        productHandler.handleEnvironmentalData({ productId, temp, humidity, event });
    });

    // --- AlertSystem Events ---

    alertSystem.on("AlertTriggered", (alertId, alertType, productId, message, event) => {
        console.log(`\n🚨 [EVENT] AlertTriggered: #${alertId} Product: #${productId} Msg: ${message}`);
        alertHandler.handleAlertTriggered({ alertId, alertType, productId, message, event });
    });

    // Keep process alive
    process.stdin.resume();
}

startListener().catch(console.error);
