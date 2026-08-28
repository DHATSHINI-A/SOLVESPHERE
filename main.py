"""
SOLVESPHERE - Complete Unified API
Integrates Member 1 (Auth & Problems), Member 2 (AI Engine), Member 3 (Matching Engine),
Workspace Collaboration, and Deployment & Impact modules.
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from problems import get_problem_by_id, PROBLEMS_DATABASE
from skill_matcher import run_problem_matching
from auth_problems import (
    router as auth_problems_router,
    init_auth_problems_db,
    get_problem_from_db,
    update_problem_status_in_db
)
from workspace import router as collaboration_router
from deployment_impact import router as deployment_router
from app import app as ai_app, init_db as init_ai_db, get_analysis_from_db

app = FastAPI(
    title="SOLVESPHERE Integrated Platform API",
    description="Complete end-to-end backend for SOLVESPHERE (Member 1 + Member 2 + Member 3)",
    version="1.0.0"
)

# Enable CORS for Frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def startup():
    """Initializes all database tables on application startup."""
    init_auth_problems_db()
    init_ai_db()

@app.get("/health", tags=["System"])
def health_check():
    """Health check endpoint verifying system components."""
    return {
        "status": "healthy",
        "service": "SOLVESPHERE Integrated Platform API",
        "modules": [
            "User Auth & Problem Submission (Member 1)",
            "AI Understanding Engine (Member 2)",
            "Matching Engine (Member 3)",
            "Collaboration Workspace",
            "Deployment & Impact"
        ]
    }

# Fallback defaults used when a problem does not have explicit target location/resources set
DEFAULT_REQUIRED_RESOURCES = [
    "IoT Hardware",
    "Water Testing Equipment",
    "Sensors",
    "Field Deployment Team",
]
DEFAULT_LOCATION = {
    "target_city": "Ranchi",
    "target_state": "Jharkhand",
    "target_location": "Ranchi, Jharkhand",
}

@app.get("/matching/{problem_id}", tags=["Matching Engine"])
def get_matching_partners(problem_id: str):
    """
    Full End-to-End Pipeline (Member 2 -> Member 3):
    1. Retrieves problem & AI analysis for problem_id.
    2. Auto-triggers AI analysis if problem exists but has not been analyzed yet.
    3. Merges AI-generated required_skills, domain, and keywords into matching pipeline.
    4. Executes 6-factor weighted partner matching engine against partner database.
    5. Updates problem status to 'Matched' in DB.
    6. Returns ranked Top 3-5 partners with explainability reasoning.
    """
    clean_pid = problem_id.strip()

    # 1. Fetch AI analysis from DB
    ai_analysis = get_analysis_from_db(clean_pid)
    
    # If no AI analysis found, check if problem exists in Member 1 DB or static DB
    db_problem = get_problem_from_db(clean_pid)
    static_problem = get_problem_by_id(clean_pid)

    if not ai_analysis:
        if db_problem or static_problem:
            # Auto-trigger AI analysis on the fly
            desc = db_problem["description"] if db_problem else static_problem.get("problem", "")
            from app import analyze_problem_with_gemini, normalize_ai_analysis, save_analysis_to_db
            raw_ai = analyze_problem_with_gemini(desc)
            ai_analysis = normalize_ai_analysis(raw_ai)
            save_analysis_to_db(clean_pid, desc, ai_analysis)
        else:
            raise HTTPException(
                status_code=404,
                detail=f"No problem or AI analysis found for problem_id '{clean_pid}'. Submit a problem via POST /problems first."
            )

    # 2. Build baseline metadata
    baseline = {}
    if db_problem:
        baseline = {
            "problem_id": db_problem["problem_id"],
            "problem": db_problem["description"],
            "required_resources": DEFAULT_REQUIRED_RESOURCES,
            "target_city": db_problem["location"],
            "target_state": db_problem["location"],
            "target_location": db_problem["location"],
        }
    elif static_problem:
        baseline = static_problem
    else:
        baseline = {
            "problem_id": clean_pid,
            "problem": ai_analysis.get("problem_description", ""),
            "required_resources": DEFAULT_REQUIRED_RESOURCES,
            **DEFAULT_LOCATION,
        }

    # 3. Merge AI fields cleanly
    keywords = ai_analysis.get("keywords", [])
    domain = ai_analysis.get("domain", "")
    ai_skills = ai_analysis.get("required_skills", [])
    baseline_skills = baseline.get("required_skills", [])
    merged_skills = list(dict.fromkeys(ai_skills + baseline_skills))

    merged_problem = {
        **baseline,
        "problem_domain": domain,
        "required_skills": merged_skills,
        "domain_keywords": [domain] + baseline.get("domain_keywords", []),
        "project_keywords": keywords + baseline.get("project_keywords", []),
        "urgency": ai_analysis.get("urgency", "Medium"),
        "problem_type": ai_analysis.get("problem_type", "General"),
    }

    # 4. Execute 6-Factor Matching Engine
    try:
        results = run_problem_matching(problem_data=merged_problem, top_k=5)
        
        # 5. Update Problem Status to 'Matched'
        if db_problem:
            update_problem_status_in_db(clean_pid, "Matched")
            results["status"] = "Matched"
            
        return results
    except FileNotFoundError as e:
        raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Matching calculation failed: {str(e)}"
        )

from dashboard import router as dashboard_router

# Mount Member 1 Auth & Problem routes
app.include_router(auth_problems_router)

# Mount Workspace Router
app.include_router(collaboration_router)

# Mount Deployment Router
app.include_router(deployment_router)

# Mount Dashboard Router
app.include_router(dashboard_router)

# Mount Member 2 AI Engine Router
app.mount("/", ai_app)

if __name__ == "__main__":
    import uvicorn
    init_auth_problems_db()
    init_ai_db()
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
