import requests
from requests.auth import HTTPBasicAuth

def test_post_api_ai_missing_apikey_returns_401():
    base_url = "http://localhost:3000"
    endpoint = "/api/ai"
    url = base_url + endpoint
    auth = HTTPBasicAuth('recommendations@reply.pinterest.com', 'recommendations@reply.pinterest.com')

    # Prepare payload with valid userId but simulate missing API key scenario
    payload = {
        "userId": "test-user-id",
        "prompt": "Test prompt",
        "model": "test-model",
        "messages": []
    }
    headers = {
        "Content-Type": "application/json"
    }

    try:
        response = requests.post(url, json=payload, headers=headers, auth=auth, timeout=30)
        # Assert that the response status code is 401 Unauthorized due to missing API key
        assert response.status_code == 401, f"Expected status code 401 but got {response.status_code}"
        # Optionally check if response content/message indicates missing API key
        assert "missing" in response.text.lower() or "api key" in response.text.lower(), "Response does not indicate missing API key"
    except requests.RequestException as e:
        assert False, f"Request failed with exception: {e}"

test_post_api_ai_missing_apikey_returns_401()