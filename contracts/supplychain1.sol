// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract SupplyChain {
    
    // --- ENUMS ---
    enum ProductCategory { DryGoods, Perishable, Hazmat, Bulk, RawMaterial, WIP, FinishedGood, MRO, Packaging }
    enum Role { Guest, Manufacturer, Distributor, Retailer, Customer, Admin }
    enum AlertType { Temperature, Humidity, Expiry, LowStock, Unauthorized, Compliance }
    
    // --- STRUCTS ---
    struct User {
        address userAddress;
        Role role;
        string name;
        string organization;
        bool isActive;
        uint256 registeredAt;
    }
    
    struct Product {
        uint256 id;
        string name;
        string serialNumber;
        string batchNumber;
        ProductCategory category;
        address currentOwner;
        address manufacturer;
        uint256 quantity;
        uint256 unitCost;
        uint256 createdAt;
        uint256 expiryDate;
        bool requiresTemperatureControl;
        int256 minTemperature;
        int256 maxTemperature;
        bool isActive;
    }
    
    struct Transaction {
        uint256 id;
        uint256 productId;
        address from;
        address to;
        uint256 quantity;
        uint256 cost;
        uint256 timestamp;
        string transactionType;
        string notes;
    }
    
    struct EnvironmentalReading {
        uint256 productId;
        int256 temperature;
        uint256 humidity;
        uint256 timestamp;
        address recordedBy;
    }
    
    struct Alert {
        uint256 id;
        AlertType alertType;
        uint256 productId;
        string message;
        uint256 timestamp;
        bool resolved;
        address triggeredBy;
    }
    
    struct FinancialSummary {
        uint256 totalRevenue;
        uint256 totalCosts;
        uint256 inventoryValue;
        uint256 period;
    }
    
    // --- STATE VARIABLES ---
    mapping(address => User) public users;
    mapping(uint256 => Product) public products;
    mapping(uint256 => address[]) public productHistory;
    mapping(uint256 => Transaction[]) public productTransactions;
    mapping(uint256 => EnvironmentalReading[]) public environmentalReadings;
    mapping(uint256 => Alert) public alerts;
    
    uint256 public productCount = 0;
    uint256 public transactionCount = 0;
    uint256 public alertCount = 0;
    
    address public admin;
    
    // --- EVENTS ---
    event UserRegistered(address indexed user, Role role, string name);
    event ProductCreated(uint256 indexed id, string name, address indexed manufacturer, ProductCategory category);
    event ProductTransferred(uint256 indexed id, address indexed from, address indexed to, uint256 quantity);
    event TransactionRecorded(uint256 indexed transactionId, uint256 indexed productId, address from, address to);
    event EnvironmentalDataRecorded(uint256 indexed productId, int256 temperature, uint256 humidity);
    event AlertTriggered(uint256 indexed alertId, AlertType alertType, uint256 productId, string message);
    event AlertResolved(uint256 indexed alertId);
    
    // --- MODIFIERS ---
    modifier onlyAdmin() {
        require(users[msg.sender].role == Role.Admin, "Admin access required");
        _;
    }
    
    modifier onlyManufacturer() {
        require(users[msg.sender].role == Role.Manufacturer, "Manufacturer access required");
        _;
    }
    
    modifier onlyRegistered() {
        require(users[msg.sender].role != Role.Guest, "Registration required");
        _;
    }
    
    modifier validProduct(uint256 _productId) {
        require(_productId > 0 && _productId <= productCount, "Invalid product ID");
        require(products[_productId].isActive, "Product is inactive");
        _;
    }
    
    // --- CONSTRUCTOR ---
    constructor() {
        admin = msg.sender;
        users[msg.sender] = User({
            userAddress: msg.sender,
            role: Role.Admin,
            name: "Admin",
            organization: "System",
            isActive: true,
            registeredAt: block.timestamp
        });
    }
    
    // --- USER MANAGEMENT ---
    function registerUser(
        string memory _name,
        string memory _organization,
        Role _role
    ) public {
        require(users[msg.sender].role == Role.Guest, "Already registered");
        require(_role != Role.Admin, "Cannot self-register as admin");
        
        users[msg.sender] = User({
            userAddress: msg.sender,
            role: _role,
            name: _name,
            organization: _organization,
            isActive: true,
            registeredAt: block.timestamp
        });
        
        emit UserRegistered(msg.sender, _role, _name);
    }
    
    function updateUserRole(address _user, Role _newRole) public onlyAdmin {
        require(users[_user].isActive, "User not active");
        users[_user].role = _newRole;
    }
    
    // --- PRODUCT MANAGEMENT ---
    function createProduct(
        string memory _name,
        string memory _serialNumber,
        string memory _batchNumber,
        ProductCategory _category,
        uint256 _quantity,
        uint256 _unitCost,
        uint256 _expiryDate,
        bool _requiresTemperatureControl,
        int256 _minTemp,
        int256 _maxTemp
    ) public onlyManufacturer {
        productCount++;
        
        products[productCount] = Product({
            id: productCount,
            name: _name,
            serialNumber: _serialNumber,
            batchNumber: _batchNumber,
            category: _category,
            currentOwner: msg.sender,
            manufacturer: msg.sender,
            quantity: _quantity,
            unitCost: _unitCost,
            createdAt: block.timestamp,
            expiryDate: _expiryDate,
            requiresTemperatureControl: _requiresTemperatureControl,
            minTemperature: _minTemp,
            maxTemperature: _maxTemp,
            isActive: true
        });
        
        productHistory[productCount].push(msg.sender);
        
        emit ProductCreated(productCount, _name, msg.sender, _category);
    }
    
    function transferProduct(
        uint256 _productId,
        address _newOwner,
        uint256 _quantity,
        uint256 _transferCost,
        string memory _notes
    ) public validProduct(_productId) {
        Product storage product = products[_productId];
        require(msg.sender == product.currentOwner, "Not the owner");
        require(_quantity <= product.quantity, "Insufficient quantity");
        require(users[_newOwner].isActive, "Recipient not registered");
        
        transactionCount++;
        
        productTransactions[_productId].push(Transaction({
            id: transactionCount,
            productId: _productId,
            from: msg.sender,
            to: _newOwner,
            quantity: _quantity,
            cost: _transferCost,
            timestamp: block.timestamp,
            transactionType: "Transfer",
            notes: _notes
        }));
        
        product.currentOwner = _newOwner;
        product.quantity = _quantity;
        productHistory[_productId].push(_newOwner);
        
        emit ProductTransferred(_productId, msg.sender, _newOwner, _quantity);
        emit TransactionRecorded(transactionCount, _productId, msg.sender, _newOwner);
    }
    
    // --- ENVIRONMENTAL MONITORING ---
    function recordEnvironmentalData(
        uint256 _productId,
        int256 _temperature,
        uint256 _humidity
    ) public onlyRegistered validProduct(_productId) {
        Product storage product = products[_productId];
        
        environmentalReadings[_productId].push(EnvironmentalReading({
            productId: _productId,
            temperature: _temperature,
            humidity: _humidity,
            timestamp: block.timestamp,
            recordedBy: msg.sender
        }));
        
        emit EnvironmentalDataRecorded(_productId, _temperature, _humidity);
        
        // Check temperature thresholds
        if (product.requiresTemperatureControl) {
            if (_temperature < product.minTemperature || _temperature > product.maxTemperature) {
                triggerAlert(
                    AlertType.Temperature,
                    _productId,
                    "Temperature out of range"
                );
            }
        }
    }
    
    // --- ALERT SYSTEM ---
    function triggerAlert(
        AlertType _alertType,
        uint256 _productId,
        string memory _message
    ) public onlyRegistered {
        alertCount++;
        
        alerts[alertCount] = Alert({
            id: alertCount,
            alertType: _alertType,
            productId: _productId,
            message: _message,
            timestamp: block.timestamp,
            resolved: false,
            triggeredBy: msg.sender
        });
        
        emit AlertTriggered(alertCount, _alertType, _productId, _message);
    }
    
    function resolveAlert(uint256 _alertId) public onlyRegistered {
        require(_alertId > 0 && _alertId <= alertCount, "Invalid alert ID");
        alerts[_alertId].resolved = true;
        emit AlertResolved(_alertId);
    }
    
    // --- FINANCIAL TRACKING ---
    function recordTransaction(
        uint256 _productId,
        address _to,
        uint256 _quantity,
        uint256 _cost,
        string memory _transactionType,
        string memory _notes
    ) public onlyRegistered validProduct(_productId) {
        transactionCount++;
        
        productTransactions[_productId].push(Transaction({
            id: transactionCount,
            productId: _productId,
            from: msg.sender,
            to: _to,
            quantity: _quantity,
            cost: _cost,
            timestamp: block.timestamp,
            transactionType: _transactionType,
            notes: _notes
        }));
        
        emit TransactionRecorded(transactionCount, _productId, msg.sender, _to);
    }
    
    // --- VIEW FUNCTIONS ---
    function getProduct(uint256 _productId) public view validProduct(_productId) returns (Product memory) {
        return products[_productId];
    }
    
    function getProductHistory(uint256 _productId) public view returns (address[] memory) {
        return productHistory[_productId];
    }
    
    function getProductTransactions(uint256 _productId) public view returns (Transaction[] memory) {
        return productTransactions[_productId];
    }
    
    function getEnvironmentalReadings(uint256 _productId) public view returns (EnvironmentalReading[] memory) {
        return environmentalReadings[_productId];
    }
    
    function getUnresolvedAlerts() public view returns (Alert[] memory) {
        uint256 unresolvedCount = 0;
        
        for (uint256 i = 1; i <= alertCount; i++) {
            if (!alerts[i].resolved) {
                unresolvedCount++;
            }
        }
        
        Alert[] memory unresolvedAlerts = new Alert[](unresolvedCount);
        uint256 index = 0;
        
        for (uint256 i = 1; i <= alertCount; i++) {
            if (!alerts[i].resolved) {
                unresolvedAlerts[index] = alerts[i];
                index++;
            }
        }
        
        return unresolvedAlerts;
    }
    
    function getUserRole(address _user) public view returns (Role) {
        return users[_user].role;
    }
    
    function getTotalInventoryValue() public view returns (uint256) {
        uint256 totalValue = 0;
        for (uint256 i = 1; i <= productCount; i++) {
            if (products[i].isActive) {
                totalValue += products[i].quantity * products[i].unitCost;
            }
        }
        return totalValue;
    }
}