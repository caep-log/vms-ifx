import { Navigate, Outlet, useLocation } from 'react-router';
import { useAuth } from '../features/auth/authContext';
import Loading from '../shared/components/loading/loading';

export function PublicRoute() {
    const { status } = useAuth();

    if (status === 'checking') {
        return <Loading />;
    }

    if (status === 'authenticated') {
        return <Navigate to="/dashboard" replace />;
    }

    return <Outlet />;
}

export function PrivateRoute() {
    const { status } = useAuth();
    const location = useLocation();

    if (status === 'checking') {
        return <Loading />;
    }

    if (status !== 'authenticated') {
        return <Navigate to="/login" replace state={{ from: location }} />;
    }

    return <Outlet />;
}

export function AdminRoute() {
    const { isAdmin } = useAuth();

    if (!isAdmin) {
        return <Navigate to="/dashboard" replace />;
    }

    return <Outlet />;
}
