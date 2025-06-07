from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import simulation  

app = FastAPI()

# ✅ Add this CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # or ["http://localhost:3000"]
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ✅ Include your simulation routes
app.include_router(simulation.router, prefix="/sim")
