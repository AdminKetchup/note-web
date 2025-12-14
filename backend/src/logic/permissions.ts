import { query } from '../db';

type Action = 'READ' | 'WRITE' | 'SHARE' | 'DELETE';
type Role = 'OWNER' | 'EDITOR' | 'VIEWER' | 'GUEST' | 'NONE';

export async function checkPermission(userId: string | null, pageId: string, action: Action): Promise<boolean> {
    // 1. Fetch Page
    const pageResult = await query('SELECT * FROM pages WHERE id = $1', [pageId]);
    if (pageResult.rows.length === 0) return false;
    const page = pageResult.rows[0];

    let effectiveRole: Role = 'NONE';

    // 2. Check explicit permission if user is logged in
    if (userId) {
        if (page.owner_id === userId) {
            effectiveRole = 'OWNER';
        } else {
            const permResult = await query(
                'SELECT role FROM page_permissions WHERE page_id = $1 AND user_id = $2',
                [pageId, userId]
            );
            if (permResult.rows.length > 0) {
                effectiveRole = permResult.rows[0].role;
            }
        }
    }

    // 3. Check General Access (Public)
    if (page.general_access_level === 'PUBLIC') {
        const publicRole = page.general_access_role as Role;
        effectiveRole = getHigherRole(effectiveRole, publicRole);
    }

    // 4. Validate Action
    switch (action) {
        case 'DELETE':
            return effectiveRole === 'OWNER';
        case 'SHARE':
            return effectiveRole === 'OWNER';
        case 'WRITE':
            return ['OWNER', 'EDITOR'].includes(effectiveRole);
        case 'READ':
            return ['OWNER', 'EDITOR', 'VIEWER', 'GUEST'].includes(effectiveRole);
        default:
            return false;
    }
}

function getHigherRole(role1: Role, role2: Role): Role {
    const hierarchy: Role[] = ['NONE', 'GUEST', 'VIEWER', 'EDITOR', 'OWNER'];
    const idx1 = hierarchy.indexOf(role1);
    const idx2 = hierarchy.indexOf(role2);
    return idx1 > idx2 ? role1 : role2;
}
