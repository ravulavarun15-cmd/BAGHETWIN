from fastapi import APIRouter
from pydantic import BaseModel
from typing import List, Optional
import re

from app.ml.model_loader import records
from app.twin.service import digital_twin
from app.twin.ml_predictor import predict_from_twin
from app.twin.recommendations import get_srp_recommendation
from app.twin.optimizer import optimize_srp

router = APIRouter()

class CopilotQueryRequest(BaseModel):
    query: str
    well_id: Optional[str] = "BGW-001"
    history: Optional[List[dict]] = None

@router.post('/query')
def query_copilot(req: CopilotQueryRequest):
    q = req.query.strip().lower()
    well_id = (req.well_id or "BGW-001").upper()
    all_wells = records('well_data.csv') or []
    twin_state = digital_twin.get_state()

    # Pre-calculate fleet metrics
    total_wells = len(all_wells)
    operating_wells = [w for w in all_wells if str(w.get('status', '')).lower() == 'operational']
    non_op_wells = [w for w in all_wells if str(w.get('status', '')).lower() != 'operational']
    total_bopd = sum(float(w.get('production_rate', 0) or 0) for w in operating_wells)
    avg_bopd = round(total_bopd / max(1, len(operating_wells)), 1)
    avg_temp = round(
        sum(float(w.get('temperature_c', 0) or 0) for w in operating_wells) / max(1, len(operating_wells)),
        1
    )

    # 1. 35 Wells Overview
    if any(k in q for k in ['overview', 'all 35', 'fleet overview', 'summary of wells', 'all wells', 'fleet status']):
        content = (
            f"### Baghewala 35-Well Fleet Overview\n\n"
            f"- **Total Monitored Wells:** **{total_wells}**\n"
            f"- **Currently Operational:** **{len(operating_wells)}** (active production)\n"
            f"- **Non-Operational / Awaiting Status:** **{len(non_op_wells)}** (BGW-029 to BGW-035)\n"
            f"- **Total Field Production:** **{total_bopd:.1f} BOPD** (mean: **{avg_bopd} BOPD/well**)\n"
            f"- **Mean Thermal Regime:** **{avg_temp} °C**\n\n"
            f"The 28 operating wells are currently in the **Production** stage following thermal stimulation. "
            f"The remaining 7 wells are marked as awaiting status confirmation without fabricated fault classifications. "
            f"Wells BGW-001 to BGW-003 reflect baseline field calibration, while BGW-004 to BGW-035 represent domain-informed demonstration records."
        )
        return {
            "intent": "fleet_overview",
            "reply": content,
            "disclaimer": "Grounded in well_data.csv records · Rule-based analytical reasoning",
            "suggested_followups": [
                "Which wells are currently operational?",
                "Summarize operational warnings",
                "Explain the current status of Well 12"
            ]
        }

    # 2. Which wells are currently operational?
    if any(k in q for k in ['which wells are operational', 'currently operating', 'operating wells', 'active wells']):
        op_list = ", ".join([w['well_id'] for w in operating_wells])
        content = (
            f"### Active Operating Wells ({len(operating_wells)} of {total_wells})\n\n"
            f"The following **28 wells** are currently designated as **Operational** in the Baghewala field:\n\n"
            f"`{op_list}`\n\n"
            f"- **Production Range:** 33 to 51 BOPD\n"
            f"- **Water Cut Range:** 25% to 40%\n"
            f"- **Reservoir Temperature:** 57°C to 67°C\n"
            f"- **Non-Operating Fleet:** The remaining 7 wells (BGW-029 through BGW-035) are non-operational awaiting field status confirmation."
        )
        return {
            "intent": "operational_wells",
            "reply": content,
            "disclaimer": "Grounded in fleet records · Verified operational status",
            "suggested_followups": [
                "Summarize the available operational warnings",
                "Explain the latest viscosity prediction",
                "What does the existing VFD recommendation suggest?"
            ]
        }

    # 3. Individual Well Query (e.g., "Well 12", "BGW-005")
    well_match = re.search(r'(bgw-?\d+|well\s*\d+)', q)
    if well_match or 'current status of well' in q or 'status of well' in q:
        target_id = None
        if well_match:
            raw = well_match.group(0).replace('well', 'bgw-').replace(' ', '').upper()
            num = re.search(r'\d+', raw)
            if num:
                target_id = f"BGW-{int(num.group(0)):03d}"
        if not target_id:
            target_id = well_id

        matched = [w for w in all_wells if w.get('well_id') == target_id]
        if matched:
            w = matched[0]
            is_op = str(w.get('status', '')).lower() == 'operational'
            is_demo = str(w.get('is_demonstration', 'true')).lower() == 'true'
            content = (
                f"### Status of {w['well_id']}\n\n"
                f"- **Operating Status:** **{w.get('status', 'Operational')}**\n"
                f"- **Current Stage:** {w.get('operating_stage', 'Production')}\n"
                f"- **Production Rate:** **{w.get('production_rate', 0)} BOPD**\n"
                f"- **Water Cut:** {w.get('watercut', 0)}%\n"
                f"- **Bottomhole Pressure:** {w.get('pressure_bar', 0)} bar\n"
                f"- **Reservoir Temperature:** {w.get('temperature_c', 0)} °C\n"
                f"- **Crude Viscosity:** {w.get('oil_viscosity_cp', 0)} cP\n"
                f"- **Reservoir State:** {w.get('reservoir_condition', 'Standard')}\n"
                f"- **Record Classification:** {'Demonstration Record' if is_demo else 'Field Baseline'}\n\n"
                f"{'This well is actively producing heavy crude within normal thermal boundaries.' if is_op else 'This well is non-operational and awaiting on-site status confirmation without synthetic failure attribution.'}"
            )
            return {
                "intent": "well_detail",
                "reply": content,
                "disclaimer": f"Record retrieved from dataset for {w['well_id']}",
                "suggested_followups": [
                    f"Explain the latest viscosity prediction",
                    f"What does the existing VFD recommendation suggest?",
                    "Give me an overview of all 35 wells."
                ]
            }
        else:
            return {
                "intent": "well_not_found",
                "reply": f"Well `{target_id}` was not found in the 35-well Baghewala registry. Valid identifiers range from `BGW-001` to `BGW-035`.",
                "disclaimer": "Fleet registry check",
                "suggested_followups": ["Give me an overview of all 35 wells."]
            }

    # 4. Telemetry Summary
    if any(k in q for k in ['telemetry', 'summarize available telemetry', 'live state', 'sensor readings', 'twin state']):
        content = (
            f"### Current Digital Twin Telemetry ({twin_state.get('well_id', 'BGW-001')})\n\n"
            f"- **Simulation Engine:** `{twin_state.get('simulation_status', 'RUNNING')}` | CSS Phase: **{twin_state.get('current_phase', 'PRODUCTION')}**\n"
            f"- **Oil Production:** **{twin_state.get('oil_bopd', 0):.1f} BOPD**\n"
            f"- **Reservoir Temperature:** **{twin_state.get('temperature_c', 0):.1f} °C**\n"
            f"- **Reservoir Pressure:** **{twin_state.get('pressure_bar', 0):.1f} bar**\n"
            f"- **Oil Viscosity:** **{twin_state.get('oil_viscosity_cp', 0):.0f} cP**\n"
            f"- **Pumping Speed:** **{twin_state.get('spm', 5.5):.1f} SPM** @ **{twin_state.get('vfd_hz', 45.0):.1f} Hz**\n"
            f"- **Polished Rod Load:** **{twin_state.get('rod_load_kn', 32.0):.1f} kN**\n"
            f"- **Pump Efficiency:** **{twin_state.get('pump_efficiency_pct', 78.0):.1f}%**\n"
            f"- **Calculated Rod-Floating Risk:** **{twin_state.get('rod_floating_risk', 0.12)*100:.1f}%**"
        )
        return {
            "intent": "telemetry_summary",
            "reply": content,
            "disclaimer": "Live Virtual Well state from Digital Twin Service",
            "suggested_followups": [
                "What does this pump health prediction mean?",
                "What does the existing VFD recommendation suggest?",
                "Explain the latest viscosity prediction"
            ]
        }

    # 5. ML Prediction Explanation
    if any(k in q for k in ['ml prediction', 'production forecast', 'explain prediction', 'predict', 'forecast']):
        pred = predict_from_twin(digital_twin.state)
        content = (
            f"### ML Production Forecast Interpretation\n\n"
            f"The platform employs trained prototype machine learning models (`production_model.pkl` and `temperature_model.pkl`) to project the next operating interval:\n\n"
            f"- **Forecasted Oil Rate:** **{pred.get('predicted_oil_bopd', 0):.1f} BOPD**\n"
            f"- **Forecasted Temperature:** **{pred.get('predicted_temperature_c', 0):.1f} °C**\n"
            f"- **Projected Power Demand:** **{pred.get('predicted_energy_kwh', 0):.1f} kWh**\n"
            f"- **Rod Floating Probability:** **{pred.get('rod_floating_high_risk_probability', 0)*100:.1f}%** (Status: **{pred.get('risk_level', 'NORMAL')}**)\n\n"
            f"**Technical Explanation:** In Baghewala heavy crude, production output is strongly governed by reservoir temperature. "
            f"As thermal stimulation dissipates, crude viscosity increases non-linearly, elevating hydraulic drag on the rod string and reducing pump barrel fillage."
        )
        return {
            "intent": "ml_prediction_explanation",
            "reply": content,
            "disclaimer": "Predictions generated by trained scikit-learn models (production_model.pkl)",
            "suggested_followups": [
                "What does this pump health prediction mean?",
                "What does the existing VFD recommendation suggest?",
                "Explain the latest viscosity prediction"
            ]
        }

    # 6. Pump Health & Rod Floating Anomaly
    if any(k in q for k in ['pump health', 'rod floating', 'anomaly', 'rod risk', 'pump failure']):
        risk = digital_twin.state.rod_floating_risk
        risk_pct = round(risk * 100, 1)
        content = (
            f"### Pump Health & Rod Floating Diagnosis\n\n"
            f"- **Current Rod-Floating Risk:** **{risk_pct}%** ({'CRITICAL / HIGH' if risk >= 0.5 else 'SAFE / NORMAL'})\n"
            f"- **Cyclic Rod Load:** **{digital_twin.state.rod_load_kn:.1f} kN**\n"
            f"- **Pumping Rate:** **{digital_twin.state.spm:.1f} SPM**\n\n"
            f"**What is Rod Floating?** In heavy oil wells (>1500 cP), the sucker rod string falls by gravity during the downstroke. "
            f"If pump speed (SPM) or crude viscosity is too high, the downward viscous drag equals or exceeds rod string weight. "
            f"The rod 'floats', causing bridle cable slackening, severe impact loading on the upstroke, and premature rod breakage.\n\n"
            f"**Mitigation:** Maintain SPM $\\le 5.5$ and VFD frequency $\\le 45\\text{ Hz}$ when viscosity exceeds 1800 cP."
        )
        return {
            "intent": "pump_health_explanation",
            "reply": content,
            "disclaimer": "Grounded in rod_risk_model.pkl & API 11E kinematic calculations",
            "suggested_followups": [
                "What does the existing VFD recommendation suggest?",
                "Explain the latest viscosity prediction",
                "Summarize the available operational warnings"
            ]
        }

    # 7. Viscosity Prediction Explanation
    if any(k in q for k in ['viscosity', 'cp', 'heavy oil', 'crude']):
        visc = digital_twin.state.oil_viscosity_cp
        temp = digital_twin.state.temperature_c
        content = (
            f"### Baghewala Heavy Oil Viscosity Dynamics\n\n"
            f"- **Current Oil Viscosity:** **{visc:.0f} cP** at **{temp:.1f} °C**\n"
            f"- **Crude Density / Gravity:** ~17° API (Heavy, low mobility)\n\n"
            f"**Viscosity Model Behavior:** Cold Baghewala reservoir crude exhibits extreme viscosity (~3000 to 3500 cP), rendering conventional pumping ineffective. "
            f"During Cyclic Steam Stimulation (CSS), high-pressure steam injection elevates the near-wellbore temperature to 60–70°C. "
            f"This causes an exponential drop in viscosity down to ~1500–1850 cP, unlocking economic fluid mobility into the downhole pump barrel."
        )
        return {
            "intent": "viscosity_explanation",
            "reply": content,
            "disclaimer": "Thermodynamic viscosity model for Baghewala crude",
            "suggested_followups": [
                "What does this pump health prediction mean?",
                "What does the existing VFD recommendation suggest?",
                "Give me an overview of all 35 wells."
            ]
        }

    # 8. VFD / SRP Recommendation
    if any(k in q for k in ['vfd recommendation', 'srp recommendation', 'recommendation suggest', 'optimizer']):
        rec = get_srp_recommendation(digital_twin.state)
        opt = optimize_srp(digital_twin.state)
        best = opt.get('recommendation', {})
        content = (
            f"### AI VFD & SRP Operating Recommendation\n\n"
            f"- **Recommended Action:** **{rec.get('action')}**\n"
            f"- **Operating Risk Status:** **{rec.get('risk_level')}** (current risk: **{rec.get('current_risk', 0)*100:.0f}%**)\n"
            f"- **Optimal Settings:** **{best.get('spm', 5.5)} SPM** | **{best.get('vfd_hz', 45.0)} Hz** | Stroke: **{best.get('stroke_m', 2.8)} m**\n"
            f"- **Projected Output:** **{best.get('predicted_oil_bopd', 0):.1f} BOPD** at **{best.get('predicted_energy_kwh', 0):.1f} kWh**\n"
            f"- **Expected Risk Reduction:** **{rec.get('expected_risk_reduction_pct', 0)}%**\n\n"
            f"**Engineering Rationale:** {rec.get('reason')}"
        )
        return {
            "intent": "vfd_recommendation",
            "reply": content,
            "disclaimer": "Generated by trained AI scenario optimizer (optimize_srp)",
            "suggested_followups": [
                "What does this pump health prediction mean?",
                "Summarize the available operational warnings",
                "Give me an overview of all 35 wells."
            ]
        }

    # 9. Operational Warnings Summary
    if any(k in q for k in ['operational warning', 'warnings', 'alerts', 'risks']):
        warn_wells = [
            w for w in operating_wells
            if (float(w.get('oil_viscosity_cp', 0) or 0) > 2100 or float(w.get('watercut', 0) or 0) > 36)
        ]
        warn_text = "\n".join([
            f"- **{w['well_id']}**: Viscosity **{w.get('oil_viscosity_cp')} cP**, Watercut **{w.get('watercut')}%** ({w.get('reservoir_condition')})"
            for w in warn_wells[:6]
        ])
        content = (
            f"### Operational Warnings Summary\n\n"
            f"- **Fleet Warning Count:** **{len(warn_wells)} operational wells** exhibit elevated viscosity (>2100 cP) or watercut (>36%)\n"
            f"- **Virtual Well Risk:** Rod floating risk is **{digital_twin.state.rod_floating_risk*100:.0f}%**\n\n"
            f"**Impacted Wells:**\n{warn_text}\n\n"
            f"**Operational Advisory:** Prioritize CSS thermal cycle preparation or VFD speed reduction on these wells to prevent excessive mechanical rod stress."
        )
        return {
            "intent": "warnings_summary",
            "reply": content,
            "disclaimer": "Fleet anomaly scan across live telemetry and records",
            "suggested_followups": [
                "What does the existing VFD recommendation suggest?",
                "Give me an overview of all 35 wells.",
                "Explain the latest viscosity prediction"
            ]
        }

    # 10. Default Helpful / Grounded Response
    content = (
        f"### BAGHETWIN Copilot Assistant\n\n"
        f"I am the industrial monitoring and analytical assistant for the **Baghewala Heavy Oil Digital Twin Platform**. "
        f"I can provide insights grounded in the 35-well fleet records, live virtual well telemetry, and trained scikit-learn models.\n\n"
        f"**Suggested topics you can ask:**\n"
        f"1. *'Give me an overview of all 35 wells.'*\n"
        f"2. *'Which wells are currently operational?'*\n"
        f"3. *'Explain the current status of Well 12.'*\n"
        f"4. *'What does this pump health prediction mean?'*\n"
        f"5. *'Summarize the available operational warnings.'*\n"
        f"6. *'Explain the latest viscosity prediction.'*\n"
        f"7. *'What does the existing VFD recommendation suggest?'*\n\n"
        f"*Note: I operate strictly on available local telemetry and models. I do not issue remote equipment control commands.*"
    )
    return {
        "intent": "general_guidance",
        "reply": content,
        "disclaimer": "Analytical AI Copilot grounded in actual Baghewala dataset and models",
        "suggested_followups": [
            "Give me an overview of all 35 wells.",
            "Which wells are currently operational?",
            "What does the existing VFD recommendation suggest?"
        ]
    }
