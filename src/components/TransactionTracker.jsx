import React, { useEffect, useState } from 'react';
import { ProgressBar, Alert } from 'react-bootstrap';
import { useWeb3 } from '../contexts/Web3Context';

const TransactionTracker = ({ txHash, onConfirmed }) => {
    const { provider } = useWeb3();
    const [status, setStatus] = useState('pending'); // pending, confirmed, failed
    const [confirmations, setConfirmations] = useState(0);

    useEffect(() => {
        if (!txHash || !provider) return;

        const checkReceipt = async () => {
            try {
                const receipt = await provider.getTransactionReceipt(txHash);

                if (receipt) {
                    if (receipt.confirmations >= 1) {
                        setStatus(receipt.status === 1 ? 'confirmed' : 'failed');
                        setConfirmations(receipt.confirmations);
                        if (receipt.status === 1 && onConfirmed) onConfirmed();
                    }
                } else {
                    // Still pending
                    setStatus('pending');
                }
            } catch (e) {
                console.error("Error checking receipt:", e);
            }
        };

        const interval = setInterval(checkReceipt, 2000);
        return () => clearInterval(interval);
    }, [txHash, provider]);

    if (!txHash) return null;

    return (
        <div className="mt-3">
            {status === 'pending' && (
                <Alert variant="info">
                    Transaction Pending... <br />
                    <small>{txHash}</small>
                    <ProgressBar animated now={100} label="Mining" />
                </Alert>
            )}

            {status === 'confirmed' && (
                <Alert variant="success">
                    Transaction Confirmed! ({confirmations} confirmations)
                </Alert>
            )}

            {status === 'failed' && (
                <Alert variant="danger">
                    Transaction Failed. Please check console.
                </Alert>
            )}
        </div>
    );
};

export default TransactionTracker;
