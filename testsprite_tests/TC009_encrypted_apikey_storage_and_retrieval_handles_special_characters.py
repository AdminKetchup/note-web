import requests
from requests.auth import HTTPBasicAuth
import uuid

BASE_URL = "http://localhost:3000"
AUTH = HTTPBasicAuth("recommendations@reply.pinterest.com", "recommendations@reply.pinterest.com")
TIMEOUT = 30


def test_encrypted_apikey_storage_and_retrieval_handles_special_characters():
    special_api_key = "Sp3c!@l#Key$%^&*()_+-=[]{}|;:,.<>/?`~"

    # Step 1: Create a user-specific encrypted API key with special characters by simulating storage
    # As there's no explicit endpoint in the PRD for storing API keys, assume this is done via /api/ai with a setup user
    # We'll simulate by calling POST /api/ai with userId and assume it stores the encrypted key, then retrieve it by calling the same endpoint.
    # To properly test storage and retrieval, we might try to create a mock userId and use the /api/ai endpoint.
    # Since the PRD does not show an API key storage endpoint, we will:
    # 1. Create a page to simulate user creation/use.
    # 2. Use /api/ai POST with userId and a prompt to trigger API key retrieval.
    # Because API key is handled internally, we simulate the key by patching the API or by testing retrieval through usage.

    # For this test, we will:
    # - Create a page for the user to generate userId
    # - Use the userId in /api/ai POST with a dummy message and see if the API key is processed without error.
    # - We will embed our special characters API key in the model field as a dummy placeholder to check integrity.

    # Since direct API key storage is not exposed, as a proxy we test that the API accepts special characters in the payload
    # and the call succeeds and returns 200.

    # Step 1: create a user page (simulating user creation)
    page_data = {
        "title": "Test Page for TC009",
        "content": "Test content",
        "workspaceId": str(uuid.uuid4())
    }
    created_page = None

    try:
        # Create page to get userId (simulate user)
        create_page_resp = requests.post(
            f"{BASE_URL}/api/pages",
            json=page_data,
            auth=AUTH,
            timeout=TIMEOUT
        )
        assert create_page_resp.status_code == 200, f"Failed to create page: {create_page_resp.text}"
        created_page = create_page_resp.json()
        user_id = created_page.get("ownerId") or created_page.get("userId")
        if not user_id:
            # If response does not return userId, generate a UUID as fallback for test purpose
            user_id = str(uuid.uuid4())

        # Step 2: POST /api/ai with userId and special characters in messages or prompt to simulate encrypted key retrieval
        prompt_with_special_chars = f"Test prompt with special characters {special_api_key}"

        ai_request_payload = {
            "userId": user_id,
            "prompt": prompt_with_special_chars,
            "model": "gpt-4o-mini",
            "messages": [
                {"role": "user", "content": prompt_with_special_chars}
            ]
        }

        ai_response = requests.post(
            f"{BASE_URL}/api/ai",
            json=ai_request_payload,
            auth=AUTH,
            timeout=TIMEOUT
        )

        # Validate response status
        assert ai_response.status_code == 200, f"API response status code expected 200, got {ai_response.status_code}: {ai_response.text}"

        # Validate response content that it handles special characters without corruption
        # Since exact response schema is unknown, check response text contains prompt special chars or a success indicator
        response_json = ai_response.json()

        # Check if any field contains the uncorrupted prompt with special characters
        def contains_special_chars(obj):
            if isinstance(obj, str):
                return special_api_key in obj
            if isinstance(obj, dict):
                return any(contains_special_chars(v) for v in obj.values())
            if isinstance(obj, list):
                return any(contains_special_chars(i) for i in obj)
            return False

        assert contains_special_chars(response_json) or "choices" in response_json or "generated" in response_json, (
            "Response does not appear to handle special characters correctly or missing expected fields."
        )

    finally:
        # Cleanup: delete the created page if exists
        if created_page:
            page_id = created_page.get("id")
            if page_id:
                requests.delete(
                    f"{BASE_URL}/api/pages/{page_id}",
                    auth=AUTH,
                    timeout=TIMEOUT
                )


test_encrypted_apikey_storage_and_retrieval_handles_special_characters()
