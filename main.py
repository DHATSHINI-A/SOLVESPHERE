"""
SOLVESPHERE - Member 3 Matching Engine API
Provides REST API endpoints for Problem-to-Partner matching.
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from problems import get_problem_by_id, PROBLEMS_DATABASE
from skill_matcher import run_problem_matching

app = FastAPI(
    title="SOLVESPHERE Matching Engine API",
    description="Member 3 - Problem-to-Partner AI Matching Engine for SIH 2026 (SIH26043)",
    version="1.0.0"
)

# Enable Cross-Origin Resource Sharing (CORS) for Frontend & other SOLVESPHERE modules
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health", tags=["System"])
def health_check():
    """Health check endpoint to verify that the matching service is running."""
    return {"status": "healthy", "service": "SOLVESPHERE Matching Engine", "version": "1.0.0"}

@app.get("/problems", tags=["Problems"])
def list_problems():
    """Lists all available societal problems in the database."""
    return {
        "count": len(PROBLEMS_DATABASE),
        "problems": [
            {
                "problem_id": p["problem_id"],
                "problem": p["problem"],
                "problem_domain": p["problem_domain"]
            }
            for p in PROBLEMS_DATABASE.values()
        ]
    }

@app.get("/matching/{problem_id}", tags=["Matching Engine"])
def get_matching_partners(problem_id: str):
    """
    GET /matching/{problem_id}
    Retrieves the problem metadata, executes the 6-factor weighted matching algorithm
    against partners.csv, and returns the ranked Top 5 recommended partners with explainable AI reasoning.
    """
    # 1. Retrieve problem from database
    problem = get_problem_by_id(problem_id)
    if not problem:
        raise HTTPException(
            status_code=404,
            detail=f"Problem with ID '{problem_id}' not found in SOLVESPHERE database."
        )

    # 2. Run existing matching engine pipeline (Reusing skill_matcher logic)
    try:
        results = run_problem_matching(problem_data=problem, top_k=5)
        return results
    except FileNotFoundError as e:
        raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Matching calculation failed: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    print("Starting SOLVESPHERE Matching Engine API on http://127.0.0.1:8000 ...")
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)

