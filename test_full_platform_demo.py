import json
from starlette.testclient import TestClient
from main import app

def test_full_platform_scenario():
    client = TestClient(app)

    print("=" * 85)
    print("SOLVESPHERE COMPLETE PLATFORM DEMO SCENARIO (MEMBERS 1 - 6)")
    print("=" * 85)

    # 1. Health Check
    print("\n[STEP 1] Verifying System Health (GET /health)...")
    res_health = client.get("/health")
    assert res_health.status_code == 200
    print(f"System Health Status: {res_health.json()['status']}")

    # 2. User Registration & Login
    print("\n[STEP 2] Citizen Registration & Login...")
    reg_data = {
        "name": "Citizen Rakesh",
        "email": "rakesh.village@example.com",
        "password": "pass123word!",
        "role": "Citizen"
    }
    client.post("/auth/register", json=reg_data)
    res_login = client.post("/auth/login", json={"email": "rakesh.village@example.com", "password": "pass123word!"})
    assert res_login.status_code == 200
    user_id = res_login.json()["user_id"]
    print(f"Logged in Citizen: {res_login.json()['name']} (ID: {user_id})")

    # 3. Problem Submission
    print("\n[STEP 3] Citizen Submits Societal Problem (POST /problems)...")
    prob_payload = {
        "title": "Smart Water Monitoring",
        "description": "Our village has contaminated groundwater and needs an affordable monitoring system.",
        "category": "Environment",
        "location": "Village X, Jharkhand",
        "urgency": "High",
        "user_id": user_id
    }
    res_prob = client.post("/problems", json=prob_payload)
    assert res_prob.status_code == 201
    prob_info = res_prob.json()
    pid = prob_info["problem_id"]
    assert prob_info["status"] == "Submitted"
    print(f"Problem Stored in Database: problem_id='{pid}', status='{prob_info['status']}'")

    # 4. Member 2 - AI Understanding Engine
    print(f"\n[STEP 4] AI Understanding Engine Analyzes Problem (POST /ai/analyze/{pid})...")
    res_ai = client.post(f"/ai/analyze/{pid}")
    assert res_ai.status_code == 200
    ai_res = res_ai.json()
    print(f"AI Domain Extracted:   {ai_res['domain']}")
    print(f"AI Required Skills:   {ai_res['required_skills']}")
    print(f"AI Problem Keywords:  {ai_res['keywords']}")

    # 5. Member 3 - Partner Matching Engine
    print(f"\n[STEP 5] 6-Factor Matching Engine Ranks Partners (GET /matching/{pid})...")
    res_match = client.get(f"/matching/{pid}")
    assert res_match.status_code == 200
    matches = res_match.json()["matches"]
    print(f"Top Matched Partners ({len(matches)} ranked):")
    for m in matches[:3]:
        print(f"   Rank {m['rank']}: {m['partner_name']} ({m['organization_type']}) - Score: {m['final_match_score']:.2f}%")
    
    # 6. Member 4 - Create Collaboration Project from Selected Matches
    print(f"\n[STEP 6] Creating Collaboration Project from Matched Partners (POST /collaboration/create-from-match)...")
    create_proj_payload = {
        "problemId": pid,
        "title": "Smart Water Monitoring Project",
        "selectedPartners": matches[:2]
    }
    res_proj = client.post("/collaboration/create-from-match", json=create_proj_payload)
    assert res_proj.status_code == 200
    proj_data = res_proj.json()["data"]
    proj_id = proj_data["id"]
    print(f"Project Created: project_id='{proj_id}', members={len(proj_data['members'])}")

    # Add task & update progress
    print(f"\n[STEP 7] Collaborating on Tasks (POST & PATCH /collaboration/{proj_id}/tasks)...")
    client.post(f"/collaboration/{proj_id}/tasks", json={
        "title": "Build Prototype Sensor Node",
        "status": "In Progress",
        "priority": "high",
        "assignee": proj_data["members"][0]["name"]
    })
    client.patch(f"/collaboration/{proj_id}/tasks/t1", json={"status": "Done"})
    res_updated_proj = client.get(f"/collaboration/{proj_id}")
    updated_proj = res_updated_proj.json()["data"]
    print(f"Project Progress: {updated_proj['progress']}%")

    # 7. Member 5 - Deployment & Impact Metrics
    print(f"\n[STEP 8] Creating Field Deployment Record (POST /deployment/)...")
    dep_payload = {
        "projectId": proj_id,
        "problemId": pid,
        "projectTitle": "Smart Water Monitoring Project",
        "status": "Pilot",
        "location": "Village X, Jharkhand",
        "deploymentDate": "2026-08-28",
        "organization": matches[0]["partner_name"],
        "beneficiaries": 12500,
        "unitsDeployed": 10
    }
    res_dep = client.post("/deployment/", json=dep_payload)
    assert res_dep.status_code == 200
    print(f"Deployment Record Created for '{proj_id}': beneficiaries=12,500")

    # Add Impact Metric & calculate improvement % on backend
    print(f"\n[STEP 9] Adding Impact Metric & Backend Improvement Calculation (POST /deployment/{proj_id}/metrics)...")
    metric_payload = {
        "metricName": "Water Contamination Level",
        "beforeValue": 1000.0,
        "afterValue": 700.0,
        "unit": "kg/day"
    }
    res_metric = client.post(f"/deployment/{proj_id}/metrics", json=metric_payload)
    assert res_metric.status_code == 200
    metric_res = res_metric.json()["data"]
    print(f"Impact Metric Recorded: {metric_res['metricName']}")
    print(f"   Before: {metric_res['beforeValue']} {metric_res['unit']}")
    print(f"   After:  {metric_res['afterValue']} {metric_res['unit']}")
    print(f"   Backend Calculated Improvement: {metric_res['improvementPercentage']}%")

    # Update Deployment status to Deployed
    print(f"\n[STEP 10] Updating Deployment Status to 'Deployed' (PATCH /deployment/{proj_id}/status)...")
    res_dep_status = client.patch(f"/deployment/{proj_id}/status", json={"status": "Deployed"})
    assert res_dep_status.status_code == 200
    print(f"Deployment Status: {res_dep_status.json()['data']['status']}")

    # Verify problem lifecycle status reached 'Solved'
    print(f"\n[STEP 11] Verifying Final Problem Lifecycle Status (GET /problems/{pid})...")
    res_prob_final = client.get(f"/problems/{pid}")
    assert res_prob_final.status_code == 200
    assert res_prob_final.json()["status"] == "Solved"
    print(f"Final Problem Status in Database: '{res_prob_final.json()['status']}' (SOLVED!)")

    # 8. Member 6 - Unified Live Dashboard
    print(f"\n[STEP 12] Querying Live Dashboard Statistics (GET /dashboard/stats)...")
    res_dash = client.get("/dashboard/stats")
    assert res_dash.status_code == 200
    dash = res_dash.json()["data"]
    print(f"Unified Dashboard Overview:")
    print(f"   Total Problems:        {dash['totalProblems']}")
    print(f"   Verified Problems:     {dash['verifiedProblems']}")
    print(f"   Active Collaborations: {dash['activeCollaborations']}")
    print(f"   Solutions Developed:   {dash['solutionsDeveloped']}")
    print(f"   Solutions Deployed:    {dash['solutionsDeployed']}")
    print(f"   People Impacted:       {dash['peopleImpacted']}")
    print(f"   Success Rate:          {dash['successRate']}%")

    print("\n" + "=" * 85)
    print("FULL END-TO-END DEMO SCENARIO (MEMBERS 1 - 6) COMPLETED SUCCESSFULLY!")
    print("=" * 85)

if __name__ == "__main__":
    test_full_platform_scenario()
