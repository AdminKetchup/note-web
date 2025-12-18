import requests
from requests.auth import HTTPBasicAuth

def test_post_api_ai_missing_userid_returns_400():
    base_url = "http://localhost:3000"
    endpoint = f"{base_url}/api/ai"
    auth = HTTPBasicAuth("recommendations@reply.pinterest.com", "recommendations@reply.pinterest.com")
    headers = {
        "Content-Type": "application/json"
    }
    # Payload without userId
    payload = {
        "prompt": "Generate something interesting.",
        "model": "gpt-4",
        "messages": [{"role": "user", "content": "Hello"}]
    }
    try:
        response = requests.post(endpoint, json=payload, headers=headers, auth=auth, timeout=30)
    except requests.RequestException as e:
        assert False, f"Request failed: {e}"

    assert response.status_code == 400, f"Expected status code 400 but got {response.status_code}"

    # No assertion on error message to avoid false failures due to server message variation

test_post_api_ai_missing_userid_returns_400()