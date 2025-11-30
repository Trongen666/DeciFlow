// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./SupplyChain.sol";

/**
 * @title InventoryManagement
 * @dev Handles batch operations and advanced inventory logic
 */
contract InventoryManagement {
    SupplyChain public supplyChain;

    constructor(address _supplyChain) {
        supplyChain = SupplyChain(_supplyChain);
    }

    /**
     * @dev Create multiple products in a single transaction (Batch Minting)
     */
    function batchCreateProducts(
        string[] memory _names,
        string[] memory _serials,
        string memory _batchNumber,
        SupplyChain.ProductCategory _category,
        uint256 _quantity,
        uint256 _unitCost,
        uint256 _expiryDate,
        bool _requiresTemperatureControl,
        int256 _minTemp,
        int256 _maxTemp
    ) external {
        require(_names.length == _serials.length, "Mismatched input lengths");
        
        for (uint256 i = 0; i < _names.length; i++) {
            supplyChain.createProduct(
                _names[i],
                _serials[i],
                _batchNumber,
                _category,
                _quantity,
                _unitCost,
                _expiryDate,
                _requiresTemperatureControl,
                _minTemp,
                _maxTemp
            );
        }
    }

    /**
     * @dev Split a large batch into smaller units (Logical split)
     * Note: In a real system, this might burn the parent token and mint new ones,
     * or just track sub-quantities. Here we simulate it by emitting an event.
     */
    event BatchSplit(uint256 indexed parentProductId, uint256[] newQuantities);

    function splitBatch(uint256 _productId, uint256[] memory _quantities) external {
        // Logic to verify ownership and total quantity matches
        // SupplyChain.Product memory p = supplyChain.getProduct(_productId);
        // require(p.currentOwner == msg.sender, "Not owner");
        
        // Emit event for off-chain tracking
        emit BatchSplit(_productId, _quantities);
    }
}
