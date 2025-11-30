// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./SupplyChain.sol";
import "./IStructs.sol";

/**
 * @title InventoryManagement
 * @dev Handles batch operations and advanced inventory logic
 */
contract InventoryManagement {
    SupplyChain public supplyChainContract;

    constructor(address _supplyChain) {
        supplyChainContract = SupplyChain(_supplyChain);
    }

    /**
     * @dev Create multiple products in a single transaction (Batch Minting)
     */
    function batchCreateProducts(
        string[] memory _names,
        string[] memory _serials,
        string memory _batchNumber,
        IStructs.ProductCategory _category,
        uint256 _quantity,
        uint256 _unitCost,
        uint256 _expiryDate,
        bool _requiresTemperatureControl,
        int256 _minTemp,
        int256 _maxTemp
    ) external {
        require(_names.length == _serials.length, "Mismatched input lengths");

        for (uint256 i = 0; i < _names.length; i++) {
            IStructs.ProductParams memory params = IStructs.ProductParams({
                name: _names[i],
                serialNumber: _serials[i],
                batchNumber: _batchNumber,
                category: _category,
                quantity: _quantity,
                unitCost: _unitCost,
                expiryDate: _expiryDate,
                requiresTemperatureControl: _requiresTemperatureControl,
                minTemperature: _minTemp,
                maxTemperature: _maxTemp
            });

            supplyChainContract.createProduct(params);
        }
    }

    /**
     * @dev Split a large batch into smaller units for tracking
     */
    event BatchSplit(uint256 indexed parentProductId, uint256[] newQuantities);

    function splitBatch(uint256 _productId, uint256[] memory _quantities) external {
        emit BatchSplit(_productId, _quantities);
    }
}
