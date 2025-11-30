// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./AccessControl.sol";
import "./AlertSystem.sol";
import "./IStructs.sol";

/**
 * @title SupplyChain
 * @dev Core product lifecycle management
 */
contract SupplyChain {
    AccessControlManager public accessControl;
    AlertSystem public alertSystem;

    struct Product {
        uint256 id;
        string name;
        string serialNumber;
        string batchNumber;
        IStructs.ProductCategory category;
        IStructs.ProductStatus status;
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
    event ProductTransferred(uint256 indexed id, address indexed from, address indexed to, IStructs.ProductStatus status);
    event EnvironmentalDataRecorded(uint256 indexed productId, int256 temperature, uint256 humidity);
    event ProductStatusUpdated(uint256 indexed id, IStructs.ProductStatus status);

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

    // createProduct uses a single storage pointer to reduce stack usage
    function createProduct(IStructs.ProductParams memory params) external onlyManufacturer {
        productCount++;

        Product storage p = products[productCount];
        p.id = productCount;
        p.name = params.name;
        p.serialNumber = params.serialNumber;
        p.batchNumber = params.batchNumber;
        p.category = params.category;
        p.status = IStructs.ProductStatus.Created;
        p.currentOwner = msg.sender;
        p.manufacturer = msg.sender;
        p.quantity = params.quantity;
        p.unitCost = params.unitCost;
        p.createdAt = block.timestamp;
        p.expiryDate = params.expiryDate;
        p.requiresTemperatureControl = params.requiresTemperatureControl;
        p.minTemperature = params.minTemperature;
        p.maxTemperature = params.maxTemperature;

        productHistory[productCount].push(msg.sender);

        emit ProductCreated(productCount, params.name, msg.sender);
    }

    function transferProduct(uint256 _productId, address _to) external onlyProductOwner(_productId) {
        require(_to != address(0), "Invalid recipient");
        products[_productId].currentOwner = _to;
        products[_productId].status = IStructs.ProductStatus.InTransit;
        productHistory[_productId].push(_to);
        emit ProductTransferred(_productId, msg.sender, _to, IStructs.ProductStatus.InTransit);
    }

    function updateProductStatus(uint256 _productId, IStructs.ProductStatus _status) external onlyProductOwner(_productId) {
        products[_productId].status = _status;
        emit ProductStatusUpdated(_productId, _status);
    }

    /// Public function minimized — pushes reading and delegates checks to tiny internal helper
    function recordEnvironmentalData(
        uint256 _productId,
        int256 _temperature,
        uint256 _humidity
    ) external {
        environmentalReadings[_productId].push(
            EnvironmentalReading({
                productId: _productId,
                temperature: _temperature,
                humidity: _humidity,
                timestamp: block.timestamp,
                recordedBy: msg.sender
            })
        );

        emit EnvironmentalDataRecorded(_productId, _temperature, _humidity);

        // Delegate threshold checks to a small internal function that accepts just two args.
        _checkTemperatureAndTriggerAlert(_productId, _temperature);
    }

    // small internal helper to reduce stack pressure in the external function
    function _checkTemperatureAndTriggerAlert(uint256 _productId, int256 _temperature) internal {
        // Read only the necessary fields from storage via a single pointer
        Product storage prod = products[_productId];

        // Only check if temperature control is required
        if (!prod.requiresTemperatureControl) {
            return;
        }

        if (_temperature < prod.minTemperature || _temperature > prod.maxTemperature) {
            // Compose a short message literal here to avoid extra locals
            alertSystem.triggerAlert(
                AlertSystem.AlertType.Temperature,
                _productId,
                "Temperature violation detected"
            );
        }
    }

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
