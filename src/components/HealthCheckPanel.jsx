import { useState } from 'react';
import { runHealthChecks, getCategoryIcon, getSeverityColor, switchNetwork } from '../utils/healthChecks';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '../utils/contractInfo';

export default function HealthCheckPanel({ requiredChainId = 1337 }) {
  const [checks, setChecks] = useState([]);
  const [isRunning, setIsRunning] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const runChecks = async () => {
    setIsRunning(true);
    try {
      const results = await runHealthChecks({
        requiredChainId,
        contractAddress: CONTRACT_ADDRESS,
        contractABI: CONTRACT_ABI
      });
      setChecks(results);
    } catch (error) {
      console.error('Error running health checks:', error);
    } finally {
      setIsRunning(false);
    }
  };

  const handleSwitchNetwork = async () => {
    const result = await switchNetwork(requiredChainId);
    if (result.success) {
      setTimeout(runChecks, 1000);
    } else {
      alert(`Failed to switch network: ${result.error}`);
    }
  };

  const getOverallStatus = () => {
    if (checks.length === 0) return { color: 'secondary', text: 'Not Tested', icon: '❓' };
    
    const critical = checks.filter(c => !c.ok && c.severity === 'critical').length;
    const warnings = checks.filter(c => !c.ok && (c.severity === 'high' || c.severity === 'warning')).length;
    
    if (critical > 0) return { color: 'danger', text: 'Critical Issues', icon: '❌' };
    if (warnings > 0) return { color: 'warning', text: 'Warnings', icon: '⚠️' };
    return { color: 'success', text: 'All Systems Operational', icon: '✅' };
  };

  const groupedChecks = checks.reduce((acc, check) => {
    if (!acc[check.category]) acc[check.category] = [];
    acc[check.category].push(check);
    return acc;
  }, {});

  const overallStatus = getOverallStatus();

  return (
    <div className="card mb-3">
      <div className="card-header d-flex justify-content-between align-items-center">
        <div>
          <h5 className="mb-0">
            {overallStatus.icon} System Health Check
            <span className={`badge bg-${overallStatus.color} ms-2`}>
              {overallStatus.text}
            </span>
          </h5>
        </div>
        <div>
          <button 
            className="btn btn-sm btn-outline-primary me-2"
            onClick={runChecks}
            disabled={isRunning}
          >
            {isRunning ? (
              <>
                <span className="spinner-border spinner-border-sm me-1" />
                Running...
              </>
            ) : (
              '🔄 Run Checks'
            )}
          </button>
          {checks.length > 0 && (
            <button 
              className="btn btn-sm btn-outline-secondary"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? 'Collapse' : 'Expand'}
            </button>
          )}
        </div>
      </div>

      {checks.length > 0 && (
        <div className="card-body">
          {!isExpanded ? (
            // Summary view
            <div className="row g-2">
              {Object.entries(groupedChecks).map(([category, categoryChecks]) => {
                const passed = categoryChecks.filter(c => c.ok).length;
                const total = categoryChecks.length;
                const hasIssues = passed < total;
                
                return (
                  <div key={category} className="col-md-4">
                    <div className={`p-3 rounded border ${hasIssues ? 'border-warning bg-warning-subtle' : 'border-success bg-success-subtle'}`}>
                      <div className="d-flex align-items-center justify-content-between">
                        <div>
                          <span style={{ fontSize: '1.5rem' }} className="me-2">
                            {getCategoryIcon(category)}
                          </span>
                          <strong className="text-capitalize">{category}</strong>
                        </div>
                        <div className={`badge ${hasIssues ? 'bg-warning' : 'bg-success'}`}>
                          {passed}/{total}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            // Detailed view
            <div>
              {Object.entries(groupedChecks).map(([category, categoryChecks]) => (
                <div key={category} className="mb-4">
                  <h6 className="text-capitalize mb-3">
                    {getCategoryIcon(category)} {category} Checks
                  </h6>
                  {categoryChecks.map((check, idx) => (
                    <div 
                      key={idx}
                      className={`d-flex align-items-start p-3 mb-2 rounded border ${
                        check.ok ? 'border-success bg-success-subtle' : `border-${getSeverityColor(check.severity)}`
                      }`}
                    >
                      <div style={{ fontSize: '1.5rem', minWidth: '40px' }}>
                        {check.ok ? '✅' : '❌'}
                      </div>
                      <div className="flex-grow-1">
                        <div className="d-flex justify-content-between align-items-start mb-1">
                          <strong>{check.name}</strong>
                          {!check.ok && check.severity && (
                            <span className={`badge bg-${getSeverityColor(check.severity)}`}>
                              {check.severity}
                            </span>
                          )}
                        </div>
                        
                        {check.info && (
                          <div className="text-muted small mb-1">
                            ℹ️ {check.info}
                          </div>
                        )}
                        
                        {check.warning && (
                          <div className="alert alert-warning small mb-1 py-1">
                            ⚠️ {check.warning}
                          </div>
                        )}
                        
                        {check.error && (
                          <div className="alert alert-danger small mb-1 py-1">
                            ❌ {check.error}
                          </div>
                        )}
                        
                        {check.action && (
                          <div className="mt-2">
                            {check.action === 'Switch Network' ? (
                              <button 
                                className="btn btn-sm btn-warning"
                                onClick={handleSwitchNetwork}
                              >
                                🔄 {check.action}
                              </button>
                            ) : (
                              <button className="btn btn-sm btn-outline-primary">
                                {check.action}
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}

          <div className="mt-3 p-2 bg-light rounded small text-muted">
            <strong>💡 Tips:</strong>
            <ul className="mb-0 mt-1">
              <li>Critical issues will prevent transactions from working</li>
              <li>Run checks before performing important operations</li>
              <li>Network mismatches can be fixed by clicking "Switch Network"</li>
              <li>Low balance warnings mean you may not have enough gas for transactions</li>
            </ul>
          </div>
        </div>
      )}

      {checks.length === 0 && !isRunning && (
        <div className="card-body text-center text-muted">
          <p className="mb-0">Click "Run Checks" to verify system connectivity and health</p>
        </div>
      )}
    </div>
  );
}