import requests
import time

BASE_URL = "http://localhost:3000"
TIMEOUT = 30

# Replace 'your_valid_token_here' with a real token for authenticated requests
HEADERS = {
    "Content-Type": "application/json",
    "Authorization": "Bearer your_valid_token_here"
}

def test_page_navigation_performance_large_folder_structures():
    # Initialize outside try to avoid UnboundLocalError on cleanup
    page_ids = []
    folder_ids = []

    # Step 1: Create a large folder structure with many pages
    folder_root = "root-folder"
    try:
        # Create root folder page
        create_folder_payload = {
            "title": folder_root,
            "type": "folder"
        }
        resp_root = requests.post(
            f"{BASE_URL}/api/pages",
            json=create_folder_payload,
            headers=HEADERS,
            timeout=TIMEOUT
        )
        assert resp_root.status_code == 201, f"Failed to create root folder: {resp_root.text}"
        root_folder_id = resp_root.json().get("id")
        assert root_folder_id, "Root folder ID missing in response"

        # If created successfully, append root folder id
        folder_ids.append(root_folder_id)

        # Create a large number of subfolders and pages under root
        NUM_FOLDERS = 30
        NUM_PAGES_PER_FOLDER = 50

        # Create subfolders under root
        for i in range(NUM_FOLDERS):
            payload = {
                "title": f"folder_{i}",
                "type": "folder",
                "parentId": root_folder_id
            }
            resp = requests.post(
                f"{BASE_URL}/api/pages",
                json=payload,
                headers=HEADERS,
                timeout=TIMEOUT
            )
            assert resp.status_code == 201, f"Failed to create subfolder_{i}: {resp.text}"
            folder_id = resp.json().get("id")
            assert folder_id, f"Subfolder_{i} ID missing in response"
            folder_ids.append(folder_id)

        # Create many pages inside each folder
        for folder_id in folder_ids:
            for j in range(NUM_PAGES_PER_FOLDER):
                payload = {
                    "title": f"page_{folder_id}_{j}",
                    "type": "page",
                    "parentId": folder_id
                }
                resp = requests.post(
                    f"{BASE_URL}/api/pages",
                    json=payload,
                    headers=HEADERS,
                    timeout=TIMEOUT
                )
                assert resp.status_code == 201, f"Failed to create page_{folder_id}_{j}: {resp.text}"
                page_id = resp.json().get("id")
                assert page_id, f"Page_{folder_id}_{j} ID missing in response"
                page_ids.append(page_id)

        # Step 2: Measure performance of navigation - e.g., get folder children and page lists

        # Function to time GET requests to list pages inside a folder
        def timed_get_pages(folder_id):
            start = time.perf_counter()
            resp = requests.get(
                f"{BASE_URL}/api/pages?parentId={folder_id}",
                headers=HEADERS,
                timeout=TIMEOUT
            )
            duration = time.perf_counter() - start
            return resp, duration

        MAX_ACCEPTABLE_DURATION_SEC = 2.0  # Example threshold for fetching page lists

        # Check all folders for performance and valid response
        for folder_id in folder_ids:
            resp, duration = timed_get_pages(folder_id)
            assert resp.status_code == 200, f"Failed to get pages for folder {folder_id}: {resp.text}"
            data = resp.json()
            assert isinstance(data, list), f"Expected list of pages, got: {data}"
            assert duration < MAX_ACCEPTABLE_DURATION_SEC, (
                f"Fetching pages for folder {folder_id} took too long: {duration:.2f}s"
            )

        # Step 3: Validate UI behavior fields if returned - for performance test, basic validation

        # Optionally test sidebar data endpoint if available to simulate UI navigation
        sidebar_resp = requests.get(
            f"{BASE_URL}/api/pages/sidebar",
            headers=HEADERS,
            timeout=TIMEOUT
        )
        # Since sidebar endpoint is not explicitly documented, accept 200 or 404 gracefully
        if sidebar_resp.status_code == 200:
            sidebar_data = sidebar_resp.json()
            assert isinstance(sidebar_data, dict) or isinstance(sidebar_data, list), "Invalid sidebar data structure"
        else:
            # Not implemented or no sidebar API, skip
            pass

    finally:
        # Cleanup: Delete all created pages and folders
        # Deletions may cascade or may require individual deletes
        def delete_page(page_id):
            resp = requests.delete(
                f"{BASE_URL}/api/pages/{page_id}",
                headers=HEADERS,
                timeout=TIMEOUT
            )
            return resp.status_code == 200 or resp.status_code == 204

        # Delete pages
        for pid in page_ids:
            try:
                delete_page(pid)
            except Exception:
                pass

        # Delete folders
        for fid in folder_ids:
            try:
                delete_page(fid)
            except Exception:
                pass

test_page_navigation_performance_large_folder_structures()
