import requests
import time

BASE_URL = "http://localhost:3000"
AUTH = ("recommendations@reply.pinterest.com", "recommendations@reply.pinterest.com")
HEADERS = {"Content-Type": "application/json"}
TIMEOUT = 30

def test_real_time_collaboration_live_cursors_and_comments():
    """
    Test the real-time collaboration features including multi-user live cursors,
    commenting, and content sharing to ensure updates propagate correctly without synchronization errors.
    """
    try:
        # Step 1: Create a new page for collaboration (simulate a shared resource)
        create_page_payload = {
            "title": "Test Collaboration Page",
            "content": "",
            "collaborators": ["recommendations@reply.pinterest.com"]  # initial single user
        }
        create_resp = requests.post(
            f"{BASE_URL}/api/pages",
            json=create_page_payload,
            auth=AUTH,
            headers=HEADERS,
            timeout=TIMEOUT,
        )
        assert create_resp.status_code == 201 or create_resp.status_code == 200, f"Failed to create page: {create_resp.text}"
        page_data = create_resp.json()
        page_id = page_data.get("id")
        assert page_id, "Created page response missing 'id'"

        # Step 2: Add a second user as collaborator (simulate multi-user live cursors)
        add_collab_payload = {"collaborators": ["recommendations@reply.pinterest.com", "user2@example.com"]}
        update_resp = requests.put(
            f"{BASE_URL}/api/pages/{page_id}/collaborators",
            json=add_collab_payload,
            auth=AUTH,
            headers=HEADERS,
            timeout=TIMEOUT,
        )
        assert update_resp.status_code == 200, f"Failed to update collaborators: {update_resp.text}"
        updated_collab = update_resp.json()
        assert "user2@example.com" in updated_collab.get("collaborators", []), "Collaborator user2@example.com not added"

        # Step 3: Simulate cursor position updates from both users repeatedly and check synchronization status
        # Assuming API /api/pages/{page_id}/cursors with POST to update cursor and GET to fetch all cursors
        cursor_positions = {
            "recommendations@reply.pinterest.com": {"x": 100, "y": 150},
            "user2@example.com": {"x": 200, "y": 250},
        }
        for user, pos in cursor_positions.items():
            cursor_payload = {"userId": user, "position": pos}
            cursor_update_resp = requests.post(
                f"{BASE_URL}/api/pages/{page_id}/cursors",
                json=cursor_payload,
                auth=AUTH,
                headers=HEADERS,
                timeout=TIMEOUT,
            )
            assert cursor_update_resp.status_code == 200, f"Failed to update cursor for {user}: {cursor_update_resp.text}"

        # Small delay to allow server to propagate cursor updates
        time.sleep(1)

        # Validate all cursor positions from GET
        cursor_get_resp = requests.get(
            f"{BASE_URL}/api/pages/{page_id}/cursors",
            auth=AUTH,
            headers=HEADERS,
            timeout=TIMEOUT,
        )
        assert cursor_get_resp.status_code == 200, f"Failed to get cursors: {cursor_get_resp.text}"
        cursors = cursor_get_resp.json()
        for user, pos in cursor_positions.items():
            saved_pos = cursors.get(user)
            assert saved_pos == pos, f"Cursor position mismatch for {user}: expected {pos}, got {saved_pos}"

        # Step 4: Simulate commenting feature - post a comment and retrieve and verify
        comment_payload = {
            "userId": "recommendations@reply.pinterest.com",
            "comment": "This is a test comment for real-time collaboration.",
            "timestamp": int(time.time() * 1000)
        }
        comment_post_resp = requests.post(
            f"{BASE_URL}/api/pages/{page_id}/comments",
            json=comment_payload,
            auth=AUTH,
            headers=HEADERS,
            timeout=TIMEOUT,
        )
        assert comment_post_resp.status_code == 201 or comment_post_resp.status_code == 200, f"Failed to post comment: {comment_post_resp.text}"
        comment_data = comment_post_resp.json()
        comment_id = comment_data.get("id")
        assert comment_id, "Comment response missing 'id'"

        # Retrieve comments and verify presence
        comment_get_resp = requests.get(
            f"{BASE_URL}/api/pages/{page_id}/comments",
            auth=AUTH,
            headers=HEADERS,
            timeout=TIMEOUT,
        )
        assert comment_get_resp.status_code == 200, f"Failed to get comments: {comment_get_resp.text}"
        comments = comment_get_resp.json()
        matched_comments = [c for c in comments if c.get("id") == comment_id and c.get("comment") == comment_payload["comment"]]
        assert len(matched_comments) == 1, "Posted comment not found in comments list"

        # Step 5: Simulate content sharing - update page content and verify update propagation
        content_update_payload = {
            "content": "This is updated content shared by the user."
        }
        content_update_resp = requests.put(
            f"{BASE_URL}/api/pages/{page_id}/content",
            json=content_update_payload,
            auth=AUTH,
            headers=HEADERS,
            timeout=TIMEOUT,
        )
        assert content_update_resp.status_code == 200, f"Failed to update page content: {content_update_resp.text}"

        # Fetch the page content to verify synchronization
        get_page_resp = requests.get(
            f"{BASE_URL}/api/pages/{page_id}",
            auth=AUTH,
            headers=HEADERS,
            timeout=TIMEOUT,
        )
        assert get_page_resp.status_code == 200, f"Failed to get page: {get_page_resp.text}"
        page_info = get_page_resp.json()
        assert page_info.get("content") == content_update_payload["content"], "Page content did not update correctly"

    finally:
        # Cleanup - delete the created page to avoid remnant data
        if 'page_id' in locals() and page_id:
            del_resp = requests.delete(
                f"{BASE_URL}/api/pages/{page_id}",
                auth=AUTH,
                headers=HEADERS,
                timeout=TIMEOUT,
            )
            # If deletion fails, just print to stdout, do not raise error on cleanup
            if del_resp.status_code not in [200, 204]:
                print(f"Warning: Failed to delete test page {page_id}: {del_resp.status_code} {del_resp.text}")

test_real_time_collaboration_live_cursors_and_comments()