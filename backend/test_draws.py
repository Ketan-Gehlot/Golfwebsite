import requests
import json

base_url = "http://localhost:8000/api"
# Need an admin token
resp = requests.post(f"{base_url}/auth/login", json={"email": "admin@golfcharity.com", "password": "admin123"})
if resp.status_code != 200:
    print("Login failed", resp.text)
    exit(1)

token = resp.json()["token"]
headers = {"Authorization": f"Bearer {token}"}

# Create draw
draw_data = {"draw_date": "2026-05-01", "draw_logic_type": "random", "prize_amount": 500}
resp = requests.post(f"{base_url}/admin/draws", json=draw_data, headers=headers)
print("Create Draw:", resp.status_code, resp.text)

if resp.status_code == 200:
    draw_id = resp.json().get("id")
    if draw_id:
        resp2 = requests.post(f"{base_url}/admin/draws/{draw_id}/simulate", headers=headers)
        print("Simulate Draw:", resp2.status_code, resp2.text)
