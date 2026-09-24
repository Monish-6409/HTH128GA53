import unittest
import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from fastapi.testclient import TestClient
from main import app

class TestAPIEndpoints(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.client = TestClient(app)

    def test_root_and_health(self):
        res = self.client.get("/")
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.json()["system"], "ResQAI Emergency Command Engine")

        res_health = self.client.get("/health")
        self.assertEqual(res_health.status_code, 200)
        self.assertEqual(res_health.json()["status"], "healthy")

    def test_get_disaster_and_zones(self):
        res_disaster = self.client.get("/api/disaster")
        self.assertEqual(res_disaster.status_code, 200)
        self.assertEqual(res_disaster.json()["severity"], "CRITICAL")

        res_zones = self.client.get("/api/zones")
        self.assertEqual(res_zones.status_code, 200)
        self.assertGreaterEqual(len(res_zones.json()), 4)

    def test_resources_and_forecast(self):
        res_res = self.client.get("/api/resources")
        self.assertEqual(res_res.status_code, 200)
        self.assertGreaterEqual(len(res_res.json()), 10)

        res_fc = self.client.get("/api/resources/forecast")
        self.assertEqual(res_fc.status_code, 200)
        self.assertGreaterEqual(len(res_fc.json()), 10)

    def test_agents_and_debates(self):
        res_agents = self.client.get("/api/agents")
        self.assertEqual(res_agents.status_code, 200)
        self.assertEqual(len(res_agents.json()), 5)

        res_debates = self.client.get("/api/debates")
        self.assertEqual(res_debates.status_code, 200)
        self.assertGreaterEqual(len(res_debates.json()), 1)

    def test_response_plan_operations(self):
        res_plan = self.client.get("/api/response-plan")
        self.assertEqual(res_plan.status_code, 200)
        self.assertIn("Plan v", res_plan.json()["version"])

        # Approve
        res_approve = self.client.post("/api/response-plan/approve", json={"commander_name": "ADMIRAL-1", "notes": "Approved."})
        self.assertEqual(res_approve.status_code, 200)
        self.assertEqual(res_approve.json()["status"], "APPROVED")

        # Recalculate
        res_recalc = self.client.post("/api/response-plan/recalculate")
        self.assertEqual(res_recalc.status_code, 200)

    def test_event_injection_and_timeline(self):
        res_event = self.client.post("/api/events", json={"event_type": "ROAD_COLLAPSE"})
        self.assertEqual(res_event.status_code, 200)
        self.assertIn("Causeway collapsed", res_event.json()["message"])

        res_timeline = self.client.get("/api/timeline")
        self.assertEqual(res_timeline.status_code, 200)
        self.assertGreater(len(res_timeline.json()), 0)

    def test_sos_and_healthcare(self):
        res_sos = self.client.post("/api/sos", json={
            "name": "Field Scout Rao",
            "phone": "+91-99887-76655",
            "lat": 13.0850,
            "lng": 80.2750,
            "address": "Marina Slipway North",
            "emergency_type": "Flood",
            "people_count": 3,
            "description": "High water surge near slipway dock"
        })
        self.assertEqual(res_sos.status_code, 200)
        self.assertEqual(res_sos.json()["name"], "Field Scout Rao")

        res_hosp = self.client.get("/api/healthcare")
        self.assertEqual(res_hosp.status_code, 200)
        self.assertGreaterEqual(len(res_hosp.json()), 4)

    def test_voice_command_and_report(self):
        res_cmd = self.client.post("/api/voice/command", json={"audio_text": "show critical zones"})
        self.assertEqual(res_cmd.status_code, 200)
        self.assertEqual(res_cmd.json()["intent"], "SHOW_CRITICAL_ZONES")

        res_vrep = self.client.post("/api/voice/report", json={"voice_text": "Three people trapped on roof medical emergency", "language": "en"})
        self.assertEqual(res_vrep.status_code, 200)
        self.assertTrue(res_vrep.json()["medical_emergency"])

    def test_situation_report(self):
        res_sitrep = self.client.get("/api/situation-report")
        self.assertEqual(res_sitrep.status_code, 200)
        self.assertEqual(res_sitrep.json()["severity"], "CRITICAL")
        self.assertIn("current_response_plan_version", res_sitrep.json())

if __name__ == '__main__':
    unittest.main()
