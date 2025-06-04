import React, { useEffect, useRef, useState } from 'react';

const SimulationClient = ({ clientId }) => {
  const ws = useRef(null);
  const [state, setState] = useState(null);
  const [controlInput, setControlInput] = useState(0);

  useEffect(() => {
    ws.current = new WebSocket(`ws://localhost:8000/sim/ws/simulate/${clientId}`);

    ws.current.onopen = () => {
      console.log('✅ WebSocket connected');
    };

    ws.current.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.type === 'state') {
        setState(message.data);
      }
    };

    ws.current.onclose = () => {
      console.log('❌ WebSocket disconnected');
    };

    return () => {
      ws.current.close();
    };
  }, [clientId]);

  const sendControl = () => {
    const message = {
      type: 'control',
      data: [parseFloat(controlInput)],
    };
    ws.current.send(JSON.stringify(message));
  };

  const requestState = () => {
    const message = {
      type: 'get_state',
    };
    ws.current.send(JSON.stringify(message));
  };

  return (
    <div style={{ padding: "1rem" }}>
      <h2>Simulation Client</h2>
      <input
        type="number"
        value={controlInput}
        onChange={(e) => setControlInput(e.target.value)}
        placeholder="Enter torque value"
      />
      <button onClick={sendControl}>Send Control</button>
      <button onClick={requestState}>Get State</button>

      <pre>{state ? JSON.stringify(state, null, 2) : "Waiting for simulation state..."}</pre>
    </div>
  );
};

export default SimulationClient;
