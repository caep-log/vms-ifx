import { Navigate, Outlet } from 'react-router';
import { AuthProvider, useAuth } from '../features/auth/authContext';
import Login from '../features/public';
import Dashboard from '../features/dashboard';
import VmsList from '../features/vms';
import VmsForm from '../features/vms/form';
import NotFound from '../features/notFound';
import AuthenticatedLayout from './authenticatedLayout';
import { AdminRoute, PrivateRoute, PublicRoute } from './guards';

function HomeRedirect() {
    const { status } = useAuth();

    return (
        <Navigate
            to={status === 'authenticated' ? '/dashboard' : '/login'}
            replace
        />
    );
}

export const routes = [
    {
        element: (
            <AuthProvider>
                <Outlet />
            </AuthProvider>
        ),
        children: [
            {
                element: <PublicRoute />,
                children: [
                    { path: '/', element: <HomeRedirect /> },
                    { path: '/login', element: <Login /> },
                ],
            },
            {
                element: <PrivateRoute />,
                children: [
                    {
                        element: <AuthenticatedLayout />,
                        children: [
                            { path: '/dashboard', element: <Dashboard /> },
                            { path: '/vms', element: <VmsList /> },
                            {
                                element: <AdminRoute />,
                                children: [
                                    { path: '/vms/new', element: <VmsForm /> },
                                    { path: '/vms/:id/edit', element: <VmsForm /> },
                                ],
                            },
                            { path: '*', element: <NotFound /> },
                        ],
                    },
                ],
            },
        ],
    },
];
