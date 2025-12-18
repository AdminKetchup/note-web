import requests

BASE_URL = "http://localhost:3000"
TIMEOUT = 30

def test_tc004_ai_assistant_integration_and_response_accuracy():
    """
    Test that AI assistant features integrate smoothly within the editor and workspace,
    responding accurately to user queries and content generation requests without workflow disruption.
    """

    headers = {
        "Content-Type": "application/json"
    }

    # Prepare a typical prompt payload for AI generation including userId
    payload = {
        "userId": "recommendations@reply.pinterest.com",
        "prompt": "Write a short summary about Next.js AI Content Generation Platform.",
        "model": "gpt-4o-mini",
        "messages": [
            {"role": "user", "content": "Summarize the Next.js AI platform in 3 sentences."}
        ]
    }

    try:
        # Send POST request to /api/ai to generate AI content
        response = requests.post(
            f"{BASE_URL}/api/ai",
            json=payload,
            headers=headers,
            timeout=TIMEOUT
        )

        # Basic response validations
        assert response.status_code == 200, f"Expected status 200, got {response.status_code}"
        json_resp = response.json()
        # Check that the response contains generated content (key name depends on API output; assume 'content' or 'result')
        content_keys = ['content', 'result', 'text', 'message']
        matched_key = next((k for k in content_keys if k in json_resp), None)
        assert matched_key is not None, "Response JSON does not contain expected content keys"

        generated_text = json_resp[matched_key]
        assert isinstance(generated_text, str) and len(generated_text) > 0, "Generated content is empty or invalid"

        # Additional validation: content relevance - check some keywords presence (basic semantic check)
        keywords = ["Next.js", "AI", "content", "platform"]
        lower_text = generated_text.lower()
        assert all(kw.lower() in lower_text for kw in keywords), "Generated text does not mention all expected keywords"

    except requests.exceptions.Timeout:
        assert False, "Request timed out"
    except requests.exceptions.RequestException as e:
        assert False, f"Request failed: {str(e)}"

test_tc004_ai_assistant_integration_and_response_accuracy()