import React, { useEffect, useRef, useState } from 'react';
import './NewScreen.css';

const NewScreen = () => {
  const ws = useRef(null);
  const [imgData, setImgData] = useState('');
  const [controls, setControls] = useState([]);
  const [controlValues, setControlValues] = useState([]);

  useEffect(() => {
    ws.current = new WebSocket(`ws://localhost:8000/sim/ws/simulate/user1`);

    ws.current.onopen = () => {
      ws.current.send(JSON.stringify({ type: "get_controls" }));
    };

    ws.current.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      console.log("Message received:", msg);
      if (msg.type === 'frame') {
        setImgData(`data:image/png;base64,${msg.data}`);
      } else if (msg.type === 'controls_schema') {
        setControls(msg.data.names);
        setControlValues(msg.data.default);
      }
    };

    return () => ws.current.close();
  }, []);

  const updateControl = (index, value) => {
    const newControls = [...controlValues];
    newControls[index] = parseFloat(value);
    setControlValues(newControls);
    ws.current.send(JSON.stringify({ type: "control", data: newControls }));
  };

  return (
    <div className="new-screen">
      <div className="left-panel">
        <h3>Control Panel</h3>
        {controls.map((name, i) => (
        <div key={i} className="control-group">
            <label>{name}</label>
            <input
              type="range"
              min={-2}
              max={2}
              step={0.01}
              value={controlValues[i]}
              onChange={(e) => updateControl(i, e.target.value)}
              style={{ width: '100%' }}
            />
<span>{controlValues[i]}</span>

            <span>{controlValues[i]}</span>
          </div>

        ))}
      </div>
      <div className="right-panel">
        <h3>Simulation</h3>
        {imgData ? (
          <img src={imgData} alt="Sim" style={{ maxWidth: '100%' }} />
        ) : (
          <p>Waiting for simulation...</p>
        )}
      </div>
    </div>
  );
};

export default NewScreen;
