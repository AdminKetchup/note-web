import requests
from requests.auth import HTTPBasicAuth
import time

BASE_URL = "http://localhost:3000"
AUTH = HTTPBasicAuth("recommendations@reply.pinterest.com", "recommendations@reply.pinterest.com")
HEADERS = {"Content-Type": "application/json"}
TIMEOUT = 30

def test_invitations_api_updates_firestore_state_correctly():
    invitation_id = None
    workspace_id = None
    inviter_user_id = "user_inviter_123"
    invitee_email = "invitee@example.com"
    invitee_user_id = None
    # Step 1: Create a workspace
    try:
        workspace_payload = {
            "name": "Test Workspace for Invitations",
            "ownerId": inviter_user_id
        }
        r_ws = requests.post(f"{BASE_URL}/api/workspaces", auth=AUTH, json=workspace_payload, headers=HEADERS, timeout=TIMEOUT)
        assert r_ws.status_code == 201, f"Failed to create workspace: {r_ws.text}"
        workspace_data = r_ws.json()
        workspace_id = workspace_data.get("id")
        assert workspace_id, "Workspace ID not returned"

        # Step 2: Send invitation to invitee via Invitations API
        invitation_payload = {
            "workspaceId": workspace_id,
            "email": invitee_email
        }
        r_invite = requests.post(f"{BASE_URL}/api/invitations", auth=AUTH, json=invitation_payload, headers=HEADERS, timeout=TIMEOUT)
        assert r_invite.status_code == 201, f"Failed to send invitation: {r_invite.text}"
        invitation_data = r_invite.json()
        invitation_id = invitation_data.get("id")
        assert invitation_id, "Invitation ID not returned"
        assert invitation_data.get("email") == invitee_email
        assert invitation_data.get("workspaceId") == workspace_id
        assert invitation_data.get("status") == "pending"

        # Simulate retrieving invitee user ID somehow (in real scenario might come from invitee user creation or lookup)
        # For testing, assume invitee_user_id is known or created prior
        # Here, for simulation, create invitee user:
        invitee_user_payload = {
            "email": invitee_email,
            "name": "Invitee User"
        }
        r_invitee_user = requests.post(f"{BASE_URL}/api/users", auth=AUTH, json=invitee_user_payload, headers=HEADERS, timeout=TIMEOUT)
        assert r_invitee_user.status_code == 201, f"Failed to create invitee user: {r_invitee_user.text}"
        invitee_user = r_invitee_user.json()
        invitee_user_id = invitee_user.get("id")
        assert invitee_user_id, "Invitee User ID not returned"

        # Step 3: Accept the invitation as the invitee
        accept_payload = {
            "invitationId": invitation_id,
            "userId": invitee_user_id
        }
        r_accept = requests.post(f"{BASE_URL}/api/invitations/accept", auth=AUTH, json=accept_payload, headers=HEADERS, timeout=TIMEOUT)
        assert r_accept.status_code == 200, f"Failed to accept invitation: {r_accept.text}"
        accept_response = r_accept.json()
        assert accept_response.get("status") == "accepted"

        # Step 4: Verify Firestore state - verify invitee is a member of the workspace with correct permissions
        # Typically we'd call an API or DB to verify - assume there is an endpoint to get workspace members:
        r_members = requests.get(f"{BASE_URL}/api/workspaces/{workspace_id}/members", auth=AUTH, headers=HEADERS, timeout=TIMEOUT)
        assert r_members.status_code == 200, f"Failed to get workspace members: {r_members.text}"
        members = r_members.json()
        member_ids = [m.get("userId") for m in members]
        assert invitee_user_id in member_ids, "Invitee user is not a member of the workspace after acceptance"

        # Verify permissions for invitee user
        invitee_member = next((m for m in members if m.get("userId") == invitee_user_id), None)
        assert invitee_member is not None, "Invitee member record not found in workspace"
        permissions = invitee_member.get("permissions")
        assert permissions is not None, "Permissions not set for invitee"
        assert "read" in permissions or "write" in permissions or "admin" in permissions, "Invitee permissions are insufficient"

    finally:
        # Cleanup: delete invitation, invitee user, workspace
        if invitation_id:
            requests.delete(f"{BASE_URL}/api/invitations/{invitation_id}", auth=AUTH, headers=HEADERS, timeout=TIMEOUT)
        if invitee_user_id:
            requests.delete(f"{BASE_URL}/api/users/{invitee_user_id}", auth=AUTH, headers=HEADERS, timeout=TIMEOUT)
        if workspace_id:
            requests.delete(f"{BASE_URL}/api/workspaces/{workspace_id}", auth=AUTH, headers=HEADERS, timeout=TIMEOUT)

test_invitations_api_updates_firestore_state_correctly()