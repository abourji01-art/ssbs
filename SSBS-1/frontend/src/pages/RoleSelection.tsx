// ── Deprecated — kept for backwards compatibility ──
// Role selection is no longer needed. All users authenticate via 42 OAuth
// and their role is determined by backend.

import { Navigate } from 'react-router-dom';

const RoleSelection = () => <Navigate to="/" replace />;
export default RoleSelection;
