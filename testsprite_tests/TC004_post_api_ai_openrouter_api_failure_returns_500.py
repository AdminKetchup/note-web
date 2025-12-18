import requests
from requests.auth import HTTPBasicAuth

def test_post_api_ai_openrouter_api_failure_returns_500():
    base_url = "http://localhost:3000"
    endpoint = f"{base_url}/api/ai"
    auth = HTTPBasicAuth("recommendations@reply.pinterest.com", "recommendations@reply.pinterest.com")
    headers = {"Content-Type": "application/json"}
    # Prepare a typical valid request body including required userId and some prompt
    payload = {
        "userId": "test-user-123",
        "prompt": "Test prompt to generate AI content",
        "model": "test-model"
    }

    # We expect the underlying OpenRouter API call to fail and cause a 500 response.
    # Since we can't cause the actual OpenRouter failure externally here,
    # this test should be run in environment where OpenRouter API failure is simulated.
    # The test validates that POST /api/ai returns a 500 status and proper error message.

    try:
        response = requests.post(endpoint, json=payload, headers=headers, auth=auth, timeout=30)
    except requests.RequestException as e:
        assert False, f"Request to {endpoint} failed with exception: {e}"

    assert response.status_code == 500, f"Expected status code 500 but got {response.status_code}"

    # Expect response JSON has an error message indicating internal server error
    try:
        json_response = response.json()
    except ValueError:
        assert False, "Response is not valid JSON"

    # Check that response contains an error message key or meaningful message
    assert (
        "error" in json_response or "message" in json_response
    ), "Response JSON must include an error message field"

test_post_api_ai_openrouter_api_failure_returns_500()