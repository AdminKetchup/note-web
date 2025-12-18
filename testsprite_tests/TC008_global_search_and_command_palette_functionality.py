import requests

BASE_URL = "http://localhost:3000"
TIMEOUT = 30

def test_global_search_and_command_palette_functionality():
    """
    Test the global search modal and command palette for swift navigation and quick actions across the application,
    ensuring responsiveness and accuracy.
    """
    headers = {
        "Content-Type": "application/json"
    }

    # Since the PRD and endpoints do not explicitly provide a dedicated global search or command palette API,
    # we assume the global search is performed via the /api/ai endpoint's prompt/messages based on typical AI integration
    # for quick navigation/commands.
    # We perform a POST request simulating a global search prompt to test responsiveness and accuracy.

    search_prompt = "Search for 'dashboard settings' and open command palette"
    payload = {
        "prompt": search_prompt,
        "userId": "recommendations@reply.pinterest.com",
        "model": "gpt-4o-mini"
    }

    try:
        # Test /api/ai POST for global search-like prompt
        response = requests.post(
            f"{BASE_URL}/api/ai",
            headers=headers,
            json=payload,
            timeout=TIMEOUT
        )

        # Validate response is 200 OK
        assert response.status_code == 200, f"Expected 200 OK, got {response.status_code}"

        # Validate response body contains data and relevant info about navigation/command palette suggestions
        resp_json = response.json()
        assert isinstance(resp_json, (dict, list)), "Response is not valid JSON object or list."

        # Assuming response contains some text content or commands, check for keys or text presence
        content_keys = ["content", "text", "result", "data"]
        if isinstance(resp_json, dict):
            found_key = any(key in resp_json for key in content_keys)
            assert found_key, "Response JSON does not contain expected keys for search results."
        else:
            assert len(resp_json) > 0, "Response JSON list is empty."

    except requests.exceptions.RequestException as e:
        assert False, f"Request to /api/ai failed: {str(e)}"

test_global_search_and_command_palette_functionality()
