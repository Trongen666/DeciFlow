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

    const setupFromProvider = async (web3Provider) => {
        try {
            const signer = web3Provider.getSigner();
            const accounts = await web3Provider.listAccounts();
            const network = await web3Provider.getNetwork();

            setProvider(web3Provider);
            setSigner(signer);
            setAccount(accounts && accounts.length ? accounts[0] : null);
            setChainId(network.chainId);

            // Initialize Contracts (use signer to allow read/write)
            const sc = new ethers.Contract(getContractAddress('SupplyChain'), getContractABI('SupplyChain'), signer);
            const ac = new ethers.Contract(getContractAddress('AccessControl'), getContractABI('AccessControl'), signer);

            setContracts({
                SupplyChain: sc,
                AccessControl: ac
            });
            console.info('Contracts initialized for account', accounts && accounts.length ? accounts[0] : null);
        } catch (err) {
            console.error('setupFromProvider failed', err);
        }
    };

    const connectWallet = async () => {
        if (!window.ethereum) {
            alert("Please install MetaMask!");
            return;
        }

        try {
            const web3Provider = new ethers.providers.Web3Provider(window.ethereum);
            // request accounts (will trigger MetaMask UI)
            await web3Provider.send("eth_requestAccounts", []);
            await setupFromProvider(web3Provider);
        } catch (error) {
            console.error("Connection failed", error);
        }
    };

    useEffect(() => {
        if (!window.ethereum) return;

        const onAccounts = async (accounts) => {
            setAccount(accounts && accounts.length ? accounts[0] : null);

            // re-initialize provider and contracts for new account (no prompt)
            try {
                const web3Provider = new ethers.providers.Web3Provider(window.ethereum);
                await setupFromProvider(web3Provider);
            } catch (err) {
                console.error('accountsChanged setup failed', err);
            }
        };

        const onChain = async (id) => {
            // chainChanged gives hex string; try to re-init provider and contracts
            try {
                const web3Provider = new ethers.providers.Web3Provider(window.ethereum);
                await setupFromProvider(web3Provider);
            } catch (err) {
                console.error('chainChanged setup failed', err);
            }
        };

        window.ethereum.on('accountsChanged', onAccounts);
        window.ethereum.on('chainChanged', onChain);

        // if provider already available, initialize once
        (async () => {
            try {
                const web3Provider = new ethers.providers.Web3Provider(window.ethereum);
                const accounts = await web3Provider.listAccounts();
                if (accounts && accounts.length) await setupFromProvider(web3Provider);
            } catch (e) {
                // ignore - user may not be connected yet
            }
        })();

        return () => {
            if (window.ethereum.removeListener) {
                window.ethereum.removeListener('accountsChanged', onAccounts);
                window.ethereum.removeListener('chainChanged', onChain);
            }
        };
    }, []);

    return (
        <Web3Context.Provider value={{ account, provider, signer, contracts, chainId, connectWallet }}>
            {children}
        </Web3Context.Provider>
    );
};
