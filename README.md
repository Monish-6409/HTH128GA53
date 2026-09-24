# ResQAI — Multi-Agent Disaster Response Command Center 🚨

> An autonomous, multi-agent emergency operations platform that coordinates disaster triage, arbitrates resource contention through structured debate, enforces physical constraints, forecasts resource depletion, and executes instant plan rollbacks with human commander oversight.

---

## 🌟 Architecture Overview

```
                      +-----------------------------+
                      |       React Frontend        |
                      |  (TypeScript + Tailwind +   |
                      |   Leaflet + Recharts)       |
                      +--------------+--------------+
                                     |  REST / WebSockets
                                     v
                      +-----------------------------+
                      |       FastAPI Backend       |
                      |  (Python 3.14 + Pydantic)   |
                      +--------------+--------------+
                                     |
                      +--------------v--------------+
                      |      Agent Orchestrator     |
                      +--------------+--------------+
                                     |
         +-------------+-------------+-------------+-------------+
         |             |             |             |             |
         v             v             v             v             v
     [ ATLAS ]    [ TRIAGE ]    [ CONVOY ]    [ OPTIMA ]  [ COMMUNICATION ]
   Orchestrator     Medical      Logistics    Optimizer     Public Alerts
         |             |             |             |             |
         +-------------+-------------+-------------+-------------+
                                     |
                                     v
                      +-----------------------------+
                      |      Agent Debate Chamber   |
                      | (Proposals, Challenges,     |
                      |  Synthesis & Consensus)     |
                      +--------------+--------------+
                                     |
                                     v
                      +-----------------------------+
                      |   Linear Optimization Engine|
                      |  (Zero Deficit Guarantee)   |
                      +--------------+--------------+
                                     |
                                     v
                      +-----------------------------+
                      | Versioned Plan & Explainer  |
                      | (Plan v1, v2 + Success 84%) |
                      +--------------+--------------+
                                     |
                                     v
                      +-----------------------------+
                      |   Human Commander In Loop   |
                      | [Approve / Modify / Reject] |
                      +--------------+--------------+
                                     |
                                     v
                      +-----------------------------+
                      | Real-Time Event & Rollback  |
                      |  (Road Collapse -> Auto RB) |
                      +-----------------------------+
```

---

## 🤖 The 5 Specialized AI Agents

| Agent | Designation | Core Responsibilities |
| :--- | :--- | :--- |
| **ATLAS** | Strategic Orchestrator | Coordinates multi-agent directives, verifies constraints, produces cohesive command plans, and monitors execution telemetry. |
| **TRIAGE** | Medical & Casualty Agent | Evaluates patient severity, monitors hospital bed / ICU capacities, and schedules trauma kits and ambulances. |
| **CONVOY** | Logistics & Mobility Agent | Optimizes route feasibility, coordinates water rescue boat slipways, and schedules high-clearance 4x4 relief shuttles. |
| **OPTIMA** | Resource Optimization Agent | Enforces linear non-exceedance constraints, resolves inter-agent contention, forecasts depletion horizons, and arbitrates debates. |
| **COMMUNICATION** | Public & Field Warning Agent | Dispatches multilingual emergency broadcasts (English, Tamil, Hindi) and coordinates field rescue units. |

---

## ⚡ Key Features

### 1. Autonomous Agent Debate & Consensus System
When resources are scarce, agents engage in a 3-round structured debate:
1. **Proposal**: Initial evidence-backed claims (e.g. TRIAGE requests 7 boats for Zone A).
2. **Challenge**: Counter-agent claims & operational risks (e.g. CONVOY highlights Zone B's 18,500 exposed population).
3. **Validation & Synthesis**: OPTIMA synthesizes an optimal mathematical compromise (5-3-2 split + 4x4 vehicle augmentation) achieving 94% consensus without chain-of-thought bloat.

### 2. Emergency Resource Tracking & Non-Exceedance Guard
Tracks 10 core inventories in real time:
- Ambulances, Rescue Trucks (4x4), Rescue Boats, Medical Trauma Kits, Ration Food Packets, Potable Water Jugs, Shelter Spaces, Rescue Personnel, Generator Fuel, Satellite Comm Sets.
- Attributes tracked: `Total`, `Available`, `Allocated`, `In Transit`, `Used`, `Remaining`, `Demand`, `Shortage`.
- Auto-flagged statuses: `NORMAL`, `LOW`, `WARNING`, `CRITICAL`, `DEPLETED`.

### 3. Mathematical Resource Depletion Forecasting
- Calculates hourly consumption rates, incoming replenishment shipments, and exact hours until stockout.
- Displays interactive Recharts depletion projections over +12 hours with critical safety thresholds.
- Generates automated OPTIMA mitigation advisories (e.g. *"Request inter-agency mutual aid from Highland district"*).

### 4. Response Plan Versioning & "Explain My Plan" Explainer
- Automatically tracks `Plan v1`, `Plan v2`, `Plan v3`...
- Transparent "Explain My Plan" cards answer:
  - *Why was Zone A prioritized over Zone B?*
  - *Why were 4x4 trucks substituted for rescue boats?*
  - *Why was an ambulance redirected to St. Jude?*
  - *What changed from the previous plan version?*

### 5. Automatic Plan Rollback Engine
- When a physical impossibility occurs (e.g., **Causeway Arterial 1 collapses**):
  - Detects route invalidation.
  - Safely recalls 9 compromised vehicles in transit with 0 losses.
  - Reverts to safe state and invokes an emergency Agent Council session.
  - Re-plans via elevated North Flyover B detour and generates `Plan v2`.

### 6. Simulated Plan Success Indicator
- Generates an operational decision-support score (**84%**) composed of:
  - Resource Coverage (88%)
  - Critical Zone Coverage (92%)
  - Response ETA (85%)
  - Hospital Capacity Buffer (80%)
  - Conflict Resolution Consensus (95%)
  - Evacuation Corridor Coverage (78%)
  - Resource Shortage Penalty (-6%)
- *Disclaimer: Explicitly presented as a simulated decision-support metric, not a guarantee of physical outcomes.*

### 7. Multilingual Citizen SOS Portal (English, Tamil, Hindi)
- Stranded citizens submit emergencies with GPS location, people count, and medical flags.
- Real-time duplicate clustering consolidates nearby beacons to prevent dispatch redundancy.
- Supports English, Tamil (`தமிழ்`), and Hindi (`हिन्दी`).

### 8. Voice Command Center & Voice Emergency Reporting
- Built with the Web Speech API and keyboard/preset fallback.
- Recognizes commands like:
  - *"Show critical zones"*
  - *"Show available rescue boats"*
  - *"Generate situation report"*
  - *"Recalculate response plan"*
  - *"Show nearby hospitals"*
- Includes tactical synthetic speech feedback (`speechSynthesis`).

### 9. Healthcare Locator & Bed Capacity Matrix
- Tracks Metropolitan Trauma Hospital, St. Jude General Hospital, Westside Clinic, and Highland Medical Camp.
- Live ICU and trauma bed availability feed directly into TRIAGE routing.

---

## 🚀 Quickstart Guide

### Prerequisites
- Python 3.10+ (Tested on Python 3.14)
- Node.js 18+ (Tested on Node.js v20.11.0)
- npm 9+

### 1. Clone & Set Up Backend

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Run automated tests
python3 -m unittest discover tests

# Start backend server
python3 -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

Backend API will be running at `http://localhost:8000` (Swagger docs at `/docs`).

### 2. Set Up & Run Frontend

```bash
cd frontend
npm install
npm run build
npm run dev
```

Frontend Command Center UI will open at `http://localhost:5173`.

---

## 🧪 Interactive Hackathon Demo Sequence (Riverine Flood Disaster)

Click the **"Interactive Demo"** button in the top navigation bar to step through the guided 18-stage demonstration:

1. **Initialize Flood State**: Reservoir spillover inundating Metro Basin.
2. **Multi-Agent Council Sync**: Agents evaluate casualties and routes.
3. **Contention Detected**: Boat requests exceed total fleet.
4. **Agent Debate**: TRIAGE vs CONVOY argument exchange.
5. **OPTIMA Consensus**: 5-3-2 boat split + 4x4 trucks.
6. **Plan v1 Published**: Coordinated deployment active.
7. **Success Indicator**: 84% Optimal Score computed.
8. **SitRep Generated**: Official operational briefing exported.
9. **Inject Road Collapse**: Causeway Arterial 1 collapses.
10. **Auto-Rollback**: Transit allocations invalidated and saved.
11. **Plan v2 Formulated**: Detour via North Flyover B.
12. **Plan Explainer**: Visual delta breakdown between v1 and v2.
13. **Depletion Recalculation**: Resupply alert triggered.
14. **Multilingual Citizen SOS**: Proximity clustering demonstrated.
15. **Hospital Saturation Diversion**: Metro Trauma diverted to St. Jude.
16. **Voice Command Center**: Interactive speech recognition and synthesis.
17. **Timeline Verification**: Full chronological audit.
18. **Human Commander Approval**: Final operational greenlight.

---

## 🛡️ Security & Environment

- All sensitive keys configured via `.env` (template in `.env.example`).
- Zero hardcoded keys or private secrets in source code.
- Input validation enforced on all API endpoints via Pydantic models.
- Database schema ready for Supabase / PostgreSQL deployment (`backend/schema.sql`).

---

## 📜 License
MIT License. Built for hackathons, emergency response simulations, and multi-agent AI research.
