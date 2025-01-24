import React, { useState, useEffect, useRef } from 'react';

const App = () => {
  const [apiToken, setApiToken] = useState('');
  const [masterToken, setMasterToken] = useState('');
  // const [\, setCopiers] = useState([]);
  const [output, setOutput] = useState([]);
  const ws = useRef(null);

  const app_id = 31502;

  useEffect(() => {
    ws.current = new WebSocket('wss://ws.binaryws.com/websockets/v3?app_id=' + app_id);

    ws.current.onopen = () => {
      if (apiToken) {
        sendMessage({ authorize: apiToken });
      }
    };

    ws.current.onmessage = (msg) => {
      const data = JSON.parse(msg.data);
      handleMessage(data);
    };

    return () => {
      if (ws.current) {
        ws.current.close();
      }
    };
  }, [apiToken]);

  const sendMessage = (message) => {
    if (ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify(message));
    }
  };

  const handleMessage = (data) => {
    let newOutput = [...output];

    if (data.error !== undefined) {
      newOutput.push(`Error: ${data.error.message}`);
    } else if (data.msg_type === 'authorize') {
      newOutput.push(`API Token: ${apiToken}`);
      newOutput.push(`Full Name: ${data.authorize.fullname}`);
      newOutput.push(`Currency: ${data.authorize.currency}`);
      newOutput.push(`Balance: ${data.authorize.balance}`);

      if (data.authorize.currency !== 'eUSDT') {
        newOutput.push('INCORRECT CURRENCY API TOKEN');
      }
    } else if (data.msg_type === 'copytrading_list') {
      if (data.copytrading_list.traders.length > 0) {
        newOutput.push('Masters:');
        data.copytrading_list.traders.forEach((trader) => {
          newOutput.push(`  ${trader.token}`);
        });
      } else {
        newOutput.push('Masters: NO MASTERS');
      }
    } else if (data.msg_type === 'copy_start') {
      newOutput.push('MASTER ADDED');
    } else if (data.msg_type === 'copy_stop') {
      newOutput.push('MASTER REMOVED');
    } else if (data.msg_type === 'set_settings') {
      if (data.set_settings.allow_copiers === 0) {
        newOutput.push('COPIER ALLOWED');
      } else {
        newOutput.push('COPIER NOT ALLOWED');
      }
    }else if (data.msg_type === 'get_settings') {
      if (data.get_settings.allow_copiers === 0) {
        newOutput.push('COPIER ALLOWED');
      } else {
        newOutput.push('COPIER NOT ALLOWED');
      }
    } else {
      newOutput.push(`Unknown Response: ${JSON.stringify(data)}`);
    }

    setOutput(newOutput);
  };

  const handleApiTokenChange = (event) => {
    setApiToken(event.target.value);
  };

  const handleMasterTokenChange = (event) => {
    setMasterToken(event.target.value);
  };

  // const handleCopiersChange = (event) => {
  //   setCopiers(event.target.value.split('\n'));
  // };

  const handleCheckAllMasters = () => {
    sendMessage({ copytrading_list: 1 });
  };

  const handleAddMaster = () => {
    if (masterToken) {
      sendMessage({ copy_start: masterToken });
    } else {
      setOutput([...output, 'Error: Please enter a Master Token']);
    }
  };

  const handleRemoveMaster = () => {
    if (masterToken) {
      sendMessage({ copy_stop: masterToken });
    } else {
      setOutput([...output, 'Error: Please enter a Master Token']);
    }
  };

  const handleCheckCopier = () => {
    sendMessage({ get_settings: 1 });
  };

  const handleConvertToMaster = () => {
    sendMessage({ set_settings: 1, allow_copiers: 1 });
  };
  const handleConvertToCopier = () => {
    sendMessage({ set_settings: 1, allow_copiers: 0 });
  };

  return (
    <div>
      <h1>Deriv </h1>
      <div>
        <label htmlFor="apiToken">API Token:</label>
        <input
          type="text"
          id="apiToken"
          value={apiToken}
          onChange={handleApiTokenChange}
        />
      </div>
      <div>
        <label htmlFor="masterToken">Master Token:</label>
        <input
          type="text"
          id="masterToken"
          value={masterToken}
          onChange={handleMasterTokenChange}
        />
      </div>
      {/* <div>
        <label htmlFor="copiers">Copiers (one per line):</label>
        <textarea id="copiers" value={copiers.join('\n')} onChange={handleCopiersChange} />
      </div> */}
      <button onClick={handleCheckAllMasters}>Check All Masters</button>
      <button onClick={handleAddMaster}>Add Master</button>
      <button onClick={handleRemoveMaster}>Remove Master</button>
      <button onClick={handleCheckCopier}>Check Copier</button>
      <button onClick={handleConvertToMaster}>Convert to Master</button>
      <button onClick={handleConvertToCopier}>Convert to Copier</button>
      <div>
        <h2>Output:</h2>
        <ul>
          {output.map((line, index) => (
            <li key={index}>{line}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default App;