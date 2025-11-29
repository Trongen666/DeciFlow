// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract SupplyChain {
    
    // --- DATA STRUCTURES ---
    struct Product {
        uint id;
        string name;
        string serialNumber;
        address currentOwner;
        address[] history;
    }

    mapping(uint => Product) public products;
    uint public productCount = 0;

    // --- NEW: ROLES (The Guest List) ---
    // Maps a Wallet Address -> A Role Name (e.g. "Manufacturer")
    mapping(address => string) public roles;

    // --- EVENTS ---
    event ProductCreated(uint id, string name, address indexed manufacturer);
    event ProductTransferred(uint id, address indexed from, address indexed to);
    event UserRegistered(address user, string role);

    // --- FUNCTIONS ---

    // 1. REGISTER FUNCTION (Login System)
    // Users call this ONCE to set their role
    function registerUser(string memory _role) public {
        // Require that they haven't registered yet (optional, but good for logic)
        // bytes(roles[msg.sender]).length == 0 checks if string is empty
        require(bytes(roles[msg.sender]).length == 0, "Error: You are already registered!");
        
        roles[msg.sender] = _role;
        emit UserRegistered(msg.sender, _role);
    }

    // 2. CREATE PRODUCT (Updated with Security)
    function createProduct(string memory _name, string memory _serial) public {
        // SECURITY: Only Manufacturers can create
        // We compare hash of strings because Solidity can't compare strings directly
        require(keccak256(bytes(roles[msg.sender])) == keccak256(bytes("Manufacturer")), "Error: Only Manufacturer can create!");

        productCount++;
        uint newId = productCount;

        Product storage newProduct = products[newId];
        newProduct.id = newId;
        newProduct.name = _name;
        newProduct.serialNumber = _serial;
        newProduct.currentOwner = msg.sender;
        newProduct.history.push(msg.sender);

        emit ProductCreated(newId, _name, msg.sender);
    }

    // 3. TRANSFER PRODUCT
    function transferProduct(uint _productId, address _newOwner) public {
        require(msg.sender == products[_productId].currentOwner, "Error: You are not the owner.");
        require(_newOwner != address(0), "Error: Invalid address.");

        products[_productId].currentOwner = _newOwner;
        products[_productId].history.push(_newOwner);

        emit ProductTransferred(_productId, msg.sender, _newOwner);
    }

    // 4. READ FUNCTIONS
    function getProductHistory(uint _productId) public view returns (address[] memory) {
        return products[_productId].history;
    }

    function getProduct(uint _productId) public view returns (uint, string memory, string memory, address) {
        Product memory p = products[_productId];
        return (p.id, p.name, p.serialNumber, p.currentOwner);
    }
}
