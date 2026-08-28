from fastapi import APIRouter, FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

router = APIRouter(prefix="/collaboration", tags=["Collaboration Workspace"])

# In-Memory Database matching frontend 'CollaborationProject' type exactly
WORKSPACE_DATA = {
    "c1": {
        "id": "c1",
        "problemId": "p1",
        "title": "Solar-Powered Nanofiltration for Rural Water Security",
        "trlLevel": 6,
        "pipelineStep": "build",
        "progress": 33,
        "budget": 450000,
        "members": [
            {
                "userId": "u1",
                "name": "Dr. Anitha Rao",
                "role": "Lead Researcher",
                "org": "IIT Madras",
                "avatar": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250"
            },
            {
                "userId": "u2",
                "name": "Vikram Patel",
                "role": "Fabrication Lead",
                "org": "GreenTech Solutions Ltd.",
                "avatar": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=250"
            }
        ],
        "tasks": [
            {
                "id": "t1",
                "title": "Optimize Nanofiltration Flow Rate",
                "status": "Done",
                "priority": "high",
                "assignee": "Dr. Anitha Rao",
                "dueDate": "2026-09-05"
            },
            {
                "id": "t2",
                "title": "Fabricate Weatherproof Chassis",
                "status": "In Progress",
                "priority": "medium",
                "assignee": "Vikram Patel",
                "dueDate": "2026-09-12"
            },
            {
                "id": "t3",
                "title": "Village Pilot Water Sampling",
                "status": "To Do",
                "priority": "high",
                "assignee": "Dr. Anitha Rao",
                "dueDate": "2026-09-20"
            }
        ],
        "discussions": [
            {
                "id": "m1",
                "sender": "Vikram Patel",
                "senderRole": "industry",
                "avatar": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=250",
                "timestamp": "10:30 AM",
                "content": "Solar chassis fabrication is 80% complete. Ready for lab testing next Monday."
            }
        ],
        "files": [
            {
                "id": "f1",
                "name": "Nanofiltration_Flow_Schematic_v2.pdf",
                "size": "2.4 MB",
                "uploadedBy": "Dr. Anitha Rao",
                "date": "2026-08-25"
            }
        ]
    }
}

class TaskCreate(BaseModel):
    title: str
    status: str = "To Do"
    priority: str = "medium"
    assignee: Optional[str] = "Unassigned"
    dueDate: Optional[str] = "2026-09-30"

class TaskStatusUpdate(BaseModel):
    status: str

class MessageCreate(BaseModel):
    sender: str = "Team Member"
    senderRole: Optional[str] = "researcher"
    avatar: Optional[str] = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250"
    content: str

def _get_valid_project(project_id: str) -> str:
    return project_id if project_id in WORKSPACE_DATA else "c1"

def _recalculate_progress(project_id: str):
    tasks = WORKSPACE_DATA[project_id]["tasks"]
    if not tasks:
        WORKSPACE_DATA[project_id]["progress"] = 0
        return
    done_count = len([t for t in tasks if t["status"] == "Done"])
    WORKSPACE_DATA[project_id]["progress"] = int((done_count / len(tasks)) * 100)

class ProjectCreateFromMatch(BaseModel):
    problemId: str
    title: str
    selectedPartners: List[dict] = []

@router.get("/")
def list_collaborations():
    return {"data": list(WORKSPACE_DATA.values())}

@router.post("/create-from-match")
def create_project_from_match(payload: ProjectCreateFromMatch):
    project_id = f"c-{payload.problemId}"
    
    # Map selected partners to workspace member models
    members = []
    for idx, p in enumerate(payload.selectedPartners, start=1):
        members.append({
            "userId": f"u-partner-{idx}",
            "name": p.get("partner_name", p.get("name", "Partner Organization")),
            "role": p.get("organization_type", "Partner Organization"),
            "org": p.get("partner_name", "Partner Organization"),
            "avatar": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=250"
        })
    
    # Default initial project structure
    WORKSPACE_DATA[project_id] = {
        "id": project_id,
        "problemId": payload.problemId,
        "title": payload.title,
        "trlLevel": 4,
        "pipelineStep": "design",
        "progress": 0,
        "budget": 500000,
        "members": members,
        "tasks": [
            {
                "id": "t1",
                "title": "Initial Kickoff & Requirements Review",
                "status": "In Progress",
                "priority": "high",
                "assignee": members[0]["name"] if members else "Project Lead",
                "dueDate": datetime.now().strftime("%Y-%m-%d")
            }
        ],
        "discussions": [
            {
                "id": "m1",
                "sender": members[0]["name"] if members else "Project Lead",
                "senderRole": "Lead",
                "avatar": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=250",
                "timestamp": datetime.now().strftime("%I:%M %p"),
                "content": f"Project '{payload.title}' initiated with matched partner team."
            }
        ],
        "files": []
    }
    
    # Try updating problem status to 'In Progress' in DB
    try:
        from auth_problems import update_problem_status_in_db
        update_problem_status_in_db(payload.problemId, "In Progress")
    except Exception as e:
        print(f"[WARN] Failed to update problem status on project creation: {e}")

    return {"success": True, "data": WORKSPACE_DATA[project_id]}

@router.get("/{project_id}")
def get_collaboration(project_id: str):
    pid = _get_valid_project(project_id)
    return {"data": WORKSPACE_DATA[pid]}

@router.post("/{project_id}/tasks")
def add_task(project_id: str, task: TaskCreate):
    pid = _get_valid_project(project_id)
    new_task = {
        "id": f"t{len(WORKSPACE_DATA[pid]['tasks']) + 1}",
        "title": task.title,
        "status": task.status,
        "priority": task.priority,
        "assignee": task.assignee,
        "dueDate": task.dueDate
    }
    WORKSPACE_DATA[pid]["tasks"].append(new_task)
    _recalculate_progress(pid)
    return {"data": WORKSPACE_DATA[pid]}

@router.patch("/{project_id}/tasks/{task_id}")
def update_task_status(project_id: str, task_id: str, update: TaskStatusUpdate):
    pid = _get_valid_project(project_id)
    for task in WORKSPACE_DATA[pid]["tasks"]:
        if task["id"] == task_id:
            task["status"] = update.status
            break
    _recalculate_progress(pid)
    return {"data": WORKSPACE_DATA[pid]}

@router.post("/{project_id}/messages")
def add_message(project_id: str, msg: MessageCreate):
    pid = _get_valid_project(project_id)
    new_msg = {
        "id": f"m{len(WORKSPACE_DATA[pid]['discussions']) + 1}",
        "sender": msg.sender,
        "senderRole": msg.senderRole,
        "avatar": msg.avatar,
        "timestamp": datetime.now().strftime("%I:%M %p"),
        "content": msg.content
    }
    WORKSPACE_DATA[pid]["discussions"].append(new_msg)
    return {"data": WORKSPACE_DATA[pid]}

# ─── LOCAL TEST APP (Lets you run this file directly) ──────────
app = FastAPI(title="Member 4 - Collaboration API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)