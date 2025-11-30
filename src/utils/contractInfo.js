import deployed from '../../deployed.json';

// Import ABIs (In a real setup, these would be imported from artifacts)
// For this demo, we'll use placeholders or assume they are available
// You might need to copy artifacts to src/artifacts during deployment
import SupplyChainABI from '../../artifacts/contracts/SupplyChain.sol/SupplyChain.json';
import AccessControlABI from '../../artifacts/contracts/AccessControl.sol/AccessControlManager.json';
import AlertSystemABI from '../../artifacts/contracts/AlertSystem.sol/AlertSystem.json';

export const getContractAddress = (contractName) => {
  if (!deployed.contracts[contractName]) {
    console.error(`Contract ${contractName} not found in deployed.json`);
    return null;
  }
  return deployed.contracts[contractName];
};

export const getContractABI = (contractName) => {
  switch (contractName) {
    case 'SupplyChain': return SupplyChainABI.abi;
    case 'AccessControl': return AccessControlABI.abi;
    case 'AlertSystem': return AlertSystemABI.abi;
    default: return [];
  }
};

export const CHAIN_ID = deployed.chainId;