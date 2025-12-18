import requests
from requests.auth import HTTPBasicAuth

def test_post_api_ai_valid_userid_returns_generated_content():
    base_url = "http://localhost:3000"
    endpoint = f"{base_url}/api/ai"
    auth = HTTPBasicAuth("recommendations@reply.pinterest.com", "recommendations@reply.pinterest.com")
    headers = {
        "Content-Type": "application/json"
    }
    payload = {
        "userId": "valid-user-id-for-testing",
        "prompt": "Generate a short AI text",
        "model": "default",
        "messages": []
    }

    try:
        response = requests.post(endpoint, json=payload, headers=headers, auth=auth, timeout=30)
        assert response.status_code == 200, f"Expected status code 200, got {response.status_code}"
        json_response = response.json()
        # Validate that generated content is present and non-empty
        assert isinstance(json_response, dict), "Response is not a JSON object"
        # Assuming response contains "content" or similar key with generated AI text
        assert ("content" in json_response and isinstance(json_response["content"], str) and len(json_response["content"]) > 0) or \
               ("result" in json_response and isinstance(json_response["result"], str) and len(json_response["result"]) > 0), \
               "Response JSON does not contain expected generated content"
    except requests.exceptions.RequestException as e:
        assert False, f"Request failed: {e}"

test_post_api_ai_valid_userid_returns_generated_content()