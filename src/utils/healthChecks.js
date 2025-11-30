import { ethers } from 'ethers';

export async function runHealthChecks({ 
  requiredChainId, 
  contractAddress, 
  contractABI 
}) {
  const results = [];

  // 1. Check if MetaMask is installed
  const hasWallet = !!window.ethereum;
  results.push({ 
    name: 'MetaMask Installed', 
    ok: hasWallet,
    category: 'wallet',
    severity: 'critical'
  });

  if (!hasWallet) {
    results.push({
      name: 'Wallet Provider',
      ok: false,
      category: 'wallet',
      severity: 'critical',
      error: 'Please install MetaMask browser extension',
      action: 'Install MetaMask'
    });
    return results;
  }

  try {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();

    // 2. Check account access
    try {
      const accounts = await window.ethereum.request({ 
        method: 'eth_requestAccounts' 
      });
      const address = accounts[0];
      results.push({ 
        name: 'Account Connected', 
        ok: !!address,
        category: 'wallet',
        severity: 'critical',
        info: address ? `${address.substring(0, 6)}...${address.substring(38)}` : 'No account'
      });

      // 2a. Get balance
      if (address) {
        const balance = await provider.getBalance(address);
        const ethBalance = parseFloat(ethers.utils.formatEther(balance)).toFixed(4);
        results.push({
          name: 'Wallet Balance',
          ok: parseFloat(ethBalance) > 0,
          category: 'wallet',
          severity: 'warning',
          info: `${ethBalance} ETH`,
          warning: parseFloat(ethBalance) === 0 ? 'Insufficient funds for transactions' : null
        });
      }
    } catch (e) {
      results.push({ 
        name: 'Account Access', 
        ok: false,
        category: 'wallet',
        severity: 'critical',
        error: e.message,
        action: 'Connect Wallet'
      });
      return results;
    }

    // 3. Signature verification test
    try {
      const address = await signer.getAddress();
      const message = `Health check signature test: ${Date.now()}`;
      const signature = await signer.signMessage(message);
      const recovered = ethers.utils.verifyMessage(message, signature);
      
      results.push({ 
        name: 'Signature Verification', 
        ok: recovered.toLowerCase() === address.toLowerCase(),
        category: 'wallet',
        severity: 'high',
        info: 'Cryptographic signing working correctly'
      });
    } catch (e) {
      results.push({ 
        name: 'Signature Test', 
        ok: false,
        category: 'wallet',
        severity: 'high',
        error: e.message
      });
    }

    // 4. Network check
    try {
      const network = await provider.getNetwork();
      const isCorrectNetwork = network.chainId === requiredChainId;
      
      results.push({ 
        name: 'Network Match', 
        ok: isCorrectNetwork,
        category: 'network',
        severity: 'critical',
        info: `Connected: Chain ${network.chainId} (${network.name || 'Unknown'})`,
        warning: !isCorrectNetwork ? `Required: Chain ${requiredChainId}` : null,
        action: !isCorrectNetwork ? 'Switch Network' : null
      });
    } catch (e) {
      results.push({ 
        name: 'Network Check', 
        ok: false,
        category: 'network',
        severity: 'critical',
        error: e.message
      });
    }

    // 5. Block freshness
    try {
      const blockNumber = await provider.getBlockNumber();
      const block = await provider.getBlock(blockNumber);
      const blockAge = Date.now() / 1000 - block.timestamp;
      const isFresh = blockAge < 60; // Less than 60 seconds old
      
      results.push({ 
        name: 'Chain Synchronization', 
        ok: isFresh,
        category: 'network',
        severity: 'high',
        info: `Block #${blockNumber} (${Math.round(blockAge)}s ago)`,
        warning: !isFresh ? 'Chain may be out of sync' : null
      });
    } catch (e) {
      results.push({ 
        name: 'Block Sync', 
        ok: false,
        category: 'network',
        severity: 'high',
        error: e.message
      });
    }

    // 6. Gas price check
    try {
      const feeData = await provider.getFeeData();
      const gasPriceGwei = parseFloat(ethers.utils.formatUnits(feeData.gasPrice, 'gwei')).toFixed(2);
      
      results.push({ 
        name: 'Gas Price Available', 
        ok: true,
        category: 'network',
        severity: 'medium',
        info: `${gasPriceGwei} Gwei`
      });
    } catch (e) {
      results.push({ 
        name: 'Gas Price', 
        ok: false,
        category: 'network',
        severity: 'medium',
        error: e.message
      });
    }

    // 7. Contract reachability
    if (contractAddress && contractABI) {
      try {
        const contract = new ethers.Contract(contractAddress, contractABI, provider);
        
        // Test read function
        const productCount = await contract.productCount();
        results.push({ 
          name: 'Contract Reachable', 
          ok: true,
          category: 'contract',
          severity: 'critical',
          info: `${productCount.toString()} products on-chain`
        });

        // Check if contract has code
        const code = await provider.getCode(contractAddress);
        const hasCode = code !== '0x';
        results.push({
          name: 'Contract Deployed',
          ok: hasCode,
          category: 'contract',
          severity: 'critical',
          info: hasCode ? 'Contract code verified' : 'No code at address'
        });

      } catch (e) {
        results.push({ 
          name: 'Contract Access', 
          ok: false,
          category: 'contract',
          severity: 'critical',
          error: e.message,
          action: 'Verify contract address'
        });
      }
    } else {
      results.push({
        name: 'Contract Configuration',
        ok: false,
        category: 'contract',
        severity: 'critical',
        error: 'Contract address or ABI not configured'
      });
    }

    // 8. Event query test
    if (contractAddress && contractABI) {
      try {
        const contract = new ethers.Contract(contractAddress, contractABI, provider);
        const currentBlock = await provider.getBlockNumber();
        const fromBlock = Math.max(0, currentBlock - 1000);
        
        // Try to query recent events
        const filter = contract.filters.ProductCreated();
        const events = await contract.queryFilter(filter, fromBlock, currentBlock);
        
        results.push({
          name: 'Event Indexing',
          ok: true,
          category: 'contract',
          severity: 'medium',
          info: `${events.length} events found (last 1000 blocks)`
        });
      } catch (e) {
        results.push({
          name: 'Event Query',
          ok: false,
          category: 'contract',
          severity: 'medium',
          error: e.message
        });
      }
    }

  } catch (e) {
    results.push({
      name: 'Provider Initialization',
      ok: false,
      category: 'network',
      severity: 'critical',
      error: e.message
    });
  }

  return results;
}

export function getCategoryIcon(category) {
  const icons = {
    wallet: '👛',
    network: '🌐',
    contract: '📜'
  };
  return icons[category] || '🔧';
}

export function getSeverityColor(severity) {
  const colors = {
    critical: 'danger',
    high: 'warning',
    medium: 'info',
    low: 'secondary'
  };
  return colors[severity] || 'secondary';
}

export async function switchNetwork(chainId) {
  try {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: `0x${chainId.toString(16)}` }],
    });
    return { success: true };
  } catch (error) {
    // This error code indicates that the chain has not been added to MetaMask
    if (error.code === 4902) {
      return { 
        success: false, 
        error: 'Network not added to MetaMask',
        code: 4902
      };
    }
    return { 
      success: false, 
      error: error.message 
    };
  }
}

export async function addNetwork(networkConfig) {
  try {
    await window.ethereum.request({
      method: 'wallet_addEthereumChain',
      params: [networkConfig],
    });
    return { success: true };
  } catch (error) {
    return { 
      success: false, 
      error: error.message 
    };
  }
}