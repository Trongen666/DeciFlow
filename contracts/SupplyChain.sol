// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract SupplyChain {
    
    struct Product {
        uint id;
        string name;
        string serialNumber;
        address currentOwner;
        address[] history;
    }

    mapping(uint => Product) public products;
    uint public productCount = 0;

    // Role of each address: "Manufacturer", "Distributor", "Retailer", "Customer"
    mapping(address => string) public roles;

    // NEW: per-user, per-product status
    // Example:
    // - statuses[manufacturer][productId] = "In Warehouse" or "Transferred"
    // - statuses[distributor][productId] = "In Warehouse" or "Transferred"
    mapping(address => mapping(uint => string)) public statuses;

    event ProductCreated(uint id, string name, address indexed manufacturer);
    event ProductTransferred(uint id, address indexed from, address indexed to);
    event UserRegistered(address user, string role);

    // --- REGISTER USER ---
    function registerUser(string memory _role) public {
        require(
            bytes(roles[msg.sender]).length == 0,
            "Error: You are already registered!"
        );
        roles[msg.sender] = _role;
        emit UserRegistered(msg.sender, _role);
    }

    // --- CREATE PRODUCT (MANUFACTURER) ---
    function createProduct(string memory _name, string memory _serial) public {
        require(
            keccak256(bytes(roles[msg.sender])) ==
                keccak256(bytes("Manufacturer")),
            "Error: Only Manufacturer can create!"
        );

        productCount++;
        uint newId = productCount;

        Product storage newProduct = products[newId];
        newProduct.id = newId;
        newProduct.name = _name;
        newProduct.serialNumber = _serial;
        newProduct.currentOwner = msg.sender;
        newProduct.history.push(msg.sender);

        // Manufacturer's view: this product is currently in *their* warehouse
        statuses[msg.sender][newId] = "In Warehouse";

        emit ProductCreated(newId, _name, msg.sender);
    }

    // --- TRANSFER PRODUCT ---
    function transferProduct(uint _productId, address _newOwner) public {
        require(
            msg.sender == products[_productId].currentOwner,
            "Error: You are not the owner."
        );
        require(_newOwner != address(0), "Error: Invalid address.");

        // Update current owner
        products[_productId].currentOwner = _newOwner;
        products[_productId].history.push(_newOwner);

        // Sender's view: product has been transferred out
        statuses[msg.sender][_productId] = "Transferred";

        // Receiver's view: product is now in their warehouse
        statuses[_newOwner][_productId] = "In Warehouse";

        emit ProductTransferred(_productId, msg.sender, _newOwner);
    }

    // --- READ HISTORY ---
    function getProductHistory(uint _productId)
        public
        view
        returns (address[] memory)
    {
        return products[_productId].history;
    }

    // --- READ PRODUCT + CALLER-SPECIFIC STATUS ---
    // NOTE: 5th return value is *status for msg.sender*
    function getProduct(uint _productId)
        public
        view
        returns (
            uint,
            string memory,
            string memory,
            address,
            string memory
        )
    {
        Product memory p = products[_productId];
        string memory myStatus = statuses[msg.sender][_productId];
        return (p.id, p.name, p.serialNumber, p.currentOwner, myStatus);
    }
}
