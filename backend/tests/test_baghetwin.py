import unittest
from app.main import health
from app.api.wells import list_wells, get_well
from app.api.copilot import query_copilot, CopilotQueryRequest
from app.api.twin import get_twin_state, get_prediction, get_recommendation

class BagheTwinEndToEndDirectTest(unittest.TestCase):
    def test_health_endpoint(self):
        data = health()
        self.assertEqual(data.get('project'), 'BAGHETWIN')
        self.assertEqual(data.get('status'), 'ok')
        self.assertEqual(data.get('field'), 'Baghewala')

    def test_35_wells_fleet_configuration(self):
        data = list_wells()
        wells = data.get('wells', [])
        summary = data.get('summary', {})

        # Strict checks for 35 total, 28 operating, 7 non-operating
        self.assertEqual(len(wells), 35, "Total wells must be exactly 35")
        self.assertEqual(summary.get('total_wells'), 35)
        self.assertEqual(summary.get('operating_wells'), 28, "Operating wells must be exactly 28")
        self.assertEqual(summary.get('non_operating_wells'), 7, "Non-operating wells must be exactly 7")
        self.assertTrue(summary.get('total_production_bopd') > 0)
        self.assertTrue(summary.get('avg_production_bopd') > 0)

        # Verify BGW-001 through BGW-028 are operational
        for i in range(1, 29):
            w_id = f"BGW-{i:03d}"
            match = next((w for w in wells if w['well_id'] == w_id), None)
            self.assertIsNotNone(match, f"Well {w_id} must exist")
            self.assertEqual(match.get('status'), 'Operational')
            self.assertEqual(match.get('operating_stage'), 'Production')

        # Verify BGW-029 through BGW-035 are non-operational / awaiting status
        for i in range(29, 36):
            w_id = f"BGW-{i:03d}"
            match = next((w for w in wells if w['well_id'] == w_id), None)
            self.assertIsNotNone(match, f"Well {w_id} must exist")
            self.assertEqual(match.get('status'), 'Non-Operational')
            self.assertEqual(match.get('operating_stage'), 'Awaiting Status Confirmation')

    def test_individual_well_endpoint(self):
        w = get_well('BGW-012')
        self.assertEqual(w.get('well_id'), 'BGW-012')
        self.assertEqual(w.get('status'), 'Operational')

        w_non_op = get_well('BGW-030')
        self.assertEqual(w_non_op.get('well_id'), 'BGW-030')
        self.assertEqual(w_non_op.get('status'), 'Non-Operational')

    def test_copilot_queries(self):
        test_queries = [
            "Give me an overview of all 35 wells.",
            "Which wells are currently operational?",
            "Explain the current status of Well 12.",
            "What does this pump health prediction mean?",
            "Summarize the available operational warnings.",
            "Explain the latest viscosity prediction.",
            "What does the existing VFD recommendation suggest?"
        ]

        for q in test_queries:
            req = CopilotQueryRequest(query=q, well_id="BGW-001")
            data = query_copilot(req)
            self.assertTrue(len(data.get('reply', '')) > 20, f"Query '{q}' returned empty reply")
            self.assertIn('disclaimer', data, f"Query '{q}' missing required disclaimer")

    def test_twin_state_and_prediction(self):
        state = get_twin_state()
        self.assertIn('oil_bopd', state)
        self.assertIn('rod_floating_risk', state)

        pred = get_prediction()
        self.assertIn('predicted_oil_bopd', pred)
        self.assertIn('predicted_temperature_c', pred)

        rec = get_recommendation()
        self.assertIn('recommended_spm', rec)
        self.assertIn('recommended_vfd_hz', rec)

    def test_history_endpoints(self):
        from app.api.history import get_history, get_historical_trends, get_history_summary, log_event, HistoryEventCreate

        hist = get_history(limit=50)
        self.assertIn('events', hist)
        self.assertTrue(len(hist['events']) > 0)
        self.assertTrue(hist['total_matches'] > 0)

        # Filter by well
        hist_bgw1 = get_history(well_id='BGW-001', limit=20)
        for ev in hist_bgw1['events']:
            self.assertEqual(ev['well_id'], 'BGW-001')

        # Historical trends
        trends = get_historical_trends(well_id='BGW-001')
        self.assertEqual(trends['well_id'], 'BGW-001')
        self.assertTrue(len(trends['points']) > 0)
        self.assertIn('oil_bopd', trends['points'][0])

        # Summary
        summary = get_history_summary()
        self.assertTrue(summary['total_records'] > 0)
        self.assertIn('incident_resolution_rate_pct', summary)

        # Log new event
        res = log_event(HistoryEventCreate(
            well_id='BGW-001',
            category='audit',
            event_type='Test Audit Event',
            message='Unit test audit message verification',
            severity='NORMAL'
        ))
        self.assertEqual(res.get('status'), 'logged')

if __name__ == '__main__':
    unittest.main()

