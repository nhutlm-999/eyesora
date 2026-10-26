import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../../features/auth/store/authStore';

const ProtectedRoute = ({ allowedRoles }) => {
    const { user, isAuthenticated } = useAuthStore();
    const roles = user?.roles || [];

    if (!isAuthenticated || !user) {
        return <Navigate to="/login" replace />;
    }

    if (allowedRoles && !roles.some(role => allowedRoles.includes(role))) {
        if (roles.includes('ROLE_ADMIN') || roles.includes('ROLE_FACILITY_ADMIN')) return <Navigate to="/" replace />;
        if (roles.includes('ROLE_EXAMINER')) return <Navigate to="/patients" replace />;

        return <Navigate to="/login" replace />;
    }

    return <Outlet />;
};

export default ProtectedRoute;