import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import router

app = FastAPI(
    title="ResQAI — Multi-Agent Disaster Response Command Engine",
    description="Backend API for autonomous multi-agent disaster response, resource optimization, agent debates, and automated rollback.",
    version="1.0.0"
)

# Enable CORS for local Vite dev server and production clients
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)

@app.get("/")
def root():
    return {
        "system": "ResQAI Emergency Command Engine",
        "status": "OPERATIONAL",
        "version": "1.0.0",
        "active_disaster": "Riverine Flash Flood Emergency",
        "agents": ["ATLAS", "TRIAGE", "CONVOY", "OPTIMA", "COMMUNICATION"]
    }

@app.get("/health")
def health():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
