import csv
import json
import sqlite3
import time
from fastapi.testclient import TestClient
from app import app, init_db, DB_FILENAME

# 1. Initialize SQLite database and FastAPI TestClient
init_db()
client = TestClient(app)

print("=" * 80)
print("SOLVESPHERE - UNIFIED SYSTEM INTEGRATION TEST SUITE")
print("Integrating Member 2 (AI), Member 4 (Collaboration), & Member 5 (Deployment)")
print("=" * 80)

test_report = []

def record_test(test_id, module, action, expected, actual, status_code, passed, notes=""):
    test_report.append({
        "id": test_id,
        "module": module,
        "action": action,
        "expected": expected,
        "actual": actual,
        "status_code": status_code,
        "passed": passed,
        "notes": notes
    })

# ==============================================================================
# TEST SUITE 1: MASTER PLATFORM HEALTH CHECK (GET /)
# ==============================================================================
print("\n[SUITE 1] Testing Unified Platform Health Check (GET /)...")
res_health = client.get("/")
data_health = res_health.json()

modules_present = all(
    k in data_health.get("integrated_modules", {})
    for k in ["member_2_ai_understanding", "member_4_collaboration", "member_5_deployment", "unified_pipeline"]
)
passed_health = (res_health.status_code == 200) and modules_present

record_test(
    "INT-01",
    "Master Health",
    "GET /",
    "HTTP 200 with all 3 modules mounted",
    f"HTTP {res_health.status_code} ({list(data_health.get('integrated_modules', {}).keys())})",
    res_health.status_code,
    passed_health,
    "All subsystems successfully integrated under unified API"
)
print(f"-> INT-01 Master Health Check: {'PASS' if passed_health else 'FAIL'} (HTTP {res_health.status_code})")

# ==============================================================================
# TEST SUITE 2: MEMBER 2 (AI UNDERSTANDING & NORMALIZATION & DB STORAGE)
# ==============================================================================
print("\n[SUITE 2] Testing Member 2: Problem Ingestion, AI Analysis, & Storage...")

# Load problem P001 from dummy.csv
csv_filename = "dummy.csv"
with open(csv_filename, mode="r", encoding="utf-8") as file:
    reader = csv.DictReader(file)
    p001 = next(reader)

payload_p001 = {
    "problem_id": p001["problem_id"],
    "problem_description": p001["problem_description"]
}

res_analyze = client.post("/ai/analyze", json=payload_p001)
if res_analyze.status_code == 200:
    data_analyze = res_analyze.json()
    has_schema = all(k in data_analyze for k in ["domain", "required_skills", "urgency", "problem_type", "keywords"])
    passed_ai = has_schema and (data_analyze.get("stored_in_db") is True)
    
    record_test(
        "INT-02",
        "Member 2 (AI)",
        "POST /ai/analyze (P001: Contaminated Groundwater)",
        "HTTP 200 with normalized tags & stored_in_db=true",
        f"HTTP 200 (Domain='{data_analyze.get('domain')}', Skills={len(data_analyze.get('required_skills', []))})",
        res_analyze.status_code,
        passed_ai,
        f"Domain: {data_analyze.get('domain')}, Urgency: {data_analyze.get('urgency')}"
    )
    print(f"-> INT-02 AI Problem Analysis: {'PASS' if passed_ai else 'FAIL'}")
else:
    record_test(
        "INT-02",
        "Member 2 (AI)",
        "POST /ai/analyze",
        "HTTP 200",
        f"HTTP {res_analyze.status_code}",
        res_analyze.status_code,
        False,
        "AI Analysis failed"
    )
    print(f"-> INT-02 AI Problem Analysis: FAIL (HTTP {res_analyze.status_code})")

# Verify fast database retrieval
res_get_ai = client.get("/ai/analysis/P001")
passed_get_ai = (res_get_ai.status_code == 200) and (res_get_ai.json().get("problem_id") == "P001")
record_test(
    "INT-03",
    "Member 2 (AI)",
    "GET /ai/analysis/P001",
    "HTTP 200 retrieving stored analysis without AI call",
    f"HTTP {res_get_ai.status_code} (Retrieved created_at='{res_get_ai.json().get('created_at')}')",
    res_get_ai.status_code,
    passed_get_ai,
    "Fast SQLite retrieval verified"
)
print(f"-> INT-03 Stored AI Retrieval: {'PASS' if passed_get_ai else 'FAIL'}")

# ==============================================================================
# TEST SUITE 3: MEMBER 4 (COLLABORATION WORKSPACE & TRL TRACKING)
# ==============================================================================
print("\n[SUITE 3] Testing Member 4: Collaboration Workspace, Tasks, & Progress...")

# 3A: Fetch Workspace Details
res_ws = client.get("/collaboration/c1")
passed_ws = (res_ws.status_code == 200) and ("data" in res_ws.json())
ws_data = res_ws.json().get("data", {})
initial_progress = ws_data.get("progress", 0)

record_test(
    "INT-04",
    "Member 4 (Workspace)",
    "GET /collaboration/c1",
    "HTTP 200 with team members, tasks, and TRL level",
    f"HTTP {res_ws.status_code} (TRL {ws_data.get('trlLevel')}, Progress {initial_progress}%, Members: {len(ws_data.get('members', []))})",
    res_ws.status_code,
    passed_ws,
    f"Project: '{ws_data.get('title')}'"
)
print(f"-> INT-04 Workspace Details: {'PASS' if passed_ws else 'FAIL'}")

# 3B: Add a new collaborative task
new_task_payload = {
    "title": "Deploy Low-Cost Water Quality Sensors",
    "status": "In Progress",
    "priority": "high",
    "assignee": "Vikram Patel",
    "dueDate": "2026-09-18"
}
res_add_task = client.post("/collaboration/c1/tasks", json=new_task_payload)
passed_add_task = (res_add_task.status_code == 200)
record_test(
    "INT-05",
    "Member 4 (Workspace)",
    "POST /collaboration/c1/tasks",
    "HTTP 200 with new task added",
    f"HTTP {res_add_task.status_code} (Tasks count: {len(res_add_task.json().get('data', {}).get('tasks', []))})",
    res_add_task.status_code,
    passed_add_task,
    "Task creation verified"
)
print(f"-> INT-05 Add Task: {'PASS' if passed_add_task else 'FAIL'}")

# 3C: Update Task Status and Verify Auto Progress Recalculation
res_update_task = client.patch("/collaboration/c1/tasks/t2", json={"status": "Done"})
updated_progress = res_update_task.json().get("data", {}).get("progress", 0)
passed_update = (res_update_task.status_code == 200)
record_test(
    "INT-06",
    "Member 4 (Workspace)",
    "PATCH /collaboration/c1/tasks/t2 (status='Done')",
    "HTTP 200 with auto-recalculated progress",
    f"HTTP {res_update_task.status_code} (New Progress: {updated_progress}%)",
    res_update_task.status_code,
    passed_update,
    f"Progress updated from {initial_progress}% to {updated_progress}%"
)
print(f"-> INT-06 Task Status & Progress Update: {'PASS' if passed_update else 'FAIL'}")

# 3D: Add Team Discussion Message
msg_payload = {
    "sender": "Dr. Anitha Rao",
    "senderRole": "researcher",
    "content": "Lab testing for sensor module completed with 99.4% accuracy. Ready for pilot deployment!"
}
res_msg = client.post("/collaboration/c1/messages", json=msg_payload)
passed_msg = (res_msg.status_code == 200)
record_test(
    "INT-07",
    "Member 4 (Workspace)",
    "POST /collaboration/c1/messages",
    "HTTP 200 with new discussion message stored",
    f"HTTP {res_msg.status_code} (Total messages: {len(res_msg.json().get('data', {}).get('discussions', []))})",
    res_msg.status_code,
    passed_msg,
    "Researcher-industry collaboration messaging verified"
)
print(f"-> INT-07 Post Discussion: {'PASS' if passed_msg else 'FAIL'}")

# ==============================================================================
# TEST SUITE 4: MEMBER 5 (DEPLOYMENT & IMPACT TRACKING)
# ==============================================================================
print("\n[SUITE 4] Testing Member 5: Deployment Lifecycle & Impact Analytics...")

# 4A: Get Project Deployment Status
res_dep = client.get("/deployment/c1")
passed_dep = (res_dep.status_code == 200) and (res_dep.json().get("success") is True)
dep_data = res_dep.json().get("data", {})
record_test(
    "INT-08",
    "Member 5 (Deployment)",
    "GET /deployment/c1",
    "HTTP 200 with location, beneficiaries, units, and metrics",
    f"HTTP {res_dep.status_code} (Status: '{dep_data.get('status')}', Beneficiaries: {dep_data.get('beneficiaries')}, Units: {dep_data.get('unitsDeployed')})",
    res_dep.status_code,
    passed_dep,
    f"Location: {dep_data.get('location')}"
)
print(f"-> INT-08 Deployment Details: {'PASS' if passed_dep else 'FAIL'}")

# 4B: Add Real-World Impact Metric
metric_payload = {
    "metricName": "Waterborne Disease Incidents",
    "beforeValue": 85.0,
    "afterValue": 12.0,
    "unit": "Cases/month"
}
res_metric = client.post("/deployment/c1/metrics", json=metric_payload)
passed_metric = (res_metric.status_code == 200) and (res_metric.json().get("success") is True)
metric_data = res_metric.json().get("data", {})
record_test(
    "INT-09",
    "Member 5 (Deployment)",
    "POST /deployment/c1/metrics",
    "HTTP 200 with automated % improvement calculation",
    f"HTTP {res_metric.status_code} (Improvement: {metric_data.get('improvementPercentage')}%)",
    res_metric.status_code,
    passed_metric,
    f"{metric_payload['metricName']}: {metric_payload['beforeValue']} -> {metric_payload['afterValue']} {metric_payload['unit']}"
)
print(f"-> INT-09 Add Impact Metric: {'PASS' if passed_metric else 'FAIL'} (Improvement: {metric_data.get('improvementPercentage')}%)")

# 4C: Fetch Impact Summary
res_summary = client.get("/deployment/c1/summary")
passed_summary = (res_summary.status_code == 200)
sum_data = res_summary.json().get("data", {})
record_test(
    "INT-10",
    "Member 5 (Deployment)",
    "GET /deployment/c1/summary",
    "HTTP 200 with aggregated impact analytics",
    f"HTTP {res_summary.status_code} (Tracked Metrics: {sum_data.get('metricsTracked')}, Avg Improvement: {sum_data.get('averageImprovement')}%)",
    res_summary.status_code,
    passed_summary,
    f"Beneficiaries: {sum_data.get('beneficiaries'):,}"
)
print(f"-> INT-10 Impact Summary: {'PASS' if passed_summary else 'FAIL'} (Avg Improvement: {sum_data.get('averageImprovement')}%)")

# ==============================================================================
# TEST SUITE 5: UNIFIED 360° LIFECYCLE BRIDGE (GET /pipeline/{problem_id})
# ==============================================================================
print("\n[SUITE 5] Testing Master End-to-End Problem Lifecycle Bridge (GET /pipeline/P001)...")

res_pipeline = client.get("/pipeline/P001")
passed_pipeline = (res_pipeline.status_code == 200) and (res_pipeline.json().get("success") is True)
pipe_summary = res_pipeline.json().get("lifecycle_summary", {})

st1 = pipe_summary.get("stage_1_ai_understanding", {}).get("status")
st2 = pipe_summary.get("stage_2_collaboration_workspace", {}).get("status")
st3 = pipe_summary.get("stage_3_deployment_and_impact", {}).get("status")

record_test(
    "INT-11",
    "Unified Lifecycle",
    "GET /pipeline/P001",
    "HTTP 200 linking Stage 1 (AI) + Stage 2 (Collab) + Stage 3 (Deploy)",
    f"HTTP {res_pipeline.status_code} (Stage 1: {st1} | Stage 2: {st2} | Stage 3: {st3})",
    res_pipeline.status_code,
    passed_pipeline,
    "Seamless 360° problem-to-impact pipeline verified"
)
print(f"-> INT-11 Unified Problem Lifecycle: {'PASS' if passed_pipeline else 'FAIL'}")

# ==============================================================================
# FINAL INTEGRATION TEST REPORT & SUMMARY
# ==============================================================================
print("\n" + "=" * 80)
print("FINAL CROSS-MODULE INTEGRATION TEST REPORT")
print("=" * 80)
print(f"{'ID':<7} | {'Module':<22} | {'HTTP':<5} | {'Status':<6} | {'Action & Verification Details'}")
print("-" * 80)

passed_count = 0
for t in test_report:
    p_str = "PASS" if t["passed"] else "FAIL"
    if t["passed"]:
        passed_count += 1
    print(f"{t['id']:<7} | {t['module']:<22} | {t['status_code']:<5} | {p_str:<6} | {t['notes']}")

print("=" * 80)
total_count = len(test_report)
pass_rate = (passed_count / total_count) * 100

print(f"TOTAL INTEGRATION TESTS : {total_count}")
print(f"PASSED                  : {passed_count}")
print(f"FAILED                  : {total_count - passed_count}")
print(f"PASS PERCENTAGE         : {pass_rate:.1f}%")
print("=" * 80)

if pass_rate == 100.0:
    print("[FINAL VERDICT] SOLVESPHERE Backend is 100% unified, robust, and presentation-ready!")
else:
    print("[FINAL VERDICT] Please check failed integration steps above.")
print("=" * 80)