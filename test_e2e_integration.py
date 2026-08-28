import json
from starlette.testclient import TestClient
from main import app

def test_full_integration():
    client = TestClient(app)

    print("=" * 80)
    print("SOLVESPHERE END-TO-END INTEGRATION TEST SUITE (MEMBER 1 + MEMBER 2 + MEMBER 3)")
    print("=" * 80)

    # 1. Test Health Endpoint
    print("\n[STEP 1] Testing GET /health...")
    res_health = client.get("/health")
    assert res_health.status_code == 200
    print(f"Health Status: {res_health.json()}")

    # 2. Test User Registration (Member 1)
    print("\n[STEP 2] Testing User Registration (POST /auth/register)...")
    reg_payload = {
        "name": "Citizen Alex",
        "email": "alex.citizen@example.com",
        "password": "securepassword123",
        "role": "Citizen"
    }
    res_reg = client.post("/auth/register", json=reg_payload)
    print(f"Register status: {res_reg.status_code}")
    if res_reg.status_code == 201:
        print(f"User Registered: {res_reg.json()}")
    elif res_reg.status_code == 400:
        print(f"User already exists ({res_reg.json()['detail']}), proceeding to login...")
    else:
        assert res_reg.status_code == 201

    # 3. Test User Login (Member 1)
    print("\n[STEP 3] Testing User Login (POST /auth/login)...")
    login_payload = {
        "email": "alex.citizen@example.com",
        "password": "securepassword123"
    }
    res_login = client.post("/auth/login", json=login_payload)
    assert res_login.status_code == 200
    user_data = res_login.json()
    user_id = user_data["user_id"]
    print(f"User Logged In Successfully: user_id={user_id}, role={user_data['role']}")

    # 4. Test Problem Submission (Member 1)
    print("\n[STEP 4] Testing Problem Submission (POST /problems)...")
    problem_payload = {
        "title": "Groundwater contamination",
        "description": "Our village has contaminated groundwater and needs an affordable monitoring system.",
        "category": "Environment",
        "location": "Jharkhand",
        "urgency": "High",
        "user_id": user_id
    }
    res_prob = client.post("/problems", json=problem_payload)
    print(f"Problem status: {res_prob.status_code}, response: {res_prob.text}")
    assert res_prob.status_code == 201
    prob_data = res_prob.json()
    pid = prob_data["problem_id"]
    assert prob_data["status"] == "Submitted"
    print(f"Problem Submitted Successfully! problem_id='{pid}', initial status='{prob_data['status']}'")

    # 5. Retrieve Submitted Problem Details
    print(f"\n[STEP 5] Retrieving Submitted Problem (GET /problems/{pid})...")
    res_get_prob = client.get(f"/problems/{pid}")
    assert res_get_prob.status_code == 200
    assert res_get_prob.json()["problem_id"] == pid

    # 6. Test AI Analysis Trigger for Problem ID (Member 2)
    print(f"\n[STEP 6] Triggering AI Understanding Engine (POST /ai/analyze/{pid})...")
    res_ai = client.post(f"/ai/analyze/{pid}")
    assert res_ai.status_code == 200
    ai_data = res_ai.json()
    print(f"AI Analysis Output Received for '{pid}':")
    print(f"   Domain:          {ai_data['domain']}")
    print(f"   Required Skills: {ai_data['required_skills']}")
    print(f"   Urgency:         {ai_data['urgency']}")
    print(f"   Problem Type:    {ai_data['problem_type']}")
    print(f"   Keywords:        {ai_data['keywords']}")

    # 7. Confirm AI Analysis Persisted in DB
    print(f"\n[STEP 7] Verifying Persisted AI Analysis (GET /ai/analysis/{pid})...")
    res_ai_db = client.get(f"/ai/analysis/{pid}")
    assert res_ai_db.status_code == 200
    assert res_ai_db.json()["problem_id"] == pid

    # 8. Test Automatic Partner Matching (Member 3)
    print(f"\n[STEP 8] Triggering Partner Matching Engine (GET /matching/{pid})...")
    res_match = client.get(f"/matching/{pid}")
    assert res_match.status_code == 200
    match_data = res_match.json()
    print(f"Matching Results Received for '{pid}':")
    print(f"   Problem Domain: {match_data['problem_domain']}")
    print(f"   Total Matches:  {len(match_data['matches'])} partners")
    print(f"   Updated Status: {match_data.get('status', 'Matched')}")
    
    print("\nTOP RANKED RECOMMENDATIONS:")
    print("-" * 80)
    for m in match_data["matches"]:
        print(f"Rank {m['rank']}: {m['partner_name']} ({m['organization_type']}) -> Match Score: {m['final_match_score']:.2f}%")
        print(f"   Matched Skills: {m['matched_skills']}")
        print(f"   Why Recommended: {m['why_recommended']}")
        print("-" * 80)

    # 9. Verify Problem Status Transitioned to 'Matched'
    print(f"\n[STEP 9] Verifying Problem Lifecycle Status Update (GET /problems/{pid})...")
    res_final_prob = client.get(f"/problems/{pid}")
    assert res_final_prob.status_code == 200
    assert res_final_prob.json()["status"] == "Matched"
    print(f"Verified Final Problem Status: '{res_final_prob.json()['status']}'")

    print("\n" + "=" * 80)
    print("ALL END-TO-END INTEGRATION TESTS PASSED SUCCESSFULLY!")
    print("=" * 80)

if __name__ == "__main__":
    test_full_integration()
