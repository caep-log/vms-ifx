import { NavLink, Outlet } from 'react-router';
import { useAuth } from '../features/auth/authContext';
import Button from '../shared/components/button/button';
import Text from '../shared/components/text/text';
import { User } from 'lucide-react';

export default function AuthenticatedLayout() {
    const { user, isAdmin } = useAuth();
    const username = user?.name || user?.email || user?.role || 'Usuario';

    return (
        <div className="ifx-authenticated-layout">
            <header>
                <div className="user-info">
                    <div className="pic-profile">
                        <User />
                    </div>
                    <Text type='span' text={username} />
                </div>
                <nav className="navigation-list" aria-label="Navegación principal">
                    <NavLink to="/dashboard">Dashboard</NavLink>{' '}
                    <NavLink to="/vms">VMs</NavLink>
                    {isAdmin && (
                        <NavLink to="/vms/new">Nueva VM</NavLink>
                    )}
                </nav>
                <Button text="Log out" />
            </header>
            <main>
                <Outlet />
            </main>
        </div>
    );
};
