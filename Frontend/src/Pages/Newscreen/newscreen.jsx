import React, { useEffect, useRef, useState } from 'react';
import './NewScreen.css';
import PendulumScene from '../../Component/PendulumScene';

const NewScreen = () => {
  const ws = useRef(null);
  const [qpos, setQpos] = useState([1, 0]);   // DMControl pendulum reset: cosθ=1,sinθ=0 (θ=0 → downward)
  const [qvel, setQvel] = useState([0]);      // initial angular velocity = 0
  const [torque, setTorque] = useState(0);    // one‐dimensional control input
  const [wsOpen, setWsOpen] = useState(false);

  useEffect(() => {
    let socket;

    const connectWebSocket = () => {
      socket = new WebSocket("ws://localhost:8000/sim/ws/simulate/user1");
      ws.current = socket;

      socket.onopen = () => {
        console.log("✅ WebSocket connected");
        setWsOpen(true);
        // (Optional) Ask for control schema, but we already know it's ["torque"]
        socket.send(JSON.stringify({ type: "get_controls" }));
      };

      socket.onmessage = (event) => {
        const msg = JSON.parse(event.data);
        // Log every incoming msg for debugging
        console.log("WS message:", msg);

        if (msg.type === 'state') {
          // Update the React state with the latest qpos/qvel
          setQpos(msg.data.qpos);
          setQvel(msg.data.qvel);
        }
        // We can ignore "controls_schema" here since we have a single slider
      };

      socket.onclose = () => {
        console.warn("❌ WebSocket closed, attempting reconnect...");
        setWsOpen(false);
        // Try reconnect in 1 second
        setTimeout(connectWebSocket, 1000);
      };

      socket.onerror = (err) => {
        console.error("WebSocket error:", err);
        socket.close();
      };
    };

    connectWebSocket();

    // Cleanup on unmount
    return () => {
      if (ws.current) {
        ws.current.close();
      }
    };
  }, []);

  // Called whenever the user moves the torque slider
  const onTorqueChange = (e) => {
    const val = parseFloat(e.target.value);
    setTorque(val);

    if (wsOpen && ws.current.readyState === WebSocket.OPEN) {
      // Send single‐element array [torque] as control command
      ws.current.send(JSON.stringify({ type: "control", data: [val] }));
    }
  };

  return (
    <div className="new-screen">
      {/* Left: Control Panel */}
      <div className="left-panel">
        <h3>Control Panel</h3>

        {/* Torque Slider */}
        <div className="control-group">
          <label>Torque: {torque.toFixed(2)}</label>
          <input
            type="range"
            min={-1}
            max={1}
            step={0.01}
            value={torque}
            onChange={onTorqueChange}
          />
          <span className="value-display">{torque.toFixed(2)}</span>
        </div>

      </div>

      {/* Right: 3D Pendulum Viewer */}
      <div className="right-panel">
        <h3>Simulation</h3>
        <PendulumScene qpos={qpos} qvel={qvel} />
      </div>
    </div>
  );
};

export default NewScreen;
