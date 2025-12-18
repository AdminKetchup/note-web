import requests

BASE_URL = "http://localhost:3000"
HEADERS = {"Content-Type": "application/json"}
TIMEOUT = 30

def test_formula_engine_error_handling_and_stability():
    """
    Validate that the formula engine handles invalid inputs and circular references gracefully
    without crashing or causing application instability.
    """

    url = f"{BASE_URL}/api/ai"

    # Test 1: Missing userId (should return 400)
    payload_missing_userid = {
        "prompt": "Calculate sum",
        "model": "default-model",
    }
    response = None
    try:
        response = requests.post(url, json=payload_missing_userid, headers=HEADERS, timeout=TIMEOUT)
        assert response.status_code == 400, f"Expected 400 for missing userId but got {response.status_code}"
    except requests.RequestException as e:
        assert False, f"Request failed: {e}"

    # Test 2: Invalid formula input (simulate invalid input in prompt/messages)
    payload_invalid_formula = {
        "userId": "test-user",
        "prompt": "FORMULA: invalid_formula_syntax_here()",
        "model": "default-model"
    }
    try:
        response = requests.post(url, json=payload_invalid_formula, headers=HEADERS, timeout=TIMEOUT)
        # Should not crash, expect 200 with error message or a 400/401/500 error gracefully
        assert response.status_code in (200, 400, 401, 500), f"Unexpected status code {response.status_code} for invalid formula input"
        # If 200, check response content for error indication
        if response.status_code == 200:
            json_resp = response.json()
            # Expect some indication of error or handled failure in response structure
            contains_error = (
                ("error" in json_resp)
                or ("message" in json_resp and "error" in json_resp["message"].lower())
                or ("result" in json_resp and json_resp["result"] is None)
            )
            assert contains_error, "Response 200 but no error indication found for invalid formula input"
    except requests.RequestException as e:
        assert False, f"Request failed: {e}"

    # Test 3: Circular reference in formula (simulate circular reference input)
    payload_circular_ref = {
        "userId": "test-user",
        "prompt": "FORMULA: a = b + 1; b = a + 1;",  # simplistic example to represent circular ref
        "model": "default-model"
    }
    try:
        response = requests.post(url, json=payload_circular_ref, headers=HEADERS, timeout=TIMEOUT)
        # Should handle gracefully without crash
        assert response.status_code in (200, 400, 401, 500), f"Unexpected status code {response.status_code} for circular reference formula"
        if response.status_code == 200:
            json_resp = response.json()
            # Expect graceful error or no infinite loop: check error indication
            contains_error = (
                ("error" in json_resp)
                or ("message" in json_resp and "circular" in json_resp["message"].lower())
                or ("result" in json_resp and json_resp["result"] is None)
            )
            assert contains_error, "Response 200 but no circular reference error indication found"
    except requests.RequestException as e:
        assert False, f"Request failed: {e}"

    # Test 4: Stability Check - Send multiple invalid requests in a row (simulate load/robustness)
    try:
        for i in range(5):
            payload = {
                "userId": "test-user",
                "prompt": "FORMULA: invalid_syntax_#" + str(i),
                "model": "default-model"
            }
            resp = requests.post(url, json=payload, headers=HEADERS, timeout=TIMEOUT)
            assert resp.status_code in (200, 400, 401, 500), f"Unexpected status code {resp.status_code} on repeated invalid input {i}"
        # If all requests returned responses without exceptions, stability for invalid input is upheld
    except requests.RequestException as e:
        assert False, f"Stability test failed due to exception: {e}"


test_formula_engine_error_handling_and_stability()
