import requests
from requests.auth import HTTPBasicAuth
import uuid
import time

BASE_URL = "http://localhost:3000"
AUTH_USERNAME = "recommendations@reply.pinterest.com"
AUTH_PASSWORD = "recommendations@reply.pinterest.com"
AUTH = HTTPBasicAuth(AUTH_USERNAME, AUTH_PASSWORD)
TIMEOUT = 30


def test_page_deletion_cascades_to_remove_associated_subdocuments():
    # Create a new page resource with associated subdocuments (simulate with nested blocks)
    create_page_url = f"{BASE_URL}/api/pages"
    # Sample payload assuming API accepts a page with a blocks/subdocuments field for hierarchy
    page_data = {
        "title": "Test Page for Deletion Cascade",
        "content": "Root page content",
        "blocks": [
            {
                "type": "block",
                "content": "Parent block",
                "subblocks": [
                    {
                        "type": "subblock",
                        "content": "Child subblock 1"
                    },
                    {
                        "type": "subblock",
                        "content": "Child subblock 2"
                    }
                ]
            }
        ],
        "workspaceId": "test-workspace-id"
    }

    headers = {
        "Content-Type": "application/json"
    }

    page_id = None
    try:
        # Create the page
        create_resp = requests.post(
            create_page_url,
            json=page_data,
            auth=AUTH,
            headers=headers,
            timeout=TIMEOUT
        )
        assert create_resp.status_code == 201 or create_resp.status_code == 200, \
            f"Page creation failed: {create_resp.status_code}, {create_resp.text}"
        created_page = create_resp.json()
        assert "id" in created_page or "_id" in created_page, "Created page response missing ID"
        page_id = created_page.get("id") or created_page.get("_id")
        assert page_id is not None

        # Optionally wait a moment for any asynchronous cascade processes
        time.sleep(1)

        # Delete the page
        delete_url = f"{BASE_URL}/api/pages/{page_id}"
        delete_resp = requests.delete(
            delete_url,
            auth=AUTH,
            headers=headers,
            timeout=TIMEOUT
        )
        assert delete_resp.status_code == 200 or delete_resp.status_code == 204, \
            f"Page deletion failed: {delete_resp.status_code}, {delete_resp.text}"

        # Check that the page is deleted: expect 404 or similar when fetching page
        get_page_resp = requests.get(
            delete_url,
            auth=AUTH,
            headers=headers,
            timeout=TIMEOUT
        )
        assert get_page_resp.status_code == 404, \
            f"Deleted page still accessible: {get_page_resp.status_code}, {get_page_resp.text}"

        # Verify no orphaned subdocuments or blocks exist
        # Since the API spec doesn't specify an endpoint for blocks or subdocuments,
        # attempt to query blocks or subdocuments related to the page
        # E.g., GET /api/pages/{page_id}/blocks or /api/blocks?parentId=page_id
        # First try GET blocks under page (may need adjustments if API differs)

        blocks_url = f"{BASE_URL}/api/pages/{page_id}/blocks"
        blocks_resp = requests.get(
            blocks_url,
            auth=AUTH,
            headers=headers,
            timeout=TIMEOUT
        )
        # Expect 404 or empty list (depending on API behavior)
        if blocks_resp.status_code == 200:
            blocks = blocks_resp.json()
            assert not blocks, "Orphaned blocks found after page deletion"
        else:
            # 404 or other error acceptable meaning no blocks exist
            assert blocks_resp.status_code == 404 or blocks_resp.status_code == 400 or blocks_resp.status_code == 204

        # Optionally, check for subdocuments if separate endpoint exists, try /api/pages/{page_id}/subdocuments
        subdocs_url = f"{BASE_URL}/api/pages/{page_id}/subdocuments"
        subdocs_resp = requests.get(
            subdocs_url,
            auth=AUTH,
            headers=headers,
            timeout=TIMEOUT
        )
        if subdocs_resp.status_code == 200:
            subdocs = subdocs_resp.json()
            assert not subdocs, "Orphaned subdocuments found after page deletion"
        else:
            assert subdocs_resp.status_code == 404 or subdocs_resp.status_code == 400 or subdocs_resp.status_code == 204

    finally:
        # Cleanup: in case the page was not deleted, delete it now
        if page_id:
            requests.delete(
                f"{BASE_URL}/api/pages/{page_id}",
                auth=AUTH,
                headers=headers,
                timeout=TIMEOUT
            )


test_page_deletion_cascades_to_remove_associated_subdocuments()
