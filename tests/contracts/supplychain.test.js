const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("SupplyChain Smart Contract", function () {
    let AccessControl, SupplyChain, AlertSystem;
    let accessControl, supplyChain, alertSystem;
    let admin, manufacturer, distributor, other;

    beforeEach(async function () {
        [admin, manufacturer, distributor, other] = await ethers.getSigners();

        // Deploy AccessControl
        AccessControl = await ethers.getContractFactory("AccessControlManager");
        accessControl = await AccessControl.deploy();
        await accessControl.deployed();

        // Register Manufacturer
        const MANUFACTURER_ROLE = await accessControl.MANUFACTURER_ROLE();
        await accessControl.connect(manufacturer).registerUser("Acme", "Mfg", MANUFACTURER_ROLE);

        // Deploy AlertSystem
        AlertSystem = await ethers.getContractFactory("AlertSystem");
        alertSystem = await AlertSystem.deploy(accessControl.address);
        await alertSystem.deployed();

        // Deploy SupplyChain
        SupplyChain = await ethers.getContractFactory("SupplyChain");
        supplyChain = await SupplyChain.deploy(accessControl.address, alertSystem.address);
        await supplyChain.deployed();
    });

    it("Should allow Manufacturer to create a product", async function () {
        await supplyChain.connect(manufacturer).createProduct({
            name: "Test Product",
            serialNumber: "SN-123",
            batchNumber: "BATCH-1",
            category: 0, // DryGoods
            quantity: 100,
            unitCost: 1000,
            expiryDate: 0,
            requiresTemperatureControl: false,
            minTemperature: 0,
            maxTemperature: 0
        });

        const product = await supplyChain.getProduct(1);
        expect(product.name).to.equal("Test Product");
        expect(product.currentOwner).to.equal(manufacturer.address);
    });

    it("Should fail if non-manufacturer tries to create product", async function () {
        await expect(
            supplyChain.connect(other).createProduct({
                name: "Fake Product",
                serialNumber: "SN-FAKE",
                batchNumber: "BATCH-X",
                category: 0,
                quantity: 100,
                unitCost: 1000,
                expiryDate: 0,
                requiresTemperatureControl: false,
                minTemperature: 0,
                maxTemperature: 0
            })
        ).to.be.revertedWith("Manufacturer only");
    });

    it("Should allow owner to transfer product", async function () {
        // Create first
        await supplyChain.connect(manufacturer).createProduct({
            name: "Test Product",
            serialNumber: "SN-123",
            batchNumber: "BATCH-1",
            category: 0,
            quantity: 100,
            unitCost: 1000,
            expiryDate: 0,
            requiresTemperatureControl: false,
            minTemperature: 0,
            maxTemperature: 0
        });

        // Transfer
        await supplyChain.connect(manufacturer).transferProduct(1, distributor.address);

        const product = await supplyChain.getProduct(1);
        expect(product.currentOwner).to.equal(distributor.address);
        expect(product.status).to.equal(1); // InTransit
    });
});
