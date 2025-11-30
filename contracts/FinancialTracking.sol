// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./SupplyChain.sol";

/**
 * @title FinancialTracking
 * @dev Logs financial transactions and settlements on-chain
 */
contract FinancialTracking {
    SupplyChain public supplyChain;

    struct TransactionLog {
        uint256 id;
        uint256 productId;
        address from;
        address to;
        uint256 amount;
        string transactionType; // "Payment", "Refund", "Fee"
        uint256 timestamp;
    }

    mapping(uint256 => TransactionLog) public transactions;
    uint256 public transactionCount;

    event TransactionRecorded(uint256 indexed id, uint256 indexed productId, address indexed from, address to, uint256 amount);

    constructor(address _supplyChain) {
        supplyChain = SupplyChain(_supplyChain);
    }

    function recordTransaction(
        uint256 _productId,
        address _to,
        uint256 _amount,
        string memory _transactionType
    ) external {
        transactionCount++;
        
        transactions[transactionCount] = TransactionLog({
            id: transactionCount,
            productId: _productId,
            from: msg.sender,
            to: _to,
            amount: _amount,
            transactionType: _transactionType,
            timestamp: block.timestamp
        });

        emit TransactionRecorded(transactionCount, _productId, msg.sender, _to, _amount);
    }

    /**
     * @dev Settle payment on-chain (ETH transfer)
     */
    function settlePayment(uint256 _productId, address payable _to) external payable {
        require(msg.value > 0, "No value sent");
        
        // Transfer ETH to recipient
        (bool sent, ) = _to.call{value: msg.value}("");
        require(sent, "Failed to send Ether");

        // Log the settlement
        recordTransaction(_productId, _to, msg.value, "Settlement");
    }
}
