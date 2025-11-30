import React, { useEffect, useState } from 'react';
import { Container, Table, Button } from 'react-bootstrap';
import { useWeb3 } from '../contexts/Web3Context';
import { useContract } from '../hooks/useContract';

const Products = ({ Link }) => {
  const { account, connectWallet } = useWeb3();
  const { contract, call } = useContract('SupplyChain');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (!contract) return;
      setLoading(true);
      try {
        const countBN = await contract.productCount();
        const count = countBN ? Number(countBN.toString()) : 0;
        const rows = [];
        for (let i = 1; i <= count; i++) {
          try {
            const p = await contract.getProduct(i);
            rows.push({ id: i, name: p.name, qty: p.quantity.toString(), manufacturer: p.manufacturer, status: p.status });
          } catch (e) {
            console.error('failed loading product', i, e);
          }
        }
        setProducts(rows);
      } catch (err) {
        console.error(err);
      }
      setLoading(false);
    };
    load();
  }, [contract]);

  return (
    <Container className="py-4">
      <h2>Inventory / Products</h2>
      <p className="text-muted">List of products stored on-chain. Connect wallet for role-aware actions.</p>

      {/* Debug / connection hints so users can see state */}
      {!contract && <div className="alert alert-warning">No on-chain contract loaded yet — connect wallet or check you are on the same network as the deployed contracts.</div>}

      {(!account) && <div className="mb-2"><Button onClick={connectWallet}>Connect Wallet</Button></div>}

      <div className="table-responsive shadow-sm bg-white rounded p-3">
        <Table bordered hover size="sm">
          <thead className="table-light">
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Quantity</th>
              <th>Manufacturer</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5}>Loading products...</td></tr>
            ) : products.length === 0 ? (
              <tr><td colSpan={5}>No products found</td></tr>
            ) : products.map(p => (
              <tr key={p.id}>
                <td>{p.id}</td>
                <td>{p.name}</td>
                <td>{p.qty}</td>
                <td>{p.manufacturer.substring(0,6)}...{p.manufacturer.substring(38)}</td>
                <td>
                  {Link && <Link to={`/dashboard`} className="btn btn-sm btn-outline-primary">Open</Link>}
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>
    </Container>
  );
};

export default Products;
