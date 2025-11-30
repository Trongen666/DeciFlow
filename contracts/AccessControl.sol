// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/AccessControl.sol";

/**
 * @title AccessControlManager
 * @dev Centralized role management for the Supply Chain DApp
 */
contract AccessControlManager is AccessControl {
    bytes32 public constant MANUFACTURER_ROLE = keccak256("MANUFACTURER_ROLE");
    bytes32 public constant DISTRIBUTOR_ROLE = keccak256("DISTRIBUTOR_ROLE");
    bytes32 public constant RETAILER_ROLE = keccak256("RETAILER_ROLE");

    event UserRegistered(address indexed user, string name, string organization, bytes32 role);

    struct UserProfile {
        string name;
        string organization;
        bool isRegistered;
    }

    mapping(address => UserProfile) public users;

    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }

    /**
     * @dev Register a new user with a specific role.
     * Can only be called by an Admin (or self-register logic if enabled).
     * For this implementation, we allow open registration for demo purposes,
     * but in production, this should be gated.
     */
    function registerUser(string memory _name, string memory _organization, bytes32 _role) external {
        require(!users[msg.sender].isRegistered, "User already registered");
        // In a real app, you might restrict who can assign which roles
        // require(hasRole(DEFAULT_ADMIN_ROLE, msg.sender), "Admin only");

        _grantRole(_role, msg.sender);
        
        users[msg.sender] = UserProfile({
            name: _name,
            organization: _organization,
            isRegistered: true
        });

        emit UserRegistered(msg.sender, _name, _organization, _role);
    }

    function getUser(address _user) external view returns (UserProfile memory) {
        return users[_user];
    }
}
