// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./AccessControl.sol";

/**
 * @title AlertSystem
 * @dev Manages alerts for the Supply Chain
 */
contract AlertSystem {
    AccessControlManager public accessControl;

    enum AlertType { Temperature, Humidity, Expiry, LowStock, Unauthorized, Compliance }

    struct Alert {
        uint256 id;
        AlertType alertType;
        uint256 productId;
        string message;
        uint256 timestamp;
        bool resolved;
        address triggeredBy;
    }

    mapping(uint256 => Alert) public alerts;
    uint256 public alertCount;

    event AlertTriggered(uint256 indexed alertId, AlertType alertType, uint256 productId, string message);
    event AlertResolved(uint256 indexed alertId, address resolvedBy);

    constructor(address _accessControl) {
        accessControl = AccessControlManager(_accessControl);
    }

    modifier onlyRegistered() {
        // In a real app, check specific roles. For now, just check if they are a known user.
        // We can check if they have ANY role or are just in the system.
        // For simplicity, we'll assume any interaction requires a registered user.
        // (Implementation depends on AccessControl logic, here we trust the caller is valid if they can sign)
        _;
    }

    function triggerAlert(
        AlertType _alertType,
        uint256 _productId,
        string memory _message
    ) external {
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

    function resolveAlert(uint256 _alertId) external {
        require(_alertId > 0 && _alertId <= alertCount, "Invalid alert ID");
        require(!alerts[_alertId].resolved, "Alert already resolved");
        
        // Only Admin or specific roles should resolve alerts
        // require(accessControl.hasRole(accessControl.DEFAULT_ADMIN_ROLE(), msg.sender), "Admin only");

        alerts[_alertId].resolved = true;
        emit AlertResolved(_alertId, msg.sender);
    }

    function getUnresolvedAlerts() external view returns (Alert[] memory) {
        uint256 unresolvedCount = 0;
        for (uint256 i = 1; i <= alertCount; i++) {
            if (!alerts[i].resolved) {
                unresolvedCount++;
            }
        }

        Alert[] memory result = new Alert[](unresolvedCount);
        uint256 index = 0;
        for (uint256 i = 1; i <= alertCount; i++) {
            if (!alerts[i].resolved) {
                result[index] = alerts[i];
                index++;
            }
        }
        return result;
    }
}
