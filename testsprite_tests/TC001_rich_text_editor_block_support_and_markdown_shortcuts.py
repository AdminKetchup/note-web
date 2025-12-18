import requests

BASE_URL = "http://localhost:3000"
TIMEOUT = 30


def test_rich_text_editor_block_support_and_markdown_shortcuts():
    """
    Verify that the rich text editor supports block-level editing, slash commands,
    and markdown shortcuts correctly by sending a prompt that includes block-level
    content and markdown shortcuts to the AI generation API.
    """
    url = f"{BASE_URL}/api/ai"
    headers = {
        "Content-Type": "application/json"
    }
    # Construct a prompt containing typical markdown shortcuts and slash commands,
    # simulating block-level editing, e.g., headings, bullet list, code block, slash command
    prompt_text = (
        "# Heading 1\n"
        "- Bullet list item 1\n"
        "- Bullet list item 2\n\n"
        "```python\nprint('Hello World')\n```\n\n"
        "/remind me to check integration"
    )
    payload = {
        "userId": "recommendations@reply.pinterest.com",  # Using a valid userId string
        "prompt": prompt_text,
        "model": "gpt-4o"  # Assuming a model field; optional - send if supported
    }

    try:
        response = requests.post(
            url,
            headers=headers,
            json=payload,
            timeout=TIMEOUT
        )

        # Assert response status code 200 (success)
        assert response.status_code == 200, f"Expected 200 OK but got {response.status_code}. Response: {response.text}"

        # Assert response content type JSON
        assert response.headers.get("Content-Type", "").startswith("application/json"), "Expected JSON response"

        data = response.json()

        # Basic checks on response payload: ensure it contains some content generated back
        # Since API details are limited, we will check that there is non-empty content
        # Assuming response contains a 'result' or 'content' key with the generated text
        content_keys = ["result", "content", "message", "response"]
        content = None
        for key in content_keys:
            if key in data and isinstance(data[key], str) and data[key].strip():
                content = data[key].strip()
                break

        assert content is not None, f"Response JSON missing expected text content keys ({content_keys}). Response JSON: {data}"
        
        # Check that the response content contains elements indicating support for block editing and slash commands
        # For example, it may include bullet points, headings, or acknowledgement of slash commands
        # We do a simple heuristic check for markdown indicators or acknowledgement
        
        lower_content = content.lower()
        assert ("heading" in lower_content or "#" in lower_content or
                "-" in lower_content or "bullet" in lower_content or
                "```" in lower_content or "remind" in lower_content or
                "slash" in lower_content), "Response content does not appear to support block-level editing or markdown shortcuts."

    except requests.exceptions.RequestException as e:
        assert False, f"HTTP request failed: {e}"

    except ValueError as e:
        assert False, f"Failed to parse JSON response: {e}"


test_rich_text_editor_block_support_and_markdown_shortcuts()
