import requests
import time
import random
import string

BASE_URL = "http://localhost:3000"
AUTH = ("recommendations@reply.pinterest.com", "recommendations@reply.pinterest.com")
HEADERS = {"Content-Type": "application/json"}
TIMEOUT = 30

def random_string(length=10):
    return ''.join(random.choices(string.ascii_letters + string.digits, k=length))

def create_page(session, title, parent_id=None):
    url = f"{BASE_URL}/api/pages"
    payload = {"title": title}
    if parent_id:
        payload["parentId"] = parent_id
    resp = session.post(url, json=payload, timeout=TIMEOUT)
    resp.raise_for_status()
    return resp.json()["id"] if "id" in resp.json() else resp.json()

def delete_page(session, page_id):
    url = f"{BASE_URL}/api/pages/{page_id}"
    resp = session.delete(url, timeout=TIMEOUT)
    return resp

def get_pages(session, params=None):
    url = f"{BASE_URL}/api/pages"
    resp = session.get(url, params=params, timeout=TIMEOUT)
    return resp

def test_workspace_navigation_sidebar_and_page_management():
    session = requests.Session()
    session.auth = AUTH
    session.headers.update(HEADERS)

    created_page_ids = []

    try:
        # Create a parent folder page
        parent_title = f"TestFolder_{random_string(8)}"
        parent_page = create_page(session, parent_title)
        assert parent_page, "Failed to create parent folder page"
        parent_id = parent_page if isinstance(parent_page, str) else parent_page.get("id")
        created_page_ids.append(parent_id)

        # Create many child pages to simulate long list and folder-like structure
        child_page_count = 120  # large number to simulate long lists
        child_titles = [f"ChildPage_{i}_{random_string(6)}" for i in range(child_page_count)]

        for title in child_titles:
            child_page = create_page(session, title, parent_id=parent_id)
            assert child_page, f"Failed to create child page {title}"
            child_page_id = child_page if isinstance(child_page, str) else child_page.get("id")
            created_page_ids.append(child_page_id)

        # Fetch pages with parentId filter to simulate UI sidebar loading this folder
        resp = get_pages(session, params={"parentId": parent_id})
        assert resp.status_code == 200, f"Failed to fetch child pages, HTTP {resp.status_code}"
        data = resp.json()
        assert isinstance(data, list), "Pages API did not return a list"
        assert len(data) >= child_page_count, f"Expected at least {child_page_count} child pages, got {len(data)}"

        # Test pagination or performance by timing the response - should be reasonable
        start_time = time.time()
        resp_perf = get_pages(session, params={"parentId": parent_id})
        resp_perf.raise_for_status()
        duration = time.time() - start_time
        assert duration < 5, f"Loading long page list took too long: {duration:.2f}s"

        # Test that UI would receive properly ordered or structured data as expected
        # Check keys in each page response item
        for page in resp.json():
            assert "id" in page and "title" in page, "Page object missing id or title"

    finally:
        # Clean up created pages (child pages then parent)
        for pid in reversed(created_page_ids):
            try:
                delete_resp = delete_page(session, pid)
                # Accept 200 or 204 status as successful deletion
                assert delete_resp.status_code in [200, 204], f"Failed to delete page {pid}"
            except Exception:
                # Ignore cleanup errors to not mask test results
                pass

test_workspace_navigation_sidebar_and_page_management()