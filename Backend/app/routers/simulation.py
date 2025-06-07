from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from simulation.manager import SimulationManager
import asyncio
import json

router = APIRouter()
active_simulations = {}

@router.websocket("/ws/simulate/{client_id}")
async def websocket_endpoint(websocket: WebSocket, client_id: str):
    await websocket.accept()

    # Create (or replace) a SimulationManager for this client:
    sim = SimulationManager()
    active_simulations[client_id] = sim

    # Helper to send a JSON‐encoded message over the WebSocket
    async def send_fn(message):
        await websocket.send_text(json.dumps(message))

    # Start the physics loop in the background
    simulation_task = asyncio.create_task(sim.simulation_loop(send_fn))

    try:
        while True:
            data = await websocket.receive_text()
            message = json.loads(data)

            if message["type"] == "control":
                # message["data"] is [torque_value]
                sim.apply_control(message["data"])
            elif message["type"] == "get_state":
                # One‐time snapshot request
                state = sim.get_state()
                await websocket.send_text(json.dumps({"type": "state", "data": state}))
            elif message["type"] == "get_controls":
                # Send back the one‐actuator “torque” schema
                info = sim.get_control_info()
                await websocket.send_text(json.dumps({"type": "controls_schema", "data": info}))
            # (You could add other message types here if needed)
    except WebSocketDisconnect:
        # Clean up on disconnect
        sim.stop_simulation()
        simulation_task.cancel()
        del active_simulations[client_id]
