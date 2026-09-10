from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import List
from app.db.mongodb import get_db
from app.core.security import get_current_user
from app.models.simulation import SimulationCreate, SimulationResponse, SimulationResultInDB
from bson import ObjectId
from datetime import datetime
import random

router = APIRouter()

@router.post("/", response_model=SimulationResponse)
def run_sim(sim_in: SimulationCreate, db = Depends(get_db), current_user: dict = Depends(get_current_user)):
    s_data = sim_in.model_dump()
    s_data["created_by"] = current_user["id"]
    s_data["created_at"] = datetime.utcnow()
    s_data["status"] = "COMPLETED"
    
    res = db.simulations.insert_one(s_data)
    sim_id = str(res.inserted_id)
    
    # Generate mock result
    res_data = {
        "simulation_id": sim_id,
        "results": {
            "predicted_enrollment": random.randint(50, 200),
            "estimated_timeline_days": random.randint(90, 365),
            "dropout_rate_estimate": round(random.uniform(0.05, 0.20), 2)
        }
    }
    db.simulation_results.insert_one(res_data)
    
    s_data["_id"] = sim_id
    return s_data

@router.get("/", response_model=List[SimulationResponse])
def list_sims(db = Depends(get_db), current_user: dict = Depends(get_current_user)):
    sims = list(db.simulations.find({"created_by": current_user["id"]}))
    for s in sims: s["_id"] = str(s["_id"])
    return sims

@router.get("/{id}/results")
def get_sim_results(id: str, db = Depends(get_db), current_user: dict = Depends(get_current_user)):
    res = db.simulation_results.find_one({"simulation_id": id})
    if not res:
        raise HTTPException(status_code=404, detail="Not found")
    res["_id"] = str(res["_id"])
    return res

class DoseResponseRequest(BaseModel):
    baseline_egfr: float = 58.0
    baseline_uacr: float = 180.0
    dosage_mg: int = 25
    treatment_weeks: int = 24

@router.post("/dose-response")
def run_dose_response(req: DoseResponseRequest, current_user: dict = Depends(get_current_user)):
    from app.services.ai_safeguards_service import simulate_renal_dose_response
    result = simulate_renal_dose_response(
        baseline_egfr=req.baseline_egfr,
        baseline_uacr=req.baseline_uacr,
        dosage_mg=req.dosage_mg,
        treatment_weeks=req.treatment_weeks
    )
    return result
