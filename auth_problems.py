import sqlite3
import hashlib
import uuid
from typing import Optional
from fastapi import APIRouter, HTTPException, status, Header
from pydantic import BaseModel, Field

DB_FILENAME = "solutionhub.db"

def init_auth_problems_db():
    """Initializes the SQLite database tables for users and problems."""
    conn = None
    try:
        conn = sqlite3.connect(DB_FILENAME, timeout=30.0)
        cursor = conn.cursor()
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                email TEXT UNIQUE NOT NULL,
                password_hash TEXT NOT NULL,
                role TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS problems (
                problem_id TEXT PRIMARY KEY,
                user_id TEXT NOT NULL,
                title TEXT NOT NULL,
                description TEXT NOT NULL,
                category TEXT NOT NULL,
                location TEXT NOT NULL,
                urgency TEXT NOT NULL,
                status TEXT NOT NULL DEFAULT 'Submitted',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id)
            )
        """)
        conn.commit()
    except sqlite3.Error as e:
        print(f"[CRITICAL] Auth/Problems database init error: {e}")
    finally:
        if conn:
            conn.close()

# Ensure DB tables exist on import
init_auth_problems_db()

def hash_password(password: str) -> str:
    """Simple SHA-256 password hashing for prototype security."""
    return hashlib.sha256(password.encode('utf-8')).hexdigest()

# Router definition
router = APIRouter()

# Pydantic Schemas
VALID_ROLES = {"Citizen", "NGO/Government", "University", "Industry", "Admin"}

class RegisterRequest(BaseModel):
    name: str = Field(..., min_length=2, example="Jane Doe")
    email: str = Field(..., example="jane@example.com")
    password: str = Field(..., min_length=6, example="secret123")
    role: str = Field(default="Citizen", example="Citizen")

class LoginRequest(BaseModel):
    email: str = Field(..., example="jane@example.com")
    password: str = Field(..., example="secret123")

class UserResponse(BaseModel):
    user_id: str
    name: str
    email: str
    role: str

class ProblemCreateRequest(BaseModel):
    title: str = Field(..., min_length=3, example="Groundwater contamination")
    description: str = Field(..., min_length=10, example="Our village has contaminated groundwater and needs an affordable monitoring system.")
    category: str = Field(..., example="Environment")
    location: str = Field(..., example="Jharkhand")
    urgency: str = Field(default="Medium", example="High")
    user_id: Optional[str] = Field(default="U-ANONYMOUS", example="U001")

class ProblemResponse(BaseModel):
    problem_id: str
    user_id: str
    title: str
    description: str
    category: str
    location: str
    urgency: str
    status: str
    created_at: str

# Helper DB Functions
def get_problem_from_db(problem_id: str) -> Optional[dict]:
    clean_id = problem_id.strip()
    conn = None
    row = None
    try:
        conn = sqlite3.connect(DB_FILENAME, timeout=30.0)
        cursor = conn.cursor()
        cursor.execute("""
            SELECT problem_id, user_id, title, description, category, location, urgency, status, created_at
            FROM problems
            WHERE problem_id = ? OR problem_id = ? OR problem_id = ?
        """, (clean_id, f"SIH{clean_id}", clean_id.replace("SIH", "")))
        row = cursor.fetchone()
    except sqlite3.Error as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database error fetching problem: {str(e)}"
        )
    finally:
        if conn:
            conn.close()

    if not row:
        return None

    return {
        "problem_id": row[0],
        "user_id": row[1],
        "title": row[2],
        "description": row[3],
        "category": row[4],
        "location": row[5],
        "urgency": row[6],
        "status": row[7],
        "created_at": str(row[8])
    }

def update_problem_status_in_db(problem_id: str, new_status: str):
    clean_id = problem_id.strip()
    conn = None
    try:
        conn = sqlite3.connect(DB_FILENAME, timeout=30.0)
        cursor = conn.cursor()
        cursor.execute("""
            UPDATE problems SET status = ?
            WHERE problem_id = ? OR problem_id = ? OR problem_id = ?
        """, (new_status, clean_id, f"SIH{clean_id}", clean_id.replace("SIH", "")))
        conn.commit()
    except sqlite3.Error as e:
        print(f"[ERROR] Failed to update problem status: {e}")
    finally:
        if conn:
            conn.close()

# Endpoints
@router.post("/auth/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED, tags=["Auth"])
def register(request: RegisterRequest):
    if request.role not in VALID_ROLES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid role '{request.role}'. Valid roles: {list(VALID_ROLES)}"
        )
    
    uid = f"U-{uuid.uuid4().hex[:6].upper()}"
    pwd_hash = hash_password(request.password)
    conn = None

    try:
        conn = sqlite3.connect(DB_FILENAME, timeout=30.0)
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO users (id, name, email, password_hash, role)
            VALUES (?, ?, ?, ?, ?)
        """, (uid, request.name.strip(), request.email.lower().strip(), pwd_hash, request.role))
        conn.commit()
    except sqlite3.IntegrityError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"User with email '{request.email}' already exists."
        )
    except sqlite3.Error as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database error during registration: {str(e)}"
        )
    finally:
        if conn:
            conn.close()

    return {
        "user_id": uid,
        "name": request.name.strip(),
        "email": request.email.lower().strip(),
        "role": request.role
    }

@router.post("/auth/login", response_model=UserResponse, status_code=status.HTTP_200_OK, tags=["Auth"])
def login(request: LoginRequest):
    pwd_hash = hash_password(request.password)
    conn = None
    row = None
    try:
        conn = sqlite3.connect(DB_FILENAME, timeout=30.0)
        cursor = conn.cursor()
        cursor.execute("""
            SELECT id, name, email, role FROM users
            WHERE email = ? AND password_hash = ?
        """, (request.email.lower().strip(), pwd_hash))
        row = cursor.fetchone()
    except sqlite3.Error as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database error during login: {str(e)}"
        )
    finally:
        if conn:
            conn.close()

    if not row:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password."
        )

    return {
        "user_id": row[0],
        "name": row[1],
        "email": row[2],
        "role": row[3]
    }

@router.post("/problems", response_model=ProblemResponse, status_code=status.HTTP_201_CREATED, tags=["Problems"])
def create_problem(request: ProblemCreateRequest):
    if len(request.description.strip()) < 10:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Problem description must be at least 10 non-whitespace characters."
        )

    pid = f"P-{uuid.uuid4().hex[:6].upper()}"
    status_val = "Submitted"
    conn = None
    row = None

    try:
        conn = sqlite3.connect(DB_FILENAME, timeout=30.0)
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO problems (problem_id, user_id, title, description, category, location, urgency, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            pid,
            request.user_id,
            request.title.strip(),
            request.description.strip(),
            request.category.strip(),
            request.location.strip(),
            request.urgency.strip(),
            status_val
        ))
        conn.commit()
        
        cursor.execute("""
            SELECT problem_id, user_id, title, description, category, location, urgency, status, created_at
            FROM problems WHERE problem_id = ?
        """, (pid,))
        row = cursor.fetchone()
    except sqlite3.Error as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to save problem in database: {str(e)}"
        )
    finally:
        if conn:
            conn.close()

    return {
        "problem_id": row[0],
        "user_id": row[1],
        "title": row[2],
        "description": row[3],
        "category": row[4],
        "location": row[5],
        "urgency": row[6],
        "status": row[7],
        "created_at": str(row[8])
    }

@router.get("/problems", tags=["Problems"])
def list_submitted_problems():
    conn = None
    rows = []
    try:
        conn = sqlite3.connect(DB_FILENAME, timeout=30.0)
        cursor = conn.cursor()
        cursor.execute("""
            SELECT problem_id, user_id, title, description, category, location, urgency, status, created_at
            FROM problems ORDER BY created_at DESC
        """)
        rows = cursor.fetchall()
    except sqlite3.Error as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve problems: {str(e)}"
        )
    finally:
        if conn:
            conn.close()

    problems = [
        {
            "problem_id": r[0],
            "user_id": r[1],
            "title": r[2],
            "description": r[3],
            "category": r[4],
            "location": r[5],
            "urgency": r[6],
            "status": r[7],
            "created_at": str(r[8])
        }
        for r in rows
    ]
    return {"count": len(problems), "problems": problems}

@router.get("/problems/{problem_id}", response_model=ProblemResponse, tags=["Problems"])
def get_problem_by_id_endpoint(problem_id: str):
    problem = get_problem_from_db(problem_id)
    if not problem:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Problem with ID '{problem_id}' not found."
        )
    return problem

@router.get("/users/me/problems", tags=["Problems"])
def get_user_problems(user_id: Optional[str] = "U-ANONYMOUS"):
    conn = None
    rows = []
    try:
        conn = sqlite3.connect(DB_FILENAME, timeout=30.0)
        cursor = conn.cursor()
        cursor.execute("""
            SELECT problem_id, user_id, title, description, category, location, urgency, status, created_at
            FROM problems WHERE user_id = ? ORDER BY created_at DESC
        """, (user_id,))
        rows = cursor.fetchall()
    except sqlite3.Error as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve user problems: {str(e)}"
        )
    finally:
        if conn:
            conn.close()

    problems = [
        {
            "problem_id": r[0],
            "user_id": r[1],
            "title": r[2],
            "description": r[3],
            "category": r[4],
            "location": r[5],
            "urgency": r[6],
            "status": r[7],
            "created_at": str(r[8])
        }
        for r in rows
    ]
    return {"count": len(problems), "problems": problems}
