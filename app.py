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
        conn = sqlite3.connect(DB_FILENAME, timeout=30.0)
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
    conn = None
    try:
        conn = sqlite3.connect(DB_FILENAME, timeout=30.0)
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
    except sqlite3.Error as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={
                "error": "Database error",
                "message": f"AI analysis was generated successfully, but could not be stored in the database: {str(e)}"
            }
        )
    finally:
        if conn:
            conn.close()

def get_analysis_from_db(problem_id: str):
    """Retrieves a stored AI analysis from the database by problem_id with error handling."""
    conn = None
    row = None
    try:
        conn = sqlite3.connect(DB_FILENAME, timeout=30.0)
        cursor = conn.cursor()
        cursor.execute("""
            SELECT problem_id, problem_description, domain, required_skills, urgency, problem_type, keywords, created_at
            FROM problem_analyses WHERE problem_id = ? OR problem_id = ? OR problem_id = ?
        """, (problem_id, f"SIH{problem_id}", problem_id.replace("SIH", "")))
        row = cursor.fetchone()
    except sqlite3.Error as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={
                "error": "Database error",
                "message": f"Failed to retrieve analysis for '{problem_id}' from the database: {str(e)}"
            }
        )
    finally:
        if conn:
            conn.close()

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

# ==============================================================================
# FASTAPI APPLICATION INITIALIZATION
# ==============================================================================

app = FastAPI(
    title="SIH 2026 - AI Understanding Engine API",
    description="Module 2 Backend: Analyzes societal problems using Gemini AI with robust error handling and SQLite storage.",
    version="1.0.0"
)

# Initialize database table on application startup
@app.on_event("startup")
def on_startup():
    init_db()

# Enable CORS so Frontend/Member 1 can communicate from any browser or port
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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
    """Health check endpoint to verify that the AI service and database are operational."""
    return {
        "status": "online",
        "service": "AI Understanding Engine API",
        "database": "SQLite (solutionhub.db)",
        "version": "1.0.0",
        "endpoints": ["POST /ai/analyze", "GET /ai/analysis/{problem_id}"]
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

@app.post("/ai/analyze/{problem_id}", response_model=ProblemResponse, status_code=status.HTTP_200_OK)
def analyze_problem_by_id_endpoint(problem_id: str):
    """
    Triggers AI analysis for a problem already stored in the database by problem_id.
    """
    clean_pid = problem_id.strip()
    if not clean_pid:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Problem ID cannot be empty."
        )

    # 1. Try to find the problem in DB
    from auth_problems import get_problem_from_db, update_problem_status_in_db
    prob = get_problem_from_db(clean_pid)
    
    desc = ""
    if prob:
        desc = prob["description"]
    else:
        # Check static database fallback
        from problems import get_problem_by_id
        static_p = get_problem_by_id(clean_pid)
        if static_p:
            desc = static_p.get("problem", "")
        else:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Problem with ID '{clean_pid}' not found in database."
            )

    if not desc or len(desc) < 10:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Problem description must be at least 10 non-whitespace characters."
        )

    # 2. Run Gemini AI
    raw_ai_json = analyze_problem_with_gemini(desc)
    standardized_json = normalize_ai_analysis(raw_ai_json)

    # 3. Save to DB
    save_analysis_to_db(clean_pid, desc, standardized_json)
    
    # 4. Update status to Under Review
    if prob:
        update_problem_status_in_db(clean_pid, "Under Review")

    return {
        "problem_id": clean_pid,
        "problem_description": desc,
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

# Run server directly when executed with 'python app.py'
if __name__ == "__main__":
    import uvicorn
    init_db()
    uvicorn.run(app, host="127.0.0.1", port=8000)