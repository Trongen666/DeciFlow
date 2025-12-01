// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./IStructs.sol";

/**
 * @title LifecycleRegistry
 * @dev Separate registry to store and emit lifecycle steps for products.
 * This avoids changing SupplyChain storage layout and provides rich lifecycle history
 * without modifying the existing public state variables.
 */
contract LifecycleRegistry {
    // Small struct capturing a lifecycle step
    struct LifecycleStep {
        uint8 stage;
        string name;
        uint256 timestamp;
        address actor;
        string note;
    }

    // productId => steps
    mapping(uint256 => LifecycleStep[]) internal history;

    // Events for external listeners / UI
    event LifecycleStepAdded(uint256 indexed productId, uint8 stage, string name, uint256 timestamp, address indexed actor, string note);
    event ProductStageAdvanced(uint256 indexed productId, uint8 oldStage, uint8 newStage, uint256 timestamp, address indexed actor);

    // Reference to the SupplyChain contract to validate ownership/manufacturer
    address public supplyChainAddress;

    constructor(address _supplyChain) {
        require(_supplyChain != address(0), "supplyChain required");
        supplyChainAddress = _supplyChain;
    }

    // Helper interface to read product from SupplyChain without depending on its complex types
    interface ISupplyChainReader {
        function getProduct(uint256 _productId) external view returns (
            uint256 id,
            string memory name,
            string memory serialNumber,
            string memory batchNumber,
            IStructs.ProductCategory category,
            IStructs.ProductStatus status,
            address currentOwner,
            address manufacturer,
            uint256 quantity,
            uint256 unitCost,
            uint256 createdAt,
            uint256 expiryDate,
            bool requiresTemperatureControl,
            int256 minTemperature,
            int256 maxTemperature
        );
    }

    /**
     * @dev Add a lifecycle step for a product.
     * Only the current owner or the original manufacturer may add steps to the product lifecycle.
     */
    function addLifecycleStep(uint256 productId, uint8 stage, string calldata name, string calldata note) external {
        ISupplyChainReader sc = ISupplyChainReader(supplyChainAddress);
        (
            , , , , , IStructs.ProductStatus currentStatus, address currentOwner, address manufacturer, , , , , , ,
        ) = sc.getProduct(productId);

        require(msg.sender == currentOwner || msg.sender == manufacturer, "Not owner or manufacturer");

        uint256 ts = block.timestamp;
        history[productId].push(LifecycleStep(stage, name, ts, msg.sender, note));

        emit LifecycleStepAdded(productId, stage, name, ts, msg.sender, note);

        uint8 prevStage = uint8(currentStatus);
        if (stage != prevStage) {
            emit ProductStageAdvanced(productId, prevStage, stage, ts, msg.sender);
        }
    }

    function getHistoryLength(uint256 productId) external view returns (uint256) {
        return history[productId].length;
    }

    function getHistoryEntry(uint256 productId, uint256 idx) external view returns (uint8 stage, string memory name, uint256 timestamp, address actor, string memory note) {
        require(idx < history[productId].length, "index out of bounds");
        LifecycleStep storage s = history[productId][idx];
        return (s.stage, s.name, s.timestamp, s.actor, s.note);
    }
}
