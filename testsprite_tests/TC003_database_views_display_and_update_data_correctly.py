import requests
from requests.auth import HTTPBasicAuth
import time

BASE_URL = "http://localhost:3000"
AUTH = HTTPBasicAuth("recommendations@reply.pinterest.com", "recommendations@reply.pinterest.com")
HEADERS = {"Content-Type": "application/json"}
TIMEOUT = 30

def test_TC003_database_views_display_and_update():
    """
    Validate that all database views (board, calendar, gallery, list, timeline, chart)
    display data accurately and update in real-time with proper input validation such as dates and tags.
    """
    # Define views and their sample payloads for update testing
    views = {
        "board": {
            "viewType": "board",
            "data": {
                "title": "Test Board View",
                "items": [{"id": "item1", "content": "Test Content"}],
                "tags": ["tag1", "tag2"]
            },
            "updatePayload": {
                "title": "Updated Board View",
                "items": [{"id": "item1", "content": "Updated Content"}],
                "tags": ["tag1", "tag3"]
            }
        },
        "calendar": {
            "viewType": "calendar",
            "data": {
                "title": "Test Calendar View",
                "events": [
                    {"id": "event1", "date": "2025-12-20", "description": "Initial Event"}
                ],
                "tags": ["holiday"]
            },
            "updatePayload": {
                "title": "Updated Calendar View",
                "events": [
                    {"id": "event1", "date": "2025-12-21", "description": "Updated Event"}
                ],
                "tags": ["holiday", "urgent"]
            }
        },
        "gallery": {
            "viewType": "gallery",
            "data": {
                "title": "Test Gallery View",
                "images": [{"id": "img1", "url": "http://example.com/img1.jpg", "tags": ["cat"]}]
            },
            "updatePayload": {
                "title": "Updated Gallery View",
                "images": [{"id": "img1", "url": "http://example.com/img1_updated.jpg", "tags": ["cat", "cute"]}]
            }
        },
        "list": {
            "viewType": "list",
            "data": {
                "title": "Test List View",
                "items": [{"id": "list1", "text": "Item 1", "tags": ["todo"]}]
            },
            "updatePayload": {
                "title": "Updated List View",
                "items": [{"id": "list1", "text": "Updated Item 1", "tags": ["todo", "done"]}]
            }
        },
        "timeline": {
            "viewType": "timeline",
            "data": {
                "title": "Test Timeline View",
                "periods": [{"id": "period1", "start": "2025-12-01", "end": "2025-12-10", "description": "Initial Period"}]
            },
            "updatePayload": {
                "title": "Updated Timeline View",
                "periods": [{"id": "period1", "start": "2025-12-02", "end": "2025-12-11", "description": "Updated Period"}]
            }
        },
        "chart": {
            "viewType": "chart",
            "data": {
                "title": "Test Chart View",
                "dataPoints": [{"id": "dp1", "label": "Jan", "value": 10}],
                "tags": ["finance"]
            },
            "updatePayload": {
                "title": "Updated Chart View",
                "dataPoints": [{"id": "dp1", "label": "Jan", "value": 15}],
                "tags": ["finance", "Q1"]
            }
        }
    }

    created_view_ids = []

    try:
        for view_key, view_info in views.items():
            # Create new view resource for the test
            create_payload = {
                "type": view_info["viewType"],
                "title": view_info["data"]["title"],
                "content": view_info["data"],  # Assuming API accepts 'content' field for view data
            }
            resp_create = requests.post(
                f"{BASE_URL}/api/views",
                json=create_payload,
                headers=HEADERS,
                auth=AUTH,
                timeout=TIMEOUT,
            )
            assert resp_create.status_code == 201, f"Create {view_key} view failed: {resp_create.status_code}, {resp_create.text}"
            resp_json = resp_create.json()
            # Assume created resource returns 'id'
            view_id = resp_json.get("id")
            assert view_id, f"{view_key} view creation response missing id"
            created_view_ids.append(view_id)

            # GET the view to validate data accuracy
            resp_get = requests.get(
                f"{BASE_URL}/api/views/{view_id}",
                headers=HEADERS,
                auth=AUTH,
                timeout=TIMEOUT,
            )
            assert resp_get.status_code == 200, f"GET {view_key} view failed: {resp_get.status_code}"
            data_get = resp_get.json()
            # Validate key fields and tags presence and correctness
            assert data_get.get("title") == view_info["data"]["title"], f"{view_key} title mismatch"
            # Validate at least tags and content keys are correct in response
            # Assuming content structure is returned in 'content' key
            content = data_get.get("content")
            assert content is not None, f"{view_key} content missing"
            if "tags" in view_info["data"]:
                assert set(content.get("tags", [])) == set(view_info["data"]["tags"]), f"{view_key} tags mismatch"

            # Validate input validation: send invalid date for calendar and timeline views and expect 400
            if view_key in ("calendar", "timeline"):
                invalid_payload = {"title": "Invalid Date Test"}
                if view_key == "calendar":
                    invalid_payload["content"] = {
                        "events": [{"id": "evInvalid", "date": "2025-13-40", "description": "Invalid Date"}]
                    }
                elif view_key == "timeline":
                    invalid_payload["content"] = {
                        "periods": [{"id": "prInvalid", "start": "2025-12-32", "end": "2025-12-31", "description": "Invalid Start"}]
                    }
                resp_invalid_update = requests.put(
                    f"{BASE_URL}/api/views/{view_id}",
                    json=invalid_payload,
                    headers=HEADERS,
                    auth=AUTH,
                    timeout=TIMEOUT,
                )
                assert resp_invalid_update.status_code == 400, f"{view_key} invalid date not rejected"

            # Validate update real-time and correct input validation with proper payload
            update_payload = {
                "title": view_info["updatePayload"]["title"],
                "content": view_info["updatePayload"],
            }
            resp_update = requests.put(
                f"{BASE_URL}/api/views/{view_id}",
                json=update_payload,
                headers=HEADERS,
                auth=AUTH,
                timeout=TIMEOUT,
            )
            assert resp_update.status_code == 200, f"Update {view_key} view failed: {resp_update.status_code}"

            # Immediately GET updated view and verify changes
            resp_get_updated = requests.get(
                f"{BASE_URL}/api/views/{view_id}",
                headers=HEADERS,
                auth=AUTH,
                timeout=TIMEOUT,
            )
            assert resp_get_updated.status_code == 200, f"GET updated {view_key} view failed"
            data_updated = resp_get_updated.json()
            assert data_updated.get("title") == update_payload["title"], f"{view_key} title not updated"
            content_updated = data_updated.get("content")
            assert content_updated is not None, f"{view_key} content missing after update"
            # Validate tags correctness if applicable
            if "tags" in view_info["updatePayload"]:
                assert set(content_updated.get("tags", [])) == set(view_info["updatePayload"]["tags"]), f"{view_key} tags not updated correctly"

            # Validate tags field type and content correctness
            if "tags" in view_info["updatePayload"]:
                tags = content_updated.get("tags")
                assert isinstance(tags, list), f"{view_key} tags not a list"
                for tag in tags:
                    assert isinstance(tag, str), f"{view_key} tag is not string"

    finally:
        # Cleanup: delete created views
        for vid in created_view_ids:
            try:
                resp_del = requests.delete(
                    f"{BASE_URL}/api/views/{vid}",
                    headers=HEADERS,
                    auth=AUTH,
                    timeout=TIMEOUT,
                )
                assert resp_del.status_code in (200, 204), f"Failed to delete view {vid}"
            except Exception:
                pass

test_TC003_database_views_display_and_update()