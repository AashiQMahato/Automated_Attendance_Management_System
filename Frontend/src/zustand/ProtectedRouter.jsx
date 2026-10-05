import { Navigate, useLocation } from 'react-router-dom';
import store from './loginStore';

const ProtectedRouter = ({ children, allowedRoles }) => {
    const location = useLocation();
    const { isLogin, loginUserData } = store(state => ({
        isLogin: state.isLogin,
        loginUserData: state.loginUserData
    }));

    // Check if we have required data
    if (!isLogin || !loginUserData?.role) {
        return <Navigate to="/login" state={{ from: location.pathname }} replace />;
    }

    // Check role permissions
    if (!allowedRoles.includes(loginUserData.role)) {
        const redirectPath = loginUserData.role === 'Teacher' 
            ? '/teacherdashboard' 
            : '/studentdashboard';
        return <Navigate to={redirectPath} replace />;
    }

    return children;
};

export default ProtectedRouter;