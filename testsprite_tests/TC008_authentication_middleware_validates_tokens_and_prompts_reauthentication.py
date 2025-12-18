import requests
from requests.auth import HTTPBasicAuth

BASE_URL = "http://localhost:3000"
AUTH_USERNAME = "recommendations@reply.pinterest.com"
AUTH_PASSWORD = "recommendations@reply.pinterest.com"
TIMEOUT = 30

def test_authentication_middleware_validates_tokens_and_prompts_reauthentication():
    # Endpoint to test protected resource or API call that requires valid token
    # Using the /api/ai endpoint as it requires authentication per PRD description

    url = f"{BASE_URL}/api/ai"
    valid_headers = {
        "Authorization": f"Basic {requests.auth._basic_auth_str(AUTH_USERNAME, AUTH_PASSWORD).split(' ')[1]}",
        "Content-Type": "application/json"
    }
    payload = {
        "userId": "validUserId123",
        "prompt": "Hello AI",
        "model": "test-model"
    }

    # Step 1: Test with valid token: expect NOT a 401 or 403 error (ideally 200 or 400 for missing data)
    try:
        response_valid = requests.post(url, json=payload, auth=HTTPBasicAuth(AUTH_USERNAME, AUTH_PASSWORD), timeout=TIMEOUT)
        assert response_valid.status_code != 401, f"Valid token was rejected with status {response_valid.status_code}"
        assert response_valid.status_code != 403, f"Valid token was rejected with status {response_valid.status_code}"
    except requests.RequestException as e:
        assert False, f"Request with valid token failed unexpectedly: {e}"

    # Step 2: Test with invalid token: set wrong Authorization header
    invalid_headers = {
        "Authorization": "Basic invalidtoken1234",
        "Content-Type": "application/json"
    }
    try:
        response_invalid = requests.post(url, headers=invalid_headers, json=payload, timeout=TIMEOUT)
        assert response_invalid.status_code == 401, (
            f"Invalid token did not return 401 Unauthorized, got {response_invalid.status_code}"
        )
        # Optionally check that response prompts reauthentication message
        body = response_invalid.json()
        assert ("reauthenticat" in str(body).lower() or "token" in str(body).lower()), (
            "Response does not prompt reauthentication or mention token invalidity"
        )
    except requests.RequestException as e:
        assert False, f"Request with invalid token failed unexpectedly: {e}"

    # Step 3: Test with expired token simulation - typically would be a token string but here simulate by a typical expired token header
    expired_headers = {
        "Authorization": "Basic " + requests.auth._basic_auth_str("expiredUser", "expiredPass").split(" ")[1],
        "Content-Type": "application/json"
    }
    try:
        response_expired = requests.post(url, headers=expired_headers, json=payload, timeout=TIMEOUT)
        # Expect 401 Unauthorized for expired tokens as well
        assert response_expired.status_code == 401, (
            f"Expired token did not return 401 Unauthorized, got {response_expired.status_code}"
        )
        body = response_expired.json()
        assert ("reauthenticat" in str(body).lower() or "token" in str(body).lower()), (
            "Response for expired token does not prompt reauthentication or mention token expired"
        )
    except requests.RequestException as e:
        assert False, f"Request with expired token failed unexpectedly: {e}"

test_authentication_middleware_validates_tokens_and_prompts_reauthentication()
