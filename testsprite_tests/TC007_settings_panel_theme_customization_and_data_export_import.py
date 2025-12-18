import requests
import json

BASE_URL = "http://localhost:3000"
AUTH_USERNAME = "recommendations@reply.pinterest.com"
AUTH_PASSWORD = "recommendations@reply.pinterest.com"
TIMEOUT = 30


def test_settings_panel_theme_customization_and_data_export_import():
    session = requests.Session()
    session.auth = (AUTH_USERNAME, AUTH_PASSWORD)
    headers = {"Content-Type": "application/json"}

    # 1) Theme Customization - Assume endpoint: /api/settings/theme (PUT to update, GET to retrieve)
    theme_endpoint = f"{BASE_URL}/api/settings/theme"

    # Define a sample theme customization payload
    theme_payload = {
        "themeName": "dark_mode_test",
        "colors": {
            "background": "#121212",
            "text": "#EEEEEE",
            "primary": "#BB86FC"
        },
        "font": "Roboto",
        "fontSize": 14
    }

    # Save current theme to restore later (use try-finally)
    original_theme = None
    try:
        # Get current theme to preserve original settings
        get_resp = session.get(theme_endpoint, headers=headers, timeout=TIMEOUT)
        assert get_resp.status_code == 200, f"GET theme failed with status {get_resp.status_code}"
        original_theme = get_resp.json()

        # Update theme with new customization
        put_resp = session.put(theme_endpoint, headers=headers, json=theme_payload, timeout=TIMEOUT)
        assert put_resp.status_code == 200, f"PUT theme failed with status {put_resp.status_code}"
        put_data = put_resp.json()
        assert put_data.get("themeName") == "dark_mode_test", "Theme name not updated correctly"
        assert put_data.get("colors", {}).get("background") == "#121212", "Background color not updated"
        assert put_data.get("font") == "Roboto", "Font not updated"

        # Retrieve theme after update to verify persistence
        get_after_resp = session.get(theme_endpoint, headers=headers, timeout=TIMEOUT)
        assert get_after_resp.status_code == 200, f"GET after update failed with status {get_after_resp.status_code}"
        theme_data_after = get_after_resp.json()
        assert theme_data_after == put_data, "Theme data mismatch after update"

        # 2) Data Export - Assume endpoint: /api/settings/export (GET)
        export_endpoint = f"{BASE_URL}/api/settings/export"
        export_resp = session.get(export_endpoint, headers=headers, timeout=TIMEOUT)
        assert export_resp.status_code == 200, f"Export failed with status {export_resp.status_code}"
        try:
            export_data = export_resp.json()
        except json.JSONDecodeError:
            assert False, "Exported data is not valid JSON"
        # Check for key user preferences in exported data
        assert "theme" in export_data, "Exported data missing 'theme' key"
        assert export_data["theme"].get("themeName") == put_data.get("themeName"), "Exported theme mismatch"

        # 3) Data Import - Assume endpoint: /api/settings/import (POST)
        import_endpoint = f"{BASE_URL}/api/settings/import"
        import_payload = export_data  # Import back the exported data

        import_resp = session.post(import_endpoint, headers=headers, json=import_payload, timeout=TIMEOUT)
        assert import_resp.status_code == 200, f"Import failed with status {import_resp.status_code}"
        import_result = import_resp.json()
        assert import_result.get("success") is True, "Import operation unsuccessful"

        # Verify that theme is restored as per imported data
        get_after_import_resp = session.get(theme_endpoint, headers=headers, timeout=TIMEOUT)
        assert get_after_import_resp.status_code == 200, f"GET after import failed with status {get_after_import_resp.status_code}"
        theme_after_import = get_after_import_resp.json()
        assert theme_after_import == import_payload.get("theme"), "Theme data mismatch after import"

    finally:
        # Restore original theme
        if original_theme is not None:
            session.put(theme_endpoint, headers=headers, json=original_theme, timeout=TIMEOUT)


test_settings_panel_theme_customization_and_data_export_import()