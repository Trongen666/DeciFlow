// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./AccessControl.sol";
import "./AlertSystem.sol";

/**
 * @title SupplyChain
 * @dev Core product lifecycle management
 */
contract SupplyChain {
    AccessControlManager public accessControl;
    AlertSystem public alertSystem;

    enum ProductCategory { DryGoods, Perishable, Hazmat, Bulk, RawMaterial, WIP, FinishedGood, MRO, Packaging }
    enum ProductStatus { Created, InTransit, Stored, Delivered, Consumed, Spoiled }

    struct Product {
        uint256 id;
        string name;
        string serialNumber;
        string batchNumber;
        ProductCategory category;
        ProductStatus status;
        address currentOwner;
        address manufacturer;
        uint256 quantity;
        uint256 unitCost;
        uint256 createdAt;
        uint256 expiryDate;
        bool requiresTemperatureControl;
        int256 minTemperature;
        int256 maxTemperature;
    }

    struct EnvironmentalReading {
        uint256 productId;
        int256 temperature;
        uint256 humidity;
        uint256 timestamp;
        address recordedBy;
    }

    mapping(uint256 => Product) public products;
    mapping(uint256 => address[]) public productHistory;
    mapping(uint256 => EnvironmentalReading[]) public environmentalReadings;
    
    uint256 public productCount;

    event ProductCreated(uint256 indexed id, string name, address indexed manufacturer);
    event ProductTransferred(uint256 indexed id, address indexed from, address indexed to, ProductStatus status);
    event EnvironmentalDataRecorded(uint256 indexed productId, int256 temperature, uint256 humidity);
    event ProductStatusUpdated(uint256 indexed id, ProductStatus status);

    constructor(address _accessControl, address _alertSystem) {
        accessControl = AccessControlManager(_accessControl);
        alertSystem = AlertSystem(_alertSystem);
    }

    modifier onlyManufacturer() {
        require(accessControl.hasRole(accessControl.MANUFACTURER_ROLE(), msg.sender), "Manufacturer only");
        _;
    }

    modifier onlyProductOwner(uint256 _productId) {
        require(products[_productId].currentOwner == msg.sender, "Not product owner");
        _;
    }

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
    ) external onlyManufacturer {
        productCount++;
        
        products[productCount] = Product({
            id: productCount,
            name: _name,
            serialNumber: _serialNumber,
            batchNumber: _batchNumber,
            category: _category,
            status: ProductStatus.Created,
            currentOwner: msg.sender,
            manufacturer: msg.sender,
            quantity: _quantity,
            unitCost: _unitCost,
            createdAt: block.timestamp,
            expiryDate: _expiryDate,
            requiresTemperatureControl: _requiresTemperatureControl,
            minTemperature: _minTemp,
            maxTemperature: _maxTemp
        });

        productHistory[productCount].push(msg.sender);

        emit ProductCreated(productCount, _name, msg.sender);
    }

    function transferProduct(uint256 _productId, address _to) external onlyProductOwner(_productId) {
        require(_to != address(0), "Invalid recipient");
        
        // In a strict system, we'd check if _to is a registered user
        // require(accessControl.getUser(_to).isRegistered, "Recipient not registered");

        products[_productId].currentOwner = _to;
        products[_productId].status = ProductStatus.InTransit; // Default to InTransit on transfer
        productHistory[_productId].push(_to);

        emit ProductTransferred(_productId, msg.sender, _to, ProductStatus.InTransit);
    }

    function updateProductStatus(uint256 _productId, ProductStatus _status) external onlyProductOwner(_productId) {
        products[_productId].status = _status;
        emit ProductStatusUpdated(_productId, _status);
    }

    function recordEnvironmentalData(
        uint256 _productId,
        int256 _temperature,
        uint256 _humidity
    ) external {
        // Anyone with access (e.g., carrier, IoT oracle) can record data
        // For now, we allow any registered user or the owner
        
        environmentalReadings[_productId].push(EnvironmentalReading({
            productId: _productId,
            temperature: _temperature,
            humidity: _humidity,
            timestamp: block.timestamp,
            recordedBy: msg.sender
        }));

        emit EnvironmentalDataRecorded(_productId, _temperature, _humidity);

        // Check thresholds
        Product memory p = products[_productId];
        if (p.requiresTemperatureControl) {
            if (_temperature < p.minTemperature || _temperature > p.maxTemperature) {
                alertSystem.triggerAlert(
                    AlertSystem.AlertType.Temperature,
                    _productId,
                    "Temperature violation detected"
                );
            }
        }
    }

    // View functions
    function getProduct(uint256 _productId) external view returns (Product memory) {
        return products[_productId];
    }

    function getProductHistory(uint256 _productId) external view returns (address[] memory) {
        return productHistory[_productId];
    }

    function getEnvironmentalReadings(uint256 _productId) external view returns (EnvironmentalReading[] memory) {
        return environmentalReadings[_productId];
    }
}
