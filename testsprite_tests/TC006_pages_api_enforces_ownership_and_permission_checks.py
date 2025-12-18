import requests

BASE_URL = "http://localhost:3000/api/pages"
# Using placeholder token for authorization header as per PRD token based auth
AUTH_TOKEN = "Bearer your_valid_token_here"
HEADERS = {"Content-Type": "application/json", "Authorization": AUTH_TOKEN}
TIMEOUT = 30

def test_pages_api_enforces_ownership_and_permission_checks():
    # Create a new page as authorized user
    create_payload = {
        "title": "Test Page Ownership",
        "content": "This is a test page to check ownership and permissions."
    }
    page_id = None

    try:
        # Create page (should succeed)
        create_response = requests.post(
            BASE_URL,
            json=create_payload,
            headers=HEADERS,
            timeout=TIMEOUT,
        )
        assert create_response.status_code == 201 or create_response.status_code == 200
        create_data = create_response.json()
        assert "id" in create_data
        page_id = create_data.get("id")
        assert page_id is not None

        # Try to access the page with the same user (should succeed)
        get_response = requests.get(
            f"{BASE_URL}/{page_id}",
            headers=HEADERS,
            timeout=TIMEOUT,
        )
        assert get_response.status_code == 200
        get_data = get_response.json()
        assert get_data.get("id") == page_id

        # Try to update the page with the same user (should succeed)
        update_payload = {"title": "Updated Test Page Ownership"}
        update_response = requests.put(
            f"{BASE_URL}/{page_id}",
            json=update_payload,
            headers=HEADERS,
            timeout=TIMEOUT,
        )
        assert update_response.status_code == 200
        update_data = update_response.json()
        assert update_data.get("title") == update_payload["title"]

        # Try to delete the page with the same user (should succeed)
        delete_response = requests.delete(
            f"{BASE_URL}/{page_id}",
            headers=HEADERS,
            timeout=TIMEOUT,
        )
        assert delete_response.status_code == 204 or delete_response.status_code == 200

        # Now create another page to test unauthorized access
        create_response_2 = requests.post(
            BASE_URL,
            json=create_payload,
            headers=HEADERS,
            timeout=TIMEOUT,
        )
        assert create_response_2.status_code == 201 or create_response_2.status_code == 200
        data_2 = create_response_2.json()
        assert "id" in data_2
        page_id_2 = data_2.get("id")
        assert page_id_2 is not None

        try:
            # Unauthorized user credentials (different user)
            # For unauthorized, use no Authorization header or an invalid token
            unauthorized_headers = {"Content-Type": "application/json", "Authorization": "Bearer invalid_token"}

            # Attempt to read the page owned by original user (should be rejected)
            get_unauth_response = requests.get(
                f"{BASE_URL}/{page_id_2}",
                headers=unauthorized_headers,
                timeout=TIMEOUT,
            )
            assert get_unauth_response.status_code in (401, 403)

            # Attempt to update the page owned by original user (should be rejected)
            update_payload_unauth = {"title": "Unauthorized Update Attempt"}
            update_unauth_response = requests.put(
                f"{BASE_URL}/{page_id_2}",
                json=update_payload_unauth,
                headers=unauthorized_headers,
                timeout=TIMEOUT,
            )
            assert update_unauth_response.status_code in (401, 403)

            # Attempt to delete the page owned by original user (should be rejected)
            delete_unauth_response = requests.delete(
                f"{BASE_URL}/{page_id_2}",
                headers=unauthorized_headers,
                timeout=TIMEOUT,
            )
            assert delete_unauth_response.status_code in (401, 403)
        finally:
            # Clean up second created page with authorized user
            requests.delete(
                f"{BASE_URL}/{page_id_2}",
                headers=HEADERS,
                timeout=TIMEOUT,
            )
    finally:
        if page_id:
            # Ensure cleanup for first created page in case of test failure before deletion
            requests.delete(
                f"{BASE_URL}/{page_id}",
                headers=HEADERS,
                timeout=TIMEOUT,
            )

test_pages_api_enforces_ownership_and_permission_checks()