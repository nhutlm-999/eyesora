import {Route, Routes, BrowserRouter} from 'react-router-dom'
import AppLayout from "./shared/layout/AppLayout";
import AdminDashboard from "./features/dashboard/pages/Dashboard.jsx";
import FacilityDashboard from "./features/facility-dashboard/pages/FacilityDashboard.jsx";
import LoginPage from "./features/auth/page/LoginPage.jsx";
import PatientPage from "./features/patient/pages/PatientPage.jsx";
import FacilitiesPage from "./features/facility/pages/FacilitiesPage.jsx";
import FacilityFormPage from "./features/facility/pages/FacilityFormPage.jsx";
import CampaignsPage from "./features/campaign/pages/CampaignsPage.jsx";
import CampaignFormPage from './features/campaign/pages/CampaignFormPage';
import UsersPage from "./features/user/pages/UsersPage.jsx";
import UserFormPage from "./features/user/pages/UserFormPage.jsx";
import DistrictsPage from "./features/district/pages/DistrictsPage.jsx";
import DistrictFormPage from './features/district/pages/DistrictFormPage';
import WardsPage from "./features/ward/pages/WardsPage.jsx";
import WardsFormPage from "./features/ward/pages/WardsFormPage.jsx";
import PatientFormPage from "./features/patient/pages/PatientFormPage.jsx";
import ClassesPage from "./features/class/pages/ClassesPage";
import ClassFormPage from "./features/class/pages/ClassFormPage";
import ExamRecordPage from "./features/eye-exam-record/pages/ExamRecordPage.jsx";
import ExamRecordFormPage from "./features/eye-exam-record/pages/ExamRecordFormPage.jsx";
import ExamRecordImportPage from "./features/eye-exam-record/pages/ExamRecordImportPage.jsx";
import UserProfilePage from "./features/user/pages/UserProfilePage.jsx";
import ProtectedRoute from "./shared/components/ProtectedRoute.jsx";
import ExamRecordCreatePage from "./features/eye-exam-record/pages/ExamRecordCreatePage.jsx";
import ForgotPasswordPage from "./features/auth/page/ForgotPassword.jsx";
import ResetPasswordPage from "./features/auth/page/ResetPasswordPage.jsx";
import PatientDetailPage from "./features/patient/pages/PatientDetailsPage.jsx";

import { useEffect } from 'react';
import { useAuthStore } from './features/auth/store/authStore';

function App() {
    const { initAuth, isInitialized } = useAuthStore();

    useEffect(() => {
        initAuth();
    }, [initAuth]);

    if (!isInitialized) {
        return <div>Loading...</div>;
    }

    return (
        <BrowserRouter>
            <Routes>
                {/* Các trang không dùng chung giao diện Layout (Trang độc lập) */}
                <Route path="/login" element={<LoginPage/>}/>
                <Route path="/forgot-password" element={<ForgotPasswordPage/>}/>
                <Route path="/reset-password" element={<ResetPasswordPage/>}/>

                {/* TẤT CẢ các trang dưới đây đều dùng chung cấu trúc AppLayout (Có Header, SideBar) */}
                <Route element={<AppLayout />}>

                    {/* 1. Nhóm Route CHỈ DÀNH RIÊNG CHO ADMIN */}
                    <Route element={<ProtectedRoute allowedRoles={['ROLE_ADMIN']} />}>
                        <Route index element={<AdminDashboard/>}/> {/* path="/" */}
                        <Route path="/facilities" element={<FacilitiesPage/>}/>
                        <Route path="/facilities/create" element={<FacilityFormPage/>}/>
                        <Route path="/facilities/edit/:id" element={<FacilityFormPage/>}/>
                        <Route path="/campaigns" element={<CampaignsPage/>}/>
                        <Route path="/campaigns/create" element={<CampaignFormPage/>}/>
                        <Route path="/campaigns/edit/:id" element={<CampaignFormPage/>}/>
                        <Route path="/admin/users" element={<UsersPage/>}/>
                        <Route path="/admin/users/create" element={<UserFormPage/>}/>
                        <Route path="/users/edit/:id" element={<UserFormPage/>}/>
                        <Route path="/districts" element={<DistrictsPage/>}/>
                        <Route path="/districts/create" element={<DistrictFormPage/>}/>
                        <Route path="/districts/edit/:id" element={<DistrictFormPage/>}/>
                        <Route path="/wards" element={<WardsPage/>}/>
                        <Route path="/wards/create" element={<WardsFormPage/>}/>
                        <Route path="/wards/edit/:id" element={<WardsFormPage/>}/>
                    </Route>

                    {/* 2. Nhóm Route CHỈ DÀNH RIÊNG CHO FACILITY_ADMIN */}
                    <Route element={<ProtectedRoute allowedRoles={['ROLE_FACILITY_ADMIN']} />}>
                        <Route path="/facility-dashboard" element={<FacilityDashboard />} />
                    </Route>

                    {/* 3. Nhóm Route CHO ADMIN & FACILITY_ADMIN */}
                    <Route element={<ProtectedRoute allowedRoles={['ROLE_ADMIN', 'ROLE_FACILITY_ADMIN']} />}>
                        <Route path="/classes" element={<ClassesPage/>}/>
                        <Route path="/classes/create" element={<ClassFormPage/>}/>
                        <Route path="/classes/edit/:id" element={<ClassFormPage/>}/>
                    </Route>

                    {/* 4. Nhóm Route DÙNG CHUNG CHO CẢ 3 ROLES */}
                    <Route element={<ProtectedRoute allowedRoles={['ROLE_ADMIN', 'ROLE_FACILITY_ADMIN', 'ROLE_EXAMINER']} />}>
                        <Route path="/patients" element={<PatientPage/>}/>
                        <Route path="/patients/detail/:id" element={<PatientDetailPage/>}/>
                        <Route path="/patients/create" element={<PatientFormPage/>}/>
                        <Route path="/patients/edit/:id" element={<PatientFormPage/>}/>
                        <Route path="/eye-exam-records" element={<ExamRecordPage/>}/>
                        <Route path="/eye-exam-records/create" element={<ExamRecordCreatePage/>}/>
                        <Route path="/eye-exam-records/edit/:id" element={<ExamRecordFormPage/>}/>
                        <Route path="/eye-exam-records/import" element={<ExamRecordImportPage/>}/>
                        <Route path="/profile" element={<UserProfilePage/>}/>
                    </Route>
                </Route>

                {/*<Route element={<ProtectedRoute/>}>*/}
                {/*    <Route path="/" element={<AppLayout/>}>*/}
                {/*        <Route index element={<AdminDashboard/>}/>*/}
                {/*        <Route path="/facility-dashboard" element={<FacilityDashboard />} />*/}
                {/*        <Route path="/classes" element={<ClassesPage/>}/>*/}
                {/*        <Route path="/classes/create" element={<ClassFormPage/>}/>*/}
                {/*        <Route path="/classes/edit/:id" element={<ClassFormPage/>}/>*/}
                {/*        <Route path="/patients" element={<PatientPage/>}/>*/}
                {/*        <Route path="/patients/detail/:id" element={<PatientDetailPage/>}/>*/}
                {/*        <Route path="/patients/create" element={<PatientFormPage/>}/>*/}
                {/*        <Route path="/patients/edit/:id" element={<PatientFormPage/>}/>*/}
                {/*        <Route path="/facilities" element={<FacilitiesPage/>}/>*/}
                {/*        <Route path="/facilities/create" element={<FacilityFormPage/>}/>*/}
                {/*        <Route path="/facilities/edit/:id" element={<FacilityFormPage/>}/>*/}
                {/*        <Route path="/campaigns" element={<CampaignsPage/>}/>*/}
                {/*        <Route path="/campaigns/create" element={<CampaignFormPage/>}/>*/}
                {/*        <Route path="/campaigns/edit/:id" element={<CampaignFormPage/>}/>*/}
                {/*        <Route path="/admin/users" element={<UsersPage/>}/>*/}
                {/*        <Route path="/admin/users/create" element={<UserFormPage/>}/>*/}
                {/*        <Route path="/users/edit/:id" element={<UserFormPage/>}/>*/}
                {/*        <Route path="/districts" element={<DistrictsPage/>}/>*/}
                {/*        <Route path="/districts/create" element={<DistrictFormPage/>}/>*/}
                {/*        <Route path="/districts/edit/:id" element={<DistrictFormPage/>}/>*/}
                {/*        <Route path="/wards" element={<WardsPage/>}/>*/}
                {/*        <Route path="/wards/create" element={<WardsFormPage/>}/>*/}
                {/*        <Route path="/wards/edit/:id" element={<WardsFormPage/>}/>*/}
                {/*        <Route path="/eye-exam-records" element={<ExamRecordPage/>}/>*/}
                {/*        <Route path="/eye-exam-records/create" element={<ExamRecordCreatePage/>}/>*/}
                {/*        <Route path="/eye-exam-records/edit/:id" element={<ExamRecordFormPage/>}/>*/}
                {/*        <Route path="/eye-exam-records/import" element={<ExamRecordImportPage/>}/>*/}
                {/*        <Route path="/profile" element={<UserProfilePage/>}/>*/}

                {/*    </Route>*/}
                {/*</Route>*/}
            </Routes>
        </BrowserRouter>
    )
}

export default App