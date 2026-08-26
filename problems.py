"""
SOLVESPHERE - Problem Repository Module
Stores crowdsourced societal challenges and their extracted matching requirements.
"""

PROBLEMS_DATABASE = {
    "26043": {
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
    },
    "SIH26043": {
        "problem_id": "SIH26043",
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
    },
    "26044": {
        "problem_id": "26044",
        "problem": "Autonomous urban waste segregation and monitoring",
        "problem_domain": "Waste Management / Robotics",
        "domain_keywords": ["Waste", "Robotics", "Automation"],
        "project_keywords": ["Waste", "Segregation"],
        "required_skills": ["Robotics", "Computer Vision", "AI", "Waste Management"],
        "required_resources": [
            "Robotics Lab",
            "Computer Vision Lab",
            "3D Printers",
            "Field Team"
        ],
        "target_city": "Dhanbad",
        "target_state": "Jharkhand",
        "target_location": "Dhanbad, Jharkhand"
    }
}

def get_problem_by_id(problem_id: str) -> dict | None:
    """
    Retrieves problem definition by problem_id.
    Supports case-insensitive lookups (e.g. 'sih26043', '26043').
    """
    if not problem_id:
        return None
    
    clean_id = str(problem_id).strip()
    # Check exact match
    if clean_id in PROBLEMS_DATABASE:
        return PROBLEMS_DATABASE[clean_id]
    
    # Check case-insensitive
    for k, v in PROBLEMS_DATABASE.items():
        if k.lower() == clean_id.lower():
            return v
            
    return None

