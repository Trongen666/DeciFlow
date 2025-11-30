import { useState } from 'react';
import { useWeb3 } from '../contexts/Web3Context';

export const useContract = (contractName) => {
    const { contracts } = useWeb3();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const contract = contracts[contractName];

    const call = async (methodName, ...args) => {
        if (!contract) {
            setError("Contract not loaded");
            return null;
        }

        setLoading(true);
        setError(null);

        try {
            const tx = await contract[methodName](...args);

            // If it's a write transaction, wait for it
            if (tx.wait) {
                console.log(`Transaction sent: ${tx.hash}`);
                const receipt = await tx.wait();
                setLoading(false);
                return receipt;
            }

            // If it's a read call
            setLoading(false);
            return tx;

        } catch (err) {
            console.error(`Error calling ${methodName}:`, err);
            setError(err.message || "Transaction failed");
            setLoading(false);
            throw err;
        }
    };

    return { call, loading, error, contract };
};
