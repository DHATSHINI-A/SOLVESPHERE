import json
import os
import sqlite3
import uuid
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from google import genai
from google.genai import types, errors

# 1. Load API key from .env file
load_dotenv()

# 2. Connect to the Gemini API client
client = genai.Client()

# ==============================================================================
# DATABASE CONFIGURATION & STORAGE LOGIC (SQLite) WITH ERROR HANDLING
# ==============================================================================

DB_FILENAME = "solutionhub.db"

def init_db():
    """Initializes the SQLite database and creates the problem_analyses table if not exists."""
    try:
        conn = sqlite3.connect(DB_FILENAME)
        cursor = conn.cursor()
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS problem_analyses (
                problem_id TEXT PRIMARY KEY,
                problem_description TEXT NOT NULL,
                domain TEXT NOT NULL,
                required_skills TEXT NOT NULL,
                urgency TEXT NOT NULL,
                problem_type TEXT NOT NULL,
                keywords TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        conn.commit()
        conn.close()
    except sqlite3.Error as e:
        print(f"[CRITICAL] Database initialization error: {e}")

def save_analysis_to_db(problem_id: str, problem_description: str, analysis: dict):
    """Saves or updates a structured AI analysis in the SQLite database with error handling."""
    try:
        conn = sqlite3.connect(DB_FILENAME)
        cursor = conn.cursor()
        cursor.execute("""
            INSERT OR REPLACE INTO problem_analyses (
                problem_id, problem_description, domain, required_skills, urgency, problem_type, keywords
            ) VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (
            problem_id,
            problem_description,
            analysis["domain"],
            json.dumps(analysis["required_skills"]),
            analysis["urgency"],
            analysis["problem_type"],
            json.dumps(analysis["keywords"])
        ))
        conn.commit()
        conn.close()
    except sqlite3.Error as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={
                "error": "Database error",
                "message": f"AI analysis was generated successfully, but could not be stored in the database: {str(e)}"
            }
        )

def get_analysis_from_db(problem_id: str):
    """Retrieves a stored AI analysis from the database by problem_id with error handling."""
    try:
        conn = sqlite3.connect(DB_FILENAME)
        cursor = conn.cursor()
        cursor.execute("""
            SELECT problem_id, problem_description, domain, required_skills, urgency, problem_type, keywords, created_at
            FROM problem_analyses WHERE problem_id = ?
        """, (problem_id,))
        row = cursor.fetchone()
        conn.close()
    except sqlite3.Error as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={
                "error": "Database error",
                "message": f"Failed to retrieve analysis for '{problem_id}' from the database: {str(e)}"
            }
        )

    if not row:
        return None

    try:
        return {
            "problem_id": row[0],
            "problem_description": row[1],
            "domain": row[2],
            "required_skills": json.loads(row[3]),
            "urgency": row[4],
            "problem_type": row[5],
            "keywords": json.loads(row[6]),
            "created_at": row[7]
        }
    except json.JSONDecodeError:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={
                "error": "Corrupted Data",
                "message": f"Stored record for '{problem_id}' contains invalid JSON arrays."
            }
        )

# Import Member 4 (Collaboration Workspace) and Member 5 (Deployment & Impact Tracking) routers
from workspace import router as workspace_router, WORKSPACE_DATA
from deployment_impact import router as deployment_router, DEPLOYMENTS

# ==============================================================================
# FASTAPI APPLICATION INITIALIZATION (SOLVESPHERE Master Unified App)
# ==============================================================================

app = FastAPI(
    title="SOLVESPHERE - Digital Platform for Societal Problem Solving (SIH 2026)",
    description="Unified Backend API integrating AI Problem Understanding (Mem 2), Collaboration Workspace (Mem 4), and Deployment & Impact Tracking (Mem 5).",
    version="1.0.0"
)

# Initialize database table on application startup
@app.on_event("startup")
def on_startup():
    init_db()

# Enable CORS so Frontend/Member 1/clients can communicate from any browser or port
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount Member 4 & Member 5 Subsystem Routers
app.include_router(workspace_router)
app.include_router(deployment_router)

# ==============================================================================
# CONTROLLED TAXONOMY & SYNONYM DICTIONARIES (Tag Normalization)
# ==============================================================================

DOMAIN_MAPPING = {
    "water": "Water & Sanitation",
    "water & sanitation": "Water & Sanitation",
    "water management": "Water & Sanitation",
    "water/environment": "Water & Sanitation",
    "environmental technology": "Water & Sanitation",
    "agriculture": "Agriculture",
    "agritech": "Agriculture",
    "smart agriculture": "Agriculture",
    "farming": "Agriculture",
    "healthcare": "Healthcare",
    "health": "Healthcare",
    "public health": "Healthcare",
    "telemedicine": "Healthcare",
    "waste management": "Waste Management",
    "solid waste management": "Waste Management",
    "waste collection": "Waste Management",
    "disaster management": "Disaster Management",
    "disaster relief": "Disaster Management",
    "education": "Education",
    "edtech": "Education",
    "rural education": "Education",
    "public safety": "Public Safety",
    "safety": "Public Safety",
    "employment": "Employment",
    "livelihood": "Employment",
    "job development": "Employment",
    "environment": "Environment",
    "air quality": "Environment",
    "transportation": "Transportation",
    "traffic management": "Transportation",
    "urban transportation": "Transportation",
}

SKILL_MAPPING = {
    # IoT & Embedded Hardware
    "iot": "IoT",
    "internet of things": "IoT",
    "iot technology": "IoT",
    "iot sensors": "IoT",
    "iot sensor integration": "IoT",
    "sensors": "Sensors",
    "sensor technology": "Sensors",
    "embedded systems": "Embedded Systems",
    "embedded systems programming": "Embedded Systems",
    "circuit design": "Circuit Design",
    "low-cost circuit design": "Circuit Design",
    "wireless sensor networks": "Wireless Sensor Networks",
    "telemetry": "Telemetry",
    "telemetry systems": "Telemetry",
    
    # Software, AI & Data
    "ai": "Artificial Intelligence",
    "artificial intelligence": "Artificial Intelligence",
    "machine learning": "Machine Learning",
    "ml": "Machine Learning",
    "computer vision": "Computer Vision",
    "image processing": "Computer Vision",
    "data analytics": "Data Analytics",
    "data science": "Data Analytics",
    "mobile app development": "Mobile App Development",
    "mobile development": "Mobile App Development",
    "app development": "Mobile App Development",
    "telemedicine platforms": "Telemedicine",
    "telemedicine": "Telemedicine",
    "telehealth": "Telemedicine",
    "e-learning platform development": "EdTech Platforms",
    "edtech system architecture": "EdTech Platforms",
    "scholarship management systems": "EdTech Platforms",
    "digital mentorship systems": "EdTech Platforms",
    "job matching algorithms": "Recommendation Systems",
    "route optimization": "Route Optimization",
    "traffic flow optimization": "Traffic Flow Optimization",
    "intelligent transportation systems": "Intelligent Transportation",
    "smart lighting systems": "Smart Lighting",
    "fault detection algorithms": "Fault Detection",
    "gis": "GIS & Mapping",
    "gis mapping": "GIS & Mapping",

    # Domain-Specific Science & Engineering
    "water quality analysis": "Water Quality Analysis",
    "water quality testing": "Water Quality Analysis",
    "water treatment": "Water Treatment",
    "water filtration": "Water Treatment",
    "chemical analysis": "Chemical Sensing",
    "chemical sensing": "Chemical Sensing",
    "environmental chemistry": "Environmental Chemistry",
    "air quality analysis": "Air Quality Analysis",
    "plant pathology": "Plant Pathology",
    "hydrological modeling": "Hydrological Modeling",
    "automated waste sorting": "Waste Segregation",
    "logistics planning": "Logistics & Supply Chain",
}

def normalize_text(text):
    if not isinstance(text, str):
        return ""
    return text.strip().strip(",.").strip()

def normalize_domain(raw_domain):
    clean_domain = normalize_text(raw_domain).lower()
    return DOMAIN_MAPPING.get(clean_domain, raw_domain.strip().title())

def normalize_skills(raw_skills):
    if not isinstance(raw_skills, list):
        return []
    normalized_list = []
    seen = set()
    for skill in raw_skills:
        clean_skill = normalize_text(skill).lower()
        if not clean_skill:
            continue
        canonical_skill = SKILL_MAPPING.get(clean_skill, skill.strip().title())
        if canonical_skill.lower() not in seen:
            seen.add(canonical_skill.lower())
            normalized_list.append(canonical_skill)
    return normalized_list

def normalize_keywords(raw_keywords):
    if not isinstance(raw_keywords, list):
        return []
    normalized_list = []
    seen = set()
    for kw in raw_keywords:
        clean_kw = normalize_text(kw).lower()
        if clean_kw and clean_kw not in seen:
            seen.add(clean_kw)
            normalized_list.append(clean_kw)
    return normalized_list

def normalize_ai_analysis(raw_json_data):
    return {
        "domain": normalize_domain(raw_json_data.get("domain", "")),
        "required_skills": normalize_skills(raw_json_data.get("required_skills", [])),
        "urgency": raw_json_data.get("urgency", "Medium"),
        "problem_type": normalize_text(raw_json_data.get("problem_type", "")).title(),
        "keywords": normalize_keywords(raw_json_data.get("keywords", []))
    }

# ==============================================================================
# GEMINI AI UNDERSTANDING ENGINE WITH SPECIFIC ERROR HANDLING
# ==============================================================================

def analyze_problem_with_gemini(problem_description: str) -> dict:
    """
    Sends problem description to Gemini and parses the response.
    Catches and handles:
      - Quota / Rate-limit errors (HTTP 429)
      - Google Service / Connectivity failures (HTTP 503)
      - JSON Decoding errors (HTTP 502)
    """
    prompt = f"""
You are the AI Understanding Engine for a digital crowdsourcing platform that connects societal challenges with universities and industry partners for collaborative problem solving.

Your task is to analyze the submitted societal problem description and return a structured JSON object to help match this problem with researchers and engineers.

Analyze this problem description:
"{problem_description}"

Follow these strict rules for each JSON field:
1. "domain": Primary sector (string, e.g., "Water & Sanitation", "Healthcare", "Agriculture", "Environment", "Education", "Transportation", "Public Safety", "Waste Management", "Disaster Management", "Employment").
2. "required_skills": 3 to 5 specific, practical technical/domain skills needed to build a solution (array of strings, e.g., ["IoT Sensors", "Embedded Systems", "Water Quality Analysis"]). No vague skills like "Problem Solving".
3. "urgency": Must be EXACTLY one of these four strings: "Low", "Medium", "High", "Critical".
4. "problem_type": A concise 2-4 word classification of the type of solution required (string, e.g., "Water Quality Monitoring", "Crop Disease Diagnosis").
5. "keywords": 3 to 6 specific, relevant search tags (array of strings).

Return ONLY a valid JSON object matching this exact schema:
{{
  "domain": "string",
  "required_skills": ["string", "string"],
  "urgency": "Low" | "Medium" | "High" | "Critical",
  "problem_type": "string",
  "keywords": ["string", "string"]
}}
"""
    try:
        response = client.models.generate_content(
            model="gemini-3.5-flash-lite",
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json"
            )
        )
    except errors.ClientError as e:
        err_message = str(e)
        if "429" in err_message or "RESOURCE_EXHAUSTED" in err_message:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail={
                    "error": "AI service quota exceeded",
                    "message": "Gemini API rate limit / free-tier quota reached. Please try again in a few moments."
                }
            )
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail={
                    "error": "AI request error",
                    "message": f"Gemini API rejected request: {err_message}"
                }
            )
    except (errors.APIError, errors.ServerError) as e:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail={
                "error": "AI service unavailable",
                "message": "Unable to communicate with Gemini AI servers. Please check network connection and try again."
            }
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={
                "error": "Unexpected AI failure",
                "message": f"An unexpected error occurred while communicating with AI: {str(e)}"
            }
        )

    # Parse and validate the returned JSON string
    try:
        return json.loads(response.text.strip())
    except (json.JSONDecodeError, AttributeError) as e:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail={
                "error": "AI Output Parsing Error",
                "message": f"Gemini AI returned a non-JSON or malformed response: {str(e)}"
            }
        )

# ==============================================================================
# REQUEST & RESPONSE SCHEMAS (Pydantic Models)
# ==============================================================================

class ProblemRequest(BaseModel):
    problem_id: str | None = Field(
        default=None,
        description="Optional problem identifier (e.g. 'P001'). If omitted, a unique ID is generated.",
        example="P001"
    )
    problem_description: str = Field(
        ...,
        min_length=10,
        description="The societal problem description submitted by the citizen/user (must be at least 10 characters).",
        example="Our village has contaminated groundwater and needs an affordable monitoring system to detect harmful substances."
    )

class ProblemResponse(BaseModel):
    problem_id: str
    problem_description: str
    domain: str
    required_skills: list[str]
    urgency: str
    problem_type: str
    keywords: list[str]
    stored_in_db: bool = True

# ==============================================================================
# API ENDPOINTS
# ==============================================================================

@app.get("/", status_code=status.HTTP_200_OK)
def health_check():
    """Unified health check endpoint verifying all integrated platform subsystems."""
    return {
        "status": "online",
        "platform": "SOLVESPHERE - Digital Platform for Societal Problem Solving (SIH 2026)",
        "version": "1.0.0",
        "database": "SQLite (solutionhub.db)",
        "integrated_modules": {
            "member_2_ai_understanding": {
                "role": "AI Understanding Engine",
                "endpoints": [
                    "POST /ai/analyze",
                    "GET /ai/analysis/{problem_id}"
                ]
            },
            "member_4_collaboration": {
                "role": "Collaboration Workspace & TRL Tracking",
                "endpoints": [
                    "GET /collaboration/{project_id}",
                    "POST /collaboration/{project_id}/tasks",
                    "PATCH /collaboration/{project_id}/tasks/{task_id}",
                    "POST /collaboration/{project_id}/messages"
                ]
            },
            "member_5_deployment": {
                "role": "Deployment & Real-World Impact Analytics",
                "endpoints": [
                    "GET /deployment/",
                    "GET /deployment/{project_id}",
                    "POST /deployment/",
                    "PATCH /deployment/{project_id}/status",
                    "POST /deployment/{project_id}/metrics",
                    "GET /deployment/{project_id}/summary"
                ]
            },
            "unified_pipeline": {
                "role": "End-to-End Lifecycle Bridge",
                "endpoint": "GET /pipeline/{problem_id}"
            }
        }
    }

@app.post("/ai/analyze", response_model=ProblemResponse, status_code=status.HTTP_200_OK)
def analyze_problem_endpoint(request: ProblemRequest):
    """
    Main API endpoint for Member 1 / Frontend with comprehensive error handling.
    Flow:
      1. Validate Input (Pydantic + whitespace check)
      2. Call Gemini AI Engine (Handles 429 Quota, 503 Outage, 502 Bad JSON)
      3. Tag Normalization
      4. Database Storage (Handles SQLite errors)
      5. Return Structured Response
    """
    # 1. Input Validation (Whitespace and empty content check)
    clean_desc = request.problem_description.strip()
    if not clean_desc or len(clean_desc) < 10:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail={
                "error": "Invalid problem description",
                "message": "Problem description must contain at least 10 meaningful non-whitespace characters."
            }
        )

    # Use provided problem_id or auto-generate one
    pid = request.problem_id.strip() if request.problem_id else f"P-{uuid.uuid4().hex[:6].upper()}"

    # 2. Call Gemini AI Engine (Raises specific HTTPExceptions on failure)
    raw_ai_json = analyze_problem_with_gemini(clean_desc)
    
    # 3. Apply Tag Normalization
    try:
        standardized_json = normalize_ai_analysis(raw_ai_json)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={
                "error": "Normalization Error",
                "message": f"Failed to normalize AI tags: {str(e)}"
            }
        )
    
    # 4. Save analysis to SQLite database (Raises HTTP 500 on DB failure)
    save_analysis_to_db(pid, clean_desc, standardized_json)
    
    # 5. Return Final Structured JSON with Database status
    return {
        "problem_id": pid,
        "problem_description": clean_desc,
        "domain": standardized_json["domain"],
        "required_skills": standardized_json["required_skills"],
        "urgency": standardized_json["urgency"],
        "problem_type": standardized_json["problem_type"],
        "keywords": standardized_json["keywords"],
        "stored_in_db": True
    }

@app.get("/ai/analysis/{problem_id}", status_code=status.HTTP_200_OK)
def get_analysis_endpoint(problem_id: str):
    """
    Retrieval endpoint for Member 3 / matching engine.
    Fetches the stored AI analysis directly from the database without calling Gemini again.
    Returns HTTP 404 if record is not found.
    """
    clean_pid = problem_id.strip()
    if not clean_pid:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={
                "error": "Invalid Request",
                "message": "Problem ID cannot be empty."
            }
        )

    record = get_analysis_from_db(clean_pid)
    if not record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={
                "error": "Problem Not Found",
                "message": f"No analysis found for problem_id '{clean_pid}' in the database."
            }
        )
    return record

@app.get("/pipeline/{problem_id}", status_code=status.HTTP_200_OK)
def get_unified_pipeline_view(problem_id: str):
    """
    Unified 360-degree Lifecycle Endpoint connecting:
      - Member 2: AI Problem Understanding
      - Member 4: University-Industry Collaboration Workspace
      - Member 5: Deployment & Real-World Impact Metrics
    """
    clean_pid = problem_id.strip()

    # 1. Fetch AI Understanding Data (Member 2)
    ai_analysis = get_analysis_from_db(clean_pid)

    # 2. Fetch Collaboration Workspace Data (Member 4)
    collaboration_data = None
    for cid, cdata in WORKSPACE_DATA.items():
        if cdata.get("problemId") == clean_pid or clean_pid.lower() in [cid.lower(), "p1", "p001"]:
            collaboration_data = cdata
            break
    if not collaboration_data and "c1" in WORKSPACE_DATA:
        collaboration_data = WORKSPACE_DATA["c1"]

    # 3. Fetch Deployment & Impact Data (Member 5)
    deployment_data = None
    for did, ddata in DEPLOYMENTS.items():
        if ddata.get("problemId") == clean_pid or clean_pid.lower() in [did.lower(), "p1", "p001"]:
            deployment_data = ddata
            break
    if not deployment_data and "c1" in DEPLOYMENTS:
        deployment_data = DEPLOYMENTS["c1"]

    return {
        "success": True,
        "problem_id": clean_pid,
        "lifecycle_summary": {
            "stage_1_ai_understanding": {
                "status": "Completed" if ai_analysis else "Pending AI Analysis",
                "domain": ai_analysis.get("domain") if ai_analysis else None,
                "urgency": ai_analysis.get("urgency") if ai_analysis else None,
                "skills_identified": len(ai_analysis.get("required_skills", [])) if ai_analysis else 0,
                "data": ai_analysis
            },
            "stage_2_collaboration_workspace": {
                "status": "Active Project" if collaboration_data else "Pending Partner Matching",
                "project_id": collaboration_data.get("id") if collaboration_data else None,
                "project_title": collaboration_data.get("title") if collaboration_data else None,
                "trl_level": collaboration_data.get("trlLevel") if collaboration_data else None,
                "pipeline_step": collaboration_data.get("pipelineStep") if collaboration_data else None,
                "progress_percentage": collaboration_data.get("progress", 0) if collaboration_data else 0,
                "team_members_count": len(collaboration_data.get("members", [])) if collaboration_data else 0,
                "tasks_count": len(collaboration_data.get("tasks", [])) if collaboration_data else 0,
                "data": collaboration_data
            },
            "stage_3_deployment_and_impact": {
                "status": deployment_data.get("status") if deployment_data else "Not Ready",
                "location": deployment_data.get("location") if deployment_data else None,
                "beneficiaries": deployment_data.get("beneficiaries", 0) if deployment_data else 0,
                "units_deployed": deployment_data.get("unitsDeployed", 0) if deployment_data else 0,
                "metrics_tracked": len(deployment_data.get("metrics", [])) if deployment_data else 0,
                "data": deployment_data
            }
        }
    }

# Run server directly when executed with 'python app.py'
if __name__ == "__main__":
    import uvicorn
    init_db()
    uvicorn.run(app, host="127.0.0.1", port=8000)