# backend/app/routers/simulation.py
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from simulation.manager import SimulationManager
import asyncio
import json

router = APIRouter()
active_simulations = {}

@router.websocket("/ws/simulate/{client_id}")
async def websocket_endpoint(websocket: WebSocket, client_id: str):
    await websocket.accept()
    sim = SimulationManager()
    active_simulations[client_id] = sim

    async def send_fn(message):
        await websocket.send_text(json.dumps(message))

    simulation_task = asyncio.create_task(sim.simulation_loop(send_fn))

    try:
        while True:
            data = await websocket.receive_text()
            print("Received:", data)  # ⬅️ Add this line
            message = json.loads(data)

            if message["type"] == "control":
                sim.apply_control(message["data"])
            elif message["type"] == "get_state":
                state = sim.get_state()
                await websocket.send_text(json.dumps({"type": "state", "data": state}))
            elif message["type"] == "get_controls":
                info = sim.get_control_info()
                await websocket.send_text(json.dumps({"type": "controls_schema", "data": info}))

    except WebSocketDisconnect:
        sim.stop_simulation()
        simulation_task.cancel()
        del active_simulations[client_id]
