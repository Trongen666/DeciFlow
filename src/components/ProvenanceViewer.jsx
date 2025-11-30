import React, { useEffect, useState } from 'react';
import { Card, Table, Badge } from 'react-bootstrap';
import { useContract } from '../hooks/useContract';

const ProvenanceViewer = ({ productId }) => {
  const { contract: supplyChain } = useContract('SupplyChain');
  const [history, setHistory] = useState([]);
  const [envData, setEnvData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!supplyChain || !productId) return;

    const loadData = async () => {
      setLoading(true);
      try {
        // Fetch History
        const owners = await supplyChain.getProductHistory(productId);
        setHistory(owners);

        // Fetch Env Data
        const readings = await supplyChain.getEnvironmentalReadings(productId);
        setEnvData(readings);
      } catch (e) {
        console.error("Error loading provenance:", e);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [supplyChain, productId]);

  if (loading) return <div>Loading Provenance...</div>;

  return (
    <div className="mt-4">
      <h4>Product Provenance</h4>

      {/* Ownership Chain */}
      <Card className="mb-3">
        <Card.Header>Ownership Chain</Card.Header>
        <Card.Body>
          <ul className="timeline">
            {history.map((owner, index) => (
              <li key={index}>
                <strong>Step {index + 1}:</strong> {owner}
                {index === 0 && <Badge bg="primary" className="ms-2">Manufacturer</Badge>}
                {index === history.length - 1 && <Badge bg="success" className="ms-2">Current Owner</Badge>}
              </li>
            ))}
          </ul>
        </Card.Body>
      </Card>

      {/* Environmental Data */}
      {envData.length > 0 && (
        <Card>
          <Card.Header>Environmental Monitoring</Card.Header>
          <Table striped bordered hover size="sm">
            <thead>
              <tr>
                <th>Time</th>
                <th>Temp (°C)</th>
                <th>Humidity (%)</th>
                <th>Recorded By</th>
              </tr>
            </thead>
            <tbody>
              {envData.map((reading, idx) => (
                <tr key={idx}>
                  <td>{new Date(reading.timestamp * 1000).toLocaleString()}</td>
                  <td className={reading.temperature > 8 ? 'text-danger' : ''}>
                    {reading.temperature.toString()}
                  </td>
                  <td>{reading.humidity.toString()}</td>
                  <td><small>{reading.recordedBy}</small></td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card>
      )}
    </div>
  );
};

export default ProvenanceViewer;