import React, { createContext, useContext, useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { getContractAddress, getContractABI, CHAIN_ID } from '../utils/contractInfo';

const Web3Context = createContext();

export const useWeb3 = () => useContext(Web3Context);

export const Web3Provider = ({ children }) => {
    const [account, setAccount] = useState(null);
    const [provider, setProvider] = useState(null);
    const [signer, setSigner] = useState(null);
    const [contracts, setContracts] = useState({});
    const [chainId, setChainId] = useState(null);

    const connectWallet = async () => {
        if (window.ethereum) {
            try {
                const web3Provider = new ethers.providers.Web3Provider(window.ethereum);
                const accounts = await web3Provider.send("eth_requestAccounts", []);
                const network = await web3Provider.getNetwork();

                setProvider(web3Provider);
                setSigner(web3Provider.getSigner());
                setAccount(accounts[0]);
                setChainId(network.chainId);

                // Initialize Contracts
                const signer = web3Provider.getSigner();
                const sc = new ethers.Contract(getContractAddress('SupplyChain'), getContractABI('SupplyChain'), signer);
                const ac = new ethers.Contract(getContractAddress('AccessControl'), getContractABI('AccessControl'), signer);

                setContracts({
                    SupplyChain: sc,
                    AccessControl: ac
                });

            } catch (error) {
                console.error("Connection failed", error);
            }
        } else {
            alert("Please install MetaMask!");
        }
    };

    useEffect(() => {
        if (window.ethereum) {
            window.ethereum.on('accountsChanged', (accounts) => setAccount(accounts[0]));
            window.ethereum.on('chainChanged', (id) => setChainId(parseInt(id)));
        }
    }, []);

    return (
        <Web3Context.Provider value={{ account, provider, signer, contracts, chainId, connectWallet }}>
            {children}
        </Web3Context.Provider>
    );
};
