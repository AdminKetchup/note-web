import requests
from requests.auth import HTTPBasicAuth

def test_tc005_get_api_ai_stream_continuous_streaming():
    base_url = "http://localhost:3000"
    endpoint = "/api/ai/stream"
    url = base_url + endpoint
    auth = HTTPBasicAuth("recommendations@reply.pinterest.com", "recommendations@reply.pinterest.com")
    headers = {
        "Accept": "text/event-stream",
    }
    timeout_seconds = 30

    payload = {
        "model": "google/gemini-3.0-pro",
        "messages": [{"role": "user", "content": "Hello"}]
    }
    
    try:
        with requests.post(url, json=payload, headers=headers, auth=auth, stream=True, timeout=timeout_seconds) as response:
            # Validate response status
            assert response.status_code == 200, f"Expected status 200, got {response.status_code}"

            # Ensure response is chunked streaming
            assert response.headers.get("Content-Type") in ("text/event-stream", "application/octet-stream"), \
                f"Unexpected Content-Type: {response.headers.get('Content-Type')}"

            chunk_count = 0
            max_chunks_to_check = 5
            # Read streaming data chunks to verify continuous flow without premature disconnect
            for chunk in response.iter_content(chunk_size=None, decode_unicode=True):
                if chunk:
                    chunk_count += 1
                    # Check that content chunks are not empty strings or just whitespace
                    assert chunk.strip() != "", "Received empty chunk indicating potential premature disconnect"
                # Stop after checking a few chunks to avoid long test duration
                if chunk_count >= max_chunks_to_check:
                    break

            assert chunk_count > 0, "No data chunks received from stream, streaming may be broken"

    except requests.exceptions.Timeout:
        assert False, "Request timed out prematurely, streaming endpoint not maintaining continuous streaming"
    except requests.exceptions.RequestException as e:
        assert False, f"Request error occurred: {e}"

test_tc005_get_api_ai_stream_continuous_streaming()