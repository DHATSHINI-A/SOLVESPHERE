import json
from starlette.testclient import TestClient
from main import app

def test_api():
    client = TestClient(app)

    print("=" * 70)
    print("SOLVESPHERE MATCHING ENGINE API TEST SUITE")
    print("=" * 70)

    # 1. Test Health Endpoint
    print("\n[TEST 1] GET /health")
    res_health = client.get("/health")
    print(f"Status Code : {res_health.status_code}")
    print(f"Response    : {res_health.json()}")
    assert res_health.status_code == 200

    # 2. Test Matching Endpoint for Problem 26043
    print("\n[TEST 2] GET /matching/26043")
    res_match = client.get("/matching/26043")
    print(f"Status Code : {res_match.status_code}")
    data = res_match.json()
    print(f"Problem ID  : {data['problem_id']}")
    print(f"Problem     : {data['problem']}")
    print(f"Domain      : {data['problem_domain']}")
    print(f"Total Ranked: {len(data['matches'])} partners\n")

    print("RANKED RECOMMENDATIONS:")
    print("-" * 70)
    for m in data["matches"]:
        print(f"Rank {m['rank']}: {m['partner_name']} ({m['organization_type']}) -> {m['final_match_score']:.2f}%")
        print(f"   Skills: {m['skill_match']}% | Exp: {m['expertise_score']}% | Proj: {m['past_project_score']}% | Res: {m['resource_match']}% | Loc: {m['location_match']}% | Avail: {m['availability_score']}%")
        print(f"   Why: {m['why_recommended']}")
        print("-" * 70)

    assert res_match.status_code == 200
    assert data["matches"][0]["partner_name"] == "Aranya Institute of Technology"
    assert data["matches"][0]["final_match_score"] == 96.25
    assert data["matches"][1]["partner_name"] == "AquaSense Technologies"
    assert data["matches"][1]["final_match_score"] == 86.25

    # 3. Test Invalid Problem ID (404 Handling)
    print("\n[TEST 3] GET /matching/invalid_99999 (Negative Test)")
    res_invalid = client.get("/matching/invalid_99999")
    print(f"Status Code : {res_invalid.status_code}")
    print(f"Error Body  : {res_invalid.json()}")
    assert res_invalid.status_code == 404

    # 4. Print Full Pretty-Printed JSON for Problem 26043
    print("\n" + "=" * 70)
    print("FULL JSON RESPONSE FOR GET /matching/26043:")
    print("=" * 70)
    print(json.dumps(data, indent=2))
    print("=" * 70)
    print("\nALL API TESTS PASSED SUCCESSFULLY!")

if __name__ == "__main__":
    test_api()

