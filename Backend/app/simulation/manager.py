# backend/app/simulation/manager.py
import asyncio
import numpy as np
import base64
import io
import mujoco
import mujoco.viewer
import PIL.Image
from dm_control import suite

class SimulationManager:
    def __init__(self):
        self.env = suite.load(domain_name="pendulum", task_name="swingup")
        self.time_step = self.env.control_timestep()
        self.state = self.env.reset()
        self.running = False
        self.next_action = np.zeros(self.env.action_spec().shape, dtype=np.float32)

    def render_frame(self):
        try:
            frame = self.env.physics.render(camera_id=0, height=480, width=640)
            img = PIL.Image.fromarray(frame)
            buf = io.BytesIO()
            img.save(buf, format="PNG")
            return base64.b64encode(buf.getvalue()).decode("utf-8")
        except Exception as e:
            print("❌ render_frame failed:", e)
            return None


    def get_control_info(self):
        nu = self.env.physics.model.nu
        names = []
        for i in range(nu):
            addr = self.env.physics.model.name_actuatoradr[i]
            name_bytes = self.env.physics.model.names[addr:]
            name = name_bytes.split(b'\x00')[0].decode('utf-8')
            names.append(name)
        print("Control names:", names)
        return {
            "count": nu,
            "names": names,
            "default": [0.0] * nu
        }

    async def simulation_loop(self, send_fn):
        self.running = True
        while self.running:
            try:
                self.state = self.env.step(self.next_action)
                img_data = self.render_frame()
                if img_data:
                    await send_fn({"type": "frame", "data": img_data})
            except Exception as e:
                print("❌ Simulation loop error:", e)


    def stop_simulation(self):
        self.running = False

    def apply_control(self, control_input):
        self.next_action = np.array(control_input)

    def get_state(self):
        obs = self.state.observation
        return {k: v.tolist() for k, v in obs.items()}
