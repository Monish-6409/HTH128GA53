import unittest
import sys
import os

# Add parent directory to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from engine import disaster_engine

class TestDisasterEngine(unittest.TestCase):
    def setUp(self):
        disaster_engine.reset_to_default_scenario()

    def test_initial_state(self):
        self.assertEqual(disaster_engine.disaster.severity, "CRITICAL")
        self.assertEqual(len(disaster_engine.zones), 4)
        self.assertIn("ZONE-A", disaster_engine.zones)
        self.assertIn("res_boat", disaster_engine.resources)
        self.assertEqual(len(disaster_engine.agents), 5)

    def test_non_exceedance_resource_constraint(self):
        # Total boats is 12, available is 2, allocated is 8
        boat = disaster_engine.resources["res_boat"]
        self.assertLessEqual(boat.allocated, boat.total)
        self.assertEqual(boat.remaining, boat.available)

    def test_initial_debate_and_resolution(self):
        self.assertGreaterEqual(len(disaster_engine.debates), 1)
        debate = disaster_engine.debates[0]
        self.assertIn("TRIAGE", debate.involved_agents)
        self.assertIn("CONVOY", debate.involved_agents)
        self.assertGreater(debate.consensus_score, 0.8)

    def test_plan_v1_and_success_indicator(self):
        plan = disaster_engine.current_plan
        self.assertEqual(plan.version, "Plan v1")
        self.assertGreaterEqual(plan.success_indicator.overall_score, 75)
        self.assertGreater(len(plan.allocations), 0)
        self.assertGreater(len(plan.explanations), 0)

    def test_road_collapse_and_automatic_rollback(self):
        initial_version = disaster_engine.current_plan.version
        res = disaster_engine.inject_event("ROAD_COLLAPSE")
        
        self.assertIn("new_plan", res)
        self.assertNotEqual(disaster_engine.current_plan.version, initial_version)
        self.assertEqual(disaster_engine.current_plan.version, "Plan v2")
        
        # Verify rollback record
        self.assertGreaterEqual(len(disaster_engine.rollbacks), 1)
        rb = disaster_engine.rollbacks[0]
        self.assertEqual(rb.previous_plan_version, "Plan v1")
        self.assertEqual(rb.new_plan_version, "Plan v2")

        # Verify Causeway Arterial 1 route is blocked in Zone A
        self.assertIn("Causeway Arterial 1", disaster_engine.zones["ZONE-A"].blocked_routes)

    def test_forecast_module(self):
        forecasts = disaster_engine.get_resource_forecasts()
        self.assertEqual(len(forecasts), len(disaster_engine.resources))
        med_forecast = next((f for f in forecasts if f.resource_id == "res_med"), None)
        self.assertIsNotNone(med_forecast)
        self.assertGreater(med_forecast.consumption_rate_hourly, 0)
        self.assertGreater(len(med_forecast.recommendations), 0)

    def test_sos_submission_and_duplicate_detection(self):
        # Submit first SOS in a new location
        sos1 = disaster_engine.submit_sos({
            "name": "Citizen A",
            "lat": 13.0200,
            "lng": 80.2100,
            "emergency_type": "Trapped",
            "description": "Trapped on roof"
        })
        self.assertIsNotNone(sos1.id)
        self.assertIsNone(sos1.duplicate_of)

        # Submit close duplicate SOS within 0.005 distance
        sos2 = disaster_engine.submit_sos({
            "name": "Citizen B",
            "lat": 13.0202,
            "lng": 80.2101,
            "emergency_type": "Trapped",
            "description": "Also trapped here"
        })
        self.assertEqual(sos2.duplicate_of, sos1.id)

    def test_voice_command_interpretation(self):
        res = disaster_engine.process_voice_command("show critical zones")
        self.assertEqual(res.intent, "SHOW_CRITICAL_ZONES")

        res_boat = disaster_engine.process_voice_command("show available rescue boats")
        self.assertEqual(res_boat.intent, "SHOW_RESCUE_BOATS")

        res_recalc = disaster_engine.process_voice_command("recalculate response plan")
        self.assertEqual(res_recalc.intent, "RECALCULATE_PLAN")

if __name__ == '__main__':
    unittest.main()
