# backend/app/simulation/manager.py
import asyncio
import numpy as np
from dm_control import suite

class SimulationManager:
    def __init__(self):
        self.env = suite.load(domain_name="pendulum", task_name="swingup")
        self.time_step = self.env.control_timestep()
        self.state = self.env.reset()
        self.running = False
        self.next_action = np.zeros(self.env.action_spec().shape, dtype=np.float32)

    async def simulation_loop(self, send_fn):
        self.running = True
        while self.running:
            try:
                # Step the simulation with current control
                self.state = self.env.step(self.next_action)

                obs = self.state.observation
                data = {
                    "qpos": obs["orientation"].tolist(),
                    "qvel": obs["velocity"].tolist()
                }

                await send_fn({"type": "state", "data": data})

            except Exception as e:
                print("❌ Simulation loop error:", e)

            await asyncio.sleep(self.time_step)

    def stop_simulation(self):
        self.running = False

    def apply_control(self, control_input):
        self.next_action = np.array(control_input, dtype=np.float32)
        print("⚙️ Control applied:", self.next_action)

    def get_control_info(self):
        return {
            "count": 1,
            "names": ["torque"],
            "default": [0.0]
        }

    def get_state(self):
        obs = self.state.observation
        return {
            "qpos": obs["orientation"].tolist(),
            "qvel": obs["velocity"].tolist()
        }
