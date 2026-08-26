import csv
import os

def parse_semicolon_list(raw_text: str) -> list[str]:
    """
    Safely converts a semicolon-separated string into a clean Python list.
    Example: 'IoT; Sensors; Water Quality' -> ['IoT', 'Sensors', 'Water Quality']
    Handles empty/None values by returning an empty list [].
    """
    if not raw_text:
        return []
    # Split by semicolon, remove extra spaces around each item, and filter out empty strings
    return [item.strip() for item in raw_text.split(";") if item.strip()]

def load_partners(file_path: str) -> list[dict]:
    """
    Reads a CSV file and converts each row into a structured Python dictionary.
    """
    # Check if file exists
    if not os.path.exists(file_path):
        raise FileNotFoundError(f"CSV file not found at: {file_path}")

    partners = []
    
    # Open CSV file safely with utf-8 encoding
    with open(file_path, mode="r", encoding="utf-8") as file:
        # csv.DictReader maps headers to dictionary keys for each row
        reader = csv.DictReader(file)
        
        for row in reader:
            # Clean and parse each field safely
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

def main():
    # Detect file: check 'partners.csv' first, fallback to 'patners.csv' if named with a typo
    file_path = "partners.csv"
    if not os.path.exists(file_path) and os.path.exists("patners.csv"):
        file_path = "patners.csv"
        
    print(f"Loading data from: {file_path}\n" + "=" * 60)
    
    partners = load_partners(file_path)
    
    print(f"Successfully loaded {len(partners)} partners!\n")
    
    # Print formatted details for each partner
    for index, partner in enumerate(partners, start=1):
        print(f"[{index:02d}] Name     : {partner['name']}")
        print(f"     Type     : {partner['type']}")
        print(f"     Location : {partner['location']}")
        print(f"     Skills   : {partner['skills']}")
        print("-" * 60)

if __name__ == "__main__":
    main()

