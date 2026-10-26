import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../../auth/store/authStore.js';
import AdminDashboardView from './AdminDashboardView.jsx';
import FacilityDashboardView from './FacilityDashboardView.jsx';

const Dashboard = () => {
    const roles = useAuthStore((s) => s.user?.roles) || [];

    if (roles.includes('ROLE_ADMIN')) {
        return <AdminDashboardView />;
    }

    if (roles.includes('ROLE_FACILITY_ADMIN')) {
        return <FacilityDashboardView />;
    }

    return <Navigate to="/patients" replace />;
};

export default Dashboard;
