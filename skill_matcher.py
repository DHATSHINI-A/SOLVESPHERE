import csv
import os

# =========================================================================
# CONFIGURATION & WEIGHTS (Centralized, easily configurable)
# =========================================================================

# Stage 9: Multi-Criteria Matching Weights (Must sum to 1.0 / 100%)
MATCHING_WEIGHTS = {
    "skill": 0.30,        # 30% - Technical core competencies
    "expertise": 0.20,    # 20% - Domain & sectoral focus
    "projects": 0.20,     # 20% - Proven real-world project track record
    "resources": 0.15,    # 15% - Labs, hardware, and field deployment teams
    "location": 0.10,     # 10% - Geographic proximity to target site
    "availability": 0.05, # 5%  - Operational bandwidth & immediate readiness
}

# Stage 8: Availability Scoring Rules
AVAILABILITY_SCORE_CONFIG = {
    "available": 100.0,
    "limited": 50.0,
    "unavailable": 0.0,
}

# Stage 7: Location Scoring Rules
LOCATION_SCORE_CONFIG = {
    "SAME_CITY": 100.0,
    "SAME_STATE": 70.0,
    "NEARBY_REGION": 40.0,
    "DISTANT_REGION": 10.0,
}

# City-to-State Knowledge Base (for geographic resolution)
CITY_STATE_MAP = {
    "ranchi": "Jharkhand",
    "jamshedpur": "Jharkhand",
    "dhanbad": "Jharkhand",
    "bokaro": "Jharkhand",
    "hazaribagh": "Jharkhand",
    "bhubaneswar": "Odisha",
    "bengaluru": "Karnataka",
}

# State Adjacency (Neighboring regions)
NEIGHBORING_STATES = {
    "Jharkhand": ["Bihar", "Odisha", "West Bengal", "Chhattisgarh", "Uttar Pradesh"],
    "Odisha": ["Jharkhand", "West Bengal", "Andhra Pradesh", "Chhattisgarh"],
    "Karnataka": ["Maharashtra", "Goa", "Kerala", "Tamil Nadu", "Andhra Pradesh", "Telangana"],
}

# =========================================================================
# VALIDATION MODULE (Stage 9)
# =========================================================================

def validate_weights(weights: dict) -> None:
    """
    Validates that matching weights are properly configured and sum to 100% (1.0).
    """
    total = sum(weights.values())
    if not (0.999 <= total <= 1.001):
        raise ValueError(f"Matching weights must sum to 1.0 (100%), but sum is: {total:.4f}")
    for key, val in weights.items():
        if val < 0 or val > 1.0:
            raise ValueError(f"Weight for '{key}' must be between 0.0 and 1.0, got: {val}")

# =========================================================================
# DATA LOADING (Stage 1)
# =========================================================================

def parse_semicolon_list(raw_text: str) -> list[str]:
    """
    Safely converts a semicolon-separated string into a clean Python list.
    Example: 'IoT; Sensors; Water Quality' -> ['IoT', 'Sensors', 'Water Quality']
    """
    if not raw_text:
        return []
    return [item.strip() for item in raw_text.split(";") if item.strip()]

def load_partners(file_path: str = None) -> list[dict]:
    """
    Reads the CSV file and returns a list of partner dictionaries.
    Automatically looks for partners.csv or patners.csv if file_path is omitted.
    """
    if file_path is None or not os.path.exists(file_path):
        if os.path.exists("partners.csv"):
            file_path = "partners.csv"
        elif os.path.exists("patners.csv"):
            file_path = "patners.csv"
        else:
            raise FileNotFoundError("Neither partners.csv nor patners.csv was found in the workspace.")

    partners = []
    with open(file_path, mode="r", encoding="utf-8") as file:
        reader = csv.DictReader(file)
        for row in reader:
            partner_data = {
                "partner_id": (row.get("partner_id") or "").strip(),
                "name": (row.get("name") or "").strip(),
                "type": (row.get("type") or "").strip(),
                "location": (row.get("location") or "").strip(),
                "skills": parse_semicolon_list(row.get("skills", "")),
                "expertise": parse_semicolon_list(row.get("expertise", "")),
                "past_projects": parse_semicolon_list(row.get("past_projects", "")),
                "resources": parse_semicolon_list(row.get("resources", "")),
                "availability": (row.get("availability") or "").strip(),
            }
            partners.append(partner_data)
            
    return partners

# =========================================================================
# MATCHING LOGIC MODULES (Stages 2 - 8)
# =========================================================================

def match_skills(required_skills: list[str], partner_skills: list[str]) -> list[str]:
    """
    Stage 2: Compares required skills against a partner's skills (case-insensitively).
    """
    matched = []
    partner_skills_lower = [s.lower() for s in partner_skills]

    for req_skill in required_skills:
        if req_skill.lower() in partner_skills_lower:
            matched.append(req_skill)

    return matched

def match_expertise(domain_keywords: list[str], partner_expertise: list[str]) -> tuple[list[str], float]:
    """
    Stage 4: Checks if a partner's domain expertise aligns with the problem's domain keywords.
    """
    if not domain_keywords or not partner_expertise:
        return [], 0.0

    expertise_text = " ".join(partner_expertise).lower()
    matched_keywords = []
    
    for kw in domain_keywords:
        if kw.lower() in expertise_text:
            matched_keywords.append(kw)

    total_keywords = len(domain_keywords)
    expertise_score = (len(matched_keywords) / total_keywords) * 100.0 if total_keywords > 0 else 0.0

    return matched_keywords, round(expertise_score, 1)

def match_past_projects(project_keywords: list[str], past_projects: list[str]) -> tuple[list[str], list[str], float]:
    """
    Stage 5: Checks if a partner has worked on relevant past projects by comparing project keywords.
    """
    if not project_keywords or not past_projects:
        return [], [], 0.0

    relevant_projects = []
    all_projects_text = " ".join(past_projects).lower()

    for project in past_projects:
        project_lower = project.lower()
        for kw in project_keywords:
            if kw.lower() in project_lower:
                relevant_projects.append(project)
                break

    matched_keywords = []
    for kw in project_keywords:
        if kw.lower() in all_projects_text:
            matched_keywords.append(kw)

    total_keywords = len(project_keywords)
    project_score = (len(matched_keywords) / total_keywords) * 100.0 if total_keywords > 0 else 0.0

    return relevant_projects, matched_keywords, round(project_score, 1)

def match_resources(required_resources: list[str], partner_resources: list[str]) -> tuple[list[str], list[str], float]:
    """
    Stage 6: Compares the problem's required resources against a partner's available resources.
    """
    if not required_resources or not partner_resources:
        return [], [], 0.0

    matched_required = []
    matched_partner_resources = []

    for req_res in required_resources:
        req_words = [w.lower().rstrip("s") for w in req_res.split() if len(w) > 2]

        for p_res in partner_resources:
            p_res_lower = p_res.lower()
            if any(word in p_res_lower for word in req_words):
                if req_res not in matched_required:
                    matched_required.append(req_res)
                if p_res not in matched_partner_resources:
                    matched_partner_resources.append(p_res)

    total_required = len(required_resources)
    resource_score = (len(matched_required) / total_required) * 100.0 if total_required > 0 else 0.0

    return matched_required, matched_partner_resources, round(resource_score, 1)

def match_location(
    partner_city: str,
    target_city: str,
    target_state: str,
    score_config: dict = LOCATION_SCORE_CONFIG
) -> tuple[str, float]:
    """
    Stage 7: Evaluates geographic suitability between a partner's city and the target location.
    """
    partner_city_clean = partner_city.strip().lower()
    target_city_clean = target_city.strip().lower()
    target_state_clean = target_state.strip()

    if partner_city_clean == target_city_clean:
        return "Same City", score_config["SAME_CITY"]

    partner_state = CITY_STATE_MAP.get(partner_city_clean, "Other")

    if partner_state.lower() == target_state_clean.lower():
        return "Same State", score_config["SAME_STATE"]

    neighbors = NEIGHBORING_STATES.get(target_state_clean, [])
    neighbors_lower = [n.lower() for n in neighbors]
    if partner_state.lower() in neighbors_lower:
        return "Nearby Region", score_config["NEARBY_REGION"]

    return "Different Region", score_config["DISTANT_REGION"]

def match_availability(
    availability_text: str,
    score_config: dict = AVAILABILITY_SCORE_CONFIG
) -> tuple[str, float]:
    """
    Stage 8: Evaluates partner availability status.
    """
    if not availability_text:
        return "Unavailable", score_config["unavailable"]

    clean_status = availability_text.strip().lower()

    if clean_status in score_config:
        display_status = clean_status.capitalize()
        return display_status, score_config[clean_status]

    return availability_text.strip().capitalize(), 0.0

def calculate_match_percentage(matched_count: int, total_required: int) -> float:
    """
    Calculates percentage: (matched / total) * 100
    """
    if total_required == 0:
        return 0.0
    return (matched_count / total_required) * 100

# =========================================================================
# STAGE 9: FINAL WEIGHTED SCORING & EXPLAINABILITY ENGINE
# =========================================================================

def calculate_final_score(
    skill_score: float,
    expertise_score: float,
    project_score: float,
    resource_score: float,
    location_score: float,
    availability_score: float,
    weights: dict = MATCHING_WEIGHTS
) -> tuple[float, dict]:
    """
    Calculates the overall weighted match score and exact contribution breakdown.
    Formula:
        Final Score = (Skill * 0.30) + (Expertise * 0.20) + (Projects * 0.20)
                    + (Resources * 0.15) + (Location * 0.10) + (Availability * 0.05)
    Returns:
        - final_score: float strictly bounded within [0.0, 100.0]
        - contributions: dict of raw contributions (score * weight)
    """
    s_skill = max(0.0, min(100.0, float(skill_score or 0.0)))
    s_exp = max(0.0, min(100.0, float(expertise_score or 0.0)))
    s_proj = max(0.0, min(100.0, float(project_score or 0.0)))
    s_res = max(0.0, min(100.0, float(resource_score or 0.0)))
    s_loc = max(0.0, min(100.0, float(location_score or 0.0)))
    s_avail = max(0.0, min(100.0, float(availability_score or 0.0)))

    contributions = {
        "skill": round(s_skill * weights["skill"], 2),
        "expertise": round(s_exp * weights["expertise"], 2),
        "projects": round(s_proj * weights["projects"], 2),
        "resources": round(s_res * weights["resources"], 2),
        "location": round(s_loc * weights["location"], 2),
        "availability": round(s_avail * weights["availability"], 2),
    }

    raw_final = sum(contributions.values())
    bounded_score = max(0.0, min(100.0, raw_final))
    return round(bounded_score, 2), contributions

def generate_natural_explanation(p: dict) -> str:
    """
    Generates a clear, grounded natural language explanation of why the partner
    received its specific recommendation, strictly based on actual CSV / score data.
    """
    clauses = []

    # 1. Technical Skills
    if p["skill_match_percentage"] == 100.0:
        clauses.append("all required technical skills")
    elif p["skill_match_percentage"] >= 60.0:
        clauses.append(f"a strong technical core ({p['matched_skills_count']}/{p['total_required_skills']} skills)")
    elif p["skill_match_percentage"] > 0.0:
        clauses.append("partial technical skill overlap")
    else:
        clauses.append("limited direct technical skills")

    # 2. Domain Expertise
    if p["expertise_score"] == 100.0:
        clauses.append("strong domain expertise")
    elif p["expertise_score"] > 0.0:
        clauses.append("relevant domain expertise")
    else:
        clauses.append("expertise in a different domain")

    # 3. Past Projects
    if p["project_relevance_score"] == 100.0:
        clauses.append("highly relevant past projects")
    elif p["project_relevance_score"] > 0.0:
        clauses.append("related prior project experience")
    else:
        clauses.append("no direct prior projects in this field")

    # 4. Resources
    if p["resource_match_score"] >= 75.0:
        clauses.append("most required physical and team resources")
    elif p["resource_match_score"] > 0.0:
        clauses.append("some required lab/team resources")
    else:
        clauses.append("limited specialized resources")

    # 5. Location
    if p["location_relationship"] == "Same City":
        clauses.append("same-city location")
    elif p["location_relationship"] == "Same State":
        clauses.append("same-state regional location")
    elif p["location_relationship"] == "Nearby Region":
        clauses.append("nearby regional location")
    else:
        clauses.append("a distant location")

    # 6. Availability
    if p["availability_status"] == "Available":
        clauses.append("full current availability")
    elif p["availability_status"] == "Limited":
        clauses.append("limited availability")
    else:
        clauses.append("current unavailability")

    return (
        f"{p['name']} received a {p['final_match_score']:.2f}% overall match because it has "
        + ", ".join(clauses[:-1])
        + ", and "
        + clauses[-1]
        + "."
    )

def generate_recommendation_bullet_points(p: dict) -> list[str]:
    """
    Generates explainable bullet points strictly grounded in computed data and CSV facts.
    """
    reasons = []

    # 1. Skills
    if p["skill_match_percentage"] == 100.0:
        reasons.append("All required technical skills matched")
    elif p["skill_match_percentage"] >= 60.0:
        reasons.append(f"Strong core of technical skills ({p['matched_skills_count']}/{p['total_required_skills']} skills)")
    elif p["skill_match_percentage"] > 0.0:
        reasons.append(f"Partial technical skill overlap ({p['matched_skills_count']}/{p['total_required_skills']} skills)")
    else:
        reasons.append("Limited direct technical skills match")

    # 2. Expertise
    if p["expertise_score"] == 100.0:
        reasons.append("Strong domain expertise in water/environmental systems")
    elif p["expertise_score"] > 0.0:
        reasons.append("Relevant sector expertise")
    else:
        reasons.append("Primary expertise is in a different domain")

    # 3. Projects
    if p["project_relevance_score"] == 100.0:
        reasons.append("Proven deployment track record with relevant groundwater projects")
    elif p["project_relevance_score"] > 0.0:
        reasons.append("Experience from related prior projects")
    else:
        reasons.append("No direct prior projects in this specific domain")

    # 4. Resources
    if p["resource_match_score"] >= 75.0:
        reasons.append("Most required physical and team resources available")
    elif p["resource_match_score"] > 0.0:
        reasons.append("Some required lab and equipment facilities available")
    else:
        reasons.append("Lacks specialized facilities for this challenge")

    # 5. Location
    if p["location_relationship"] == "Same City":
        reasons.append("Same-city location (optimal for ground deployment)")
    elif p["location_relationship"] == "Same State":
        reasons.append("Same-state regional location")
    elif p["location_relationship"] == "Nearby Region":
        reasons.append("Nearby regional location")
    else:
        reasons.append("Distant location (remote collaboration)")

    # 6. Availability
    if p["availability_status"] == "Available":
        reasons.append("Currently available for immediate collaboration")
    elif p["availability_status"] == "Limited":
        reasons.append("Limited availability / partial team bandwidth")
    else:
        reasons.append("Currently unavailable")

    return reasons

# =========================================================================
# EVALUATOR & RANKER (Stages 1 - 9)
# =========================================================================

def evaluate_all_partners(
    partners: list[dict],
    required_skills: list[str],
    domain_keywords: list[str],
    project_keywords: list[str],
    required_resources: list[str],
    target_city: str,
    target_state: str,
    weights: dict = MATCHING_WEIGHTS
) -> list[dict]:
    """
    Evaluates every partner across all 6 factors, calculates the Final Weighted Score,
    and attaches human-readable explainability reasoning.
    """
    validate_weights(weights)

    results = []
    total_skills = len(required_skills)

    for partner in partners:
        # 1. Skill Matching (Stage 2/3)
        matched_sk = match_skills(required_skills, partner["skills"])
        skill_pct = calculate_match_percentage(len(matched_sk), total_skills)

        # 2. Expertise Matching (Stage 4)
        matched_dom, exp_score = match_expertise(domain_keywords, partner["expertise"])

        # 3. Past Project Matching (Stage 5)
        rel_projects, matched_proj_kw, proj_score = match_past_projects(project_keywords, partner["past_projects"])

        # 4. Resource Matching (Stage 6)
        matched_req_res, matched_p_res, res_score = match_resources(required_resources, partner["resources"])

        # 5. Location Matching (Stage 7)
        loc_relationship, loc_score = match_location(partner["location"], target_city, target_state)

        # 6. Availability Matching (Stage 8)
        avail_status, avail_score = match_availability(partner["availability"])

        # 7. Final Weighted Match Score (Stage 9)
        final_score, contributions = calculate_final_score(
            skill_score=skill_pct,
            expertise_score=exp_score,
            project_score=proj_score,
            resource_score=res_score,
            location_score=loc_score,
            availability_score=avail_score,
            weights=weights
        )

        partner_result = {
            "partner_id": partner["partner_id"],
            "name": partner["name"],
            "type": partner["type"],
            "location": partner["location"],
            # 6 Individual Scores
            "skill_match_percentage": round(skill_pct, 1),
            "expertise_score": exp_score,
            "project_relevance_score": proj_score,
            "resource_match_score": res_score,
            "location_match_score": loc_score,
            "availability_score": avail_score,
            # Final Score & Breakdown
            "final_match_score": final_score,
            "contributions": contributions,
            # Metadata
            "matched_skills": matched_sk,
            "matched_skills_count": len(matched_sk),
            "total_required_skills": total_skills,
            "expertise": partner["expertise"],
            "matched_domain_keywords": matched_dom,
            "past_projects": partner["past_projects"],
            "relevant_projects": rel_projects,
            "matched_project_keywords": matched_proj_kw,
            "all_resources": partner["resources"],
            "matched_required_resources": matched_req_res,
            "matched_partner_resources": matched_p_res,
            "target_location": f"{target_city}, {target_state}",
            "location_relationship": loc_relationship,
            "availability_status": avail_status,
        }

        # Generate Explainability
        partner_result["why_recommended"] = generate_natural_explanation(partner_result)
        partner_result["why_recommended_bullets"] = generate_recommendation_bullet_points(partner_result)

        results.append(partner_result)

    return results

def rank_partners_by_final_score(matching_results: list[dict], top_k: int = 5) -> list[dict]:
    """
    Sorts all partners by FINAL_MATCH_SCORE in descending order (highest first)
    and returns the top_k recommended partners.
    """
    sorted_results = sorted(
        matching_results,
        key=lambda item: item["final_match_score"],
        reverse=True
    )
    return sorted_results[:top_k]

def run_problem_matching(problem_data: dict, partners_csv_path: str = None, top_k: int = 5) -> dict:
    """
    Reusable end-to-end matching pipeline function invoked by both CLI and FastAPI endpoint.
    """
    partners = load_partners(partners_csv_path)
    
    # Extract target city and state
    target_city = problem_data.get("target_city")
    target_state = problem_data.get("target_state")
    if not target_city and "target_location" in problem_data:
        parts = [p.strip() for p in problem_data["target_location"].split(",")]
        target_city = parts[0]
        target_state = parts[1] if len(parts) > 1 else ""

    matching_results = evaluate_all_partners(
        partners=partners,
        required_skills=problem_data.get("required_skills", []),
        domain_keywords=problem_data.get("domain_keywords", []),
        project_keywords=problem_data.get("project_keywords", []),
        required_resources=problem_data.get("required_resources", []),
        target_city=target_city or "Ranchi",
        target_state=target_state or "Jharkhand",
        weights=MATCHING_WEIGHTS
    )

    top_matches = rank_partners_by_final_score(matching_results, top_k=top_k)

    # Format structured matches for API consumption
    formatted_matches = []
    for rank, p in enumerate(top_matches, start=1):
        formatted_matches.append({
            "rank": rank,
            "partner_name": p["name"],
            "organization_type": p["type"],
            "location": p["location"],
            "final_match_score": p["final_match_score"],
            "skill_match": p["skill_match_percentage"],
            "expertise_score": p["expertise_score"],
            "past_project_score": p["project_relevance_score"],
            "resource_match": p["resource_match_score"],
            "location_match": p["location_match_score"],
            "availability_score": p["availability_score"],
            "matched_skills": p["matched_skills"],
            "matched_resources": p["matched_partner_resources"],
            "relevant_projects": p["relevant_projects"],
            "why_recommended": p["why_recommended"]
        })

    return {
        "problem_id": str(problem_data.get("problem_id", "")),
        "problem": problem_data.get("problem", ""),
        "problem_domain": problem_data.get("problem_domain", ""),
        "project_keywords": problem_data.get("project_keywords", []),
        "required_skills": problem_data.get("required_skills", []),
        "required_resources": problem_data.get("required_resources", []),
        "target_location": problem_data.get("target_location", f"{target_city}, {target_state}"),
        "matches": formatted_matches
    }

# =========================================================================
# MAIN TEST EXECUTION
# =========================================================================

def main():
    problem_data = {
        "problem_id": "26043",
        "problem": "Contaminated groundwater monitoring",
        "problem_domain": "Water / Environmental Monitoring",
        "domain_keywords": ["Water", "Environmental"],
        "project_keywords": ["Water", "Groundwater"],
        "required_skills": ["IoT", "Sensors", "Water Quality Monitoring"],
        "required_resources": [
            "IoT Hardware",
            "Water Testing Equipment",
            "Sensors",
            "Field Deployment Team"
        ],
        "target_city": "Ranchi",
        "target_state": "Jharkhand",
        "target_location": "Ranchi, Jharkhand"
    }

    result = run_problem_matching(problem_data, top_k=5)

    print("=" * 60)
    print("FINAL PROBLEM-TO-PARTNER MATCHING RESULTS")
    print("=" * 60)
    print(f"\nProblem: {result['problem']}\n")

    for p in result["matches"]:
        print(f"{p['rank']}. {p['partner_name']}")
        print(f"   Type: {p['organization_type']}")
        print(f"   Location: {p['location']}")
        print()
        print(f"   FINAL MATCH SCORE: {p['final_match_score']:.2f}%")
        print()
        print(f"   Skill Match:       {p['skill_match']:>5.1f}%")
        print(f"   Expertise:         {p['expertise_score']:>5.1f}%")
        print(f"   Past Projects:     {p['past_project_score']:>5.1f}%")
        print(f"   Resources:         {p['resource_match']:>5.1f}%")
        print(f"   Location:          {p['location_match']:>5.1f}%")
        print(f"   Availability:      {p['availability_score']:>5.1f}%")
        print()
        print(f"   Why recommended:")
        print(f"   \"{p['why_recommended']}\"")
        print()
        print("-" * 60)

if __name__ == "__main__":
    main()
