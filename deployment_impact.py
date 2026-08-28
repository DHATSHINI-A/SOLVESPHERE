from fastapi import APIRouter, HTTPException, FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Optional

router = APIRouter(
    prefix="/deployment",
    tags=["Deployment & Impact"]
)

# In-Memory Database matching frontend expectations
DEPLOYMENTS = {
    "c1": {
        "id": "dep-c1",
        "projectId": "c1",
        "problemId": "p1",
        "projectTitle": "Solar-Powered Nanofiltration for Rural Water Security",
        "status": "Pilot",
        "location": "Coastal Villages, Tiruvottiyur, Tamil Nadu",
        "deploymentDate": "2026-08-27",
        "organization": "IIT Madras & GreenTech Solutions",
        "beneficiaries": 18500,
        "unitsDeployed": 12,
        "metrics": [
            {
                "id": "m1",
                "metricName": "Unmanaged Water Contamination",
                "beforeValue": 100,
                "afterValue": 42,
                "unit": "%"
            },
            {
                "id": "m2",
                "metricName": "Daily Clean Water Output",
                "beforeValue": 12000,
                "afterValue": 35000,
                "unit": "Liters/day"
            },
            {
                "id": "m3",
                "metricName": "System Uptime",
                "beforeValue": 70,
                "afterValue": 99,
                "unit": "%"
            }
        ]
    }
}

class DeploymentCreate(BaseModel):
    projectId: str
    problemId: str
    projectTitle: str
    status: str = "Not Ready"
    location: str
    deploymentDate: str
    organization: str
    beneficiaries: int = Field(default=0, ge=0)
    unitsDeployed: int = Field(default=0, ge=0)

class DeploymentStatusUpdate(BaseModel):
    status: str

class ImpactMetricCreate(BaseModel):
    metricName: str
    beforeValue: float
    afterValue: float
    unit: str

def calculate_improvement(before: float, after: float) -> float:
    if before == 0:
        return 0
    improvement = ((after - before) / abs(before)) * 100
    return round(improvement, 2)

def get_deployment(project_id: str):
    if project_id not in DEPLOYMENTS:
        raise HTTPException(
            status_code=404,
            detail="Deployment not found"
        )
    return DEPLOYMENTS[project_id]

@router.post("/")
def create_deployment(deployment: DeploymentCreate):
    project_id = deployment.projectId
    if project_id in DEPLOYMENTS:
        raise HTTPException(
            status_code=400,
            detail="Deployment already exists for this project"
        )
    DEPLOYMENTS[project_id] = {
        "id": f"dep-{project_id}",
        "projectId": deployment.projectId,
        "problemId": deployment.problemId,
        "projectTitle": deployment.projectTitle,
        "status": deployment.status,
        "location": deployment.location,
        "deploymentDate": deployment.deploymentDate,
        "organization": deployment.organization,
        "beneficiaries": deployment.beneficiaries,
        "unitsDeployed": deployment.unitsDeployed,
        "metrics": []
    }
    return {"success": True, "data": DEPLOYMENTS[project_id]}

@router.get("/{project_id}")
def get_project_deployment(project_id: str):
    deployment = get_deployment(project_id)
    return {"success": True, "data": deployment}

@router.patch("/{project_id}/status")
def update_deployment_status(project_id: str, update: DeploymentStatusUpdate):
    deployment = get_deployment(project_id)
    allowed_status = ["Not Ready", "Pilot", "Deployed", "Completed"]
    if update.status not in allowed_status:
        raise HTTPException(status_code=400, detail="Invalid deployment status")
    deployment["status"] = update.status
    if update.status in ["Deployed", "Completed"] and "problemId" in deployment:
        try:
            from auth_problems import update_problem_status_in_db
            update_problem_status_in_db(deployment["problemId"], "Solved")
        except Exception as e:
            print(f"[WARN] Failed to update problem status to Solved: {e}")
    return {"success": True, "data": deployment}

@router.post("/{project_id}/metrics")
def add_impact_metric(project_id: str, metric: ImpactMetricCreate):
    deployment = get_deployment(project_id)
    improvement = calculate_improvement(metric.beforeValue, metric.afterValue)
    new_metric = {
        "id": f"metric-{len(deployment['metrics']) + 1}",
        "metricName": metric.metricName,
        "beforeValue": metric.beforeValue,
        "afterValue": metric.afterValue,
        "unit": metric.unit,
        "improvementPercentage": improvement
    }
    deployment["metrics"].append(new_metric)
    return {"success": True, "data": new_metric}

@router.get("/{project_id}/metrics")
def get_impact_metrics(project_id: str):
    deployment = get_deployment(project_id)
    metrics = []
    for metric in deployment["metrics"]:
        improvement = calculate_improvement(metric["beforeValue"], metric["afterValue"])
        metrics.append({**metric, "improvementPercentage": improvement})
    return {"success": True, "data": metrics}

@router.get("/{project_id}/summary")
def get_impact_summary(project_id: str):
    deployment = get_deployment(project_id)
    metrics = deployment["metrics"]
    if metrics:
        average_improvement = round(
            sum(calculate_improvement(m["beforeValue"], m["afterValue"]) for m in metrics) / len(metrics),
            2
        )
    else:
        average_improvement = 0

    return {
        "success": True,
        "data": {
            "projectId": project_id,
            "projectTitle": deployment["projectTitle"],
            "deploymentStatus": deployment["status"],
            "location": deployment["location"],
            "organization": deployment["organization"],
            "beneficiaries": deployment["beneficiaries"],
            "unitsDeployed": deployment["unitsDeployed"],
            "metricsTracked": len(metrics),
            "averageImprovement": average_improvement,
            "metrics": metrics
        }
    }

@router.get("/")
def get_all_deployments():
    return {"success": True, "data": list(DEPLOYMENTS.values())}

# Local Standalone Runner
app = FastAPI(title="Member 5 - Deployment & Impact API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)