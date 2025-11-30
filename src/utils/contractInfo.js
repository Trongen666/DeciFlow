// src/utils/contractInfo.js
// Utility to expose contract addresses and ABIs to the frontend.
// Adjust paths if your build setup copies artifacts elsewhere.
import deployed from "../../deployed.json";

// Import ABIs (these paths assume artifacts are copied to src/artifacts)
import SupplyChainABI from "../../artifacts/contracts/SupplyChain.sol/SupplyChain.json";
import AccessControlABI from "../../artifacts/contracts/AccessControl.sol/AccessControlManager.json";
import AlertSystemABI from "../../artifacts/contracts/AlertSystem.sol/AlertSystem.json";

// Helper to get address from deployed.json
export const getContractAddress = (contractName) => {
  if (!deployed.contracts[contractName]) {
    console.error(`Contract ${contractName} not found in deployed.json`);
    return null;
  }
  return deployed.contracts[contractName];
};

// Helper to get ABI
export const getContractABI = (contractName) => {
  switch (contractName) {
    case "SupplyChain":
      return SupplyChainABI.abi;
    case "AccessControl":
      return AccessControlABI.abi;
    case "AlertSystem":
      return AlertSystemABI.abi;
    default:
      return [];
  }
};

// ----- Named exports used by the UI -----
export const CONTRACT_ADDRESS = getContractAddress("SupplyChain");
export const CONTRACT_ABI = getContractABI("SupplyChain");

export const CHAIN_ID = deployed.chainId;