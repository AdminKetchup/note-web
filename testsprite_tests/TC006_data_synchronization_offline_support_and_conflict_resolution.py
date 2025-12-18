import requests
import time
import threading

BASE_URL = "http://localhost:3000"
AUTH_USERNAME = "recommendations@reply.pinterest.com"
AUTH_PASSWORD = "recommendations@reply.pinterest.com"
TIMEOUT = 30
HEADERS = {
    "Content-Type": "application/json",
}

def get_basic_auth_token(username, password):
    import base64
    token = f"{username}:{password}"
    token_bytes = token.encode('utf-8')
    base64_bytes = base64.b64encode(token_bytes)
    return base64_bytes.decode('utf-8')

def test_data_synchronization_offline_support_and_conflict_resolution():
    # Assume API endpoints for sync layer (hypothetical as not specified in PRD)
    # 1. /api/sync/yjs - POST to send updates
    # 2. /api/sync/yjs - GET to retrieve current document state
    # We'll simulate offline by queueing updates client-side, then sending them after a delay
    # We'll also simulate conflict by changing document from two "clients"
    
    auth_header = {"Authorization": f"Basic {get_basic_auth_token(AUTH_USERNAME, AUTH_PASSWORD)}"}
    headers = {**HEADERS, **auth_header}
    
    document_id = None

    try:
        # Step 1: Create a new Yjs document resource (simulate creation if needed)
        create_resp = requests.post(
            f"{BASE_URL}/api/sync/yjs",
            headers=headers,
            json={"action": "create", "docName": "test-doc-tc006"},
            timeout=TIMEOUT,
        )
        assert create_resp.status_code == 201 or create_resp.status_code == 200, f"Failed to create sync doc: {create_resp.text}"
        document_info = create_resp.json()
        document_id = document_info.get("id") or document_info.get("documentId")
        assert document_id, "No document id returned on creation"

        # Simulated local client 1 update queue (offline mode): queue updates without sending
        client1_updates = [{"action": "update", "changes": {"field": "title", "value": "Initial Title from client1"}}]

        # Simulated local client 2 real-time update on server (to cause conflict)
        client2_update_payload = {
            "action": "update",
            "docId": document_id,
            "changes": {"field": "title", "value": "Conflicting Title from client2"}
        }
        client2_resp = requests.post(
            f"{BASE_URL}/api/sync/yjs",
            headers=headers,
            json=client2_update_payload,
            timeout=TIMEOUT,
        )
        assert client2_resp.status_code == 200, f"Client2 update failed: {client2_resp.text}"

        # Simulate client1 coming back online, sending queued updates
        for update in client1_updates:
            update_payload = {"action": update["action"], "docId": document_id, "changes": update["changes"]}
            resp = requests.post(
                f"{BASE_URL}/api/sync/yjs",
                headers=headers,
                json=update_payload,
                timeout=TIMEOUT,
            )
            assert resp.status_code == 200, f"Client1 update failed: {resp.text}"

        # After reconciliation, fetch final document state to verify conflict resolution
        fetch_resp = requests.get(
            f"{BASE_URL}/api/sync/yjs?docId={document_id}",
            headers=headers,
            timeout=TIMEOUT,
        )
        assert fetch_resp.status_code == 200, f"Failed to fetch document after sync: {fetch_resp.text}"
        final_doc = fetch_resp.json()
        # Validate no data loss - final title must be one of the updates, as per conflict resolution strategy
        final_title = final_doc.get("title")
        assert final_title in ("Initial Title from client1", "Conflicting Title from client2"), \
            f"Unexpected final title after conflict resolution: {final_title}"

    finally:
        # Cleanup - delete document if created
        if document_id:
            try:
                del_resp = requests.delete(
                    f"{BASE_URL}/api/sync/yjs?docId={document_id}",
                    headers=headers,
                    timeout=TIMEOUT,
                )
                # If deletion fails, just log but don't fail test
                if del_resp.status_code not in (200, 204):
                    print(f"Warning: failed to delete test document {document_id}: {del_resp.text}")
            except Exception as e:
                print(f"Exception during cleanup deleting document {document_id}: {e}")

test_data_synchronization_offline_support_and_conflict_resolution()