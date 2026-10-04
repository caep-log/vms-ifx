import { NavLink, Outlet, useNavigate } from 'react-router';
import { ChartNoAxesCombined, LogOut, Monitor, Plus, Settings, Trash2, User } from 'lucide-react';
import { useAuth } from '../features/auth/authContext';
import Button from '../shared/components/button/button';
import Text from '../shared/components/text/text';

export default function AuthenticatedLayout() {
    const { user, isAdmin, logout, deleteAccount } = useAuth();
    const navigate = useNavigate();
    const username = user?.name || user?.email || user?.role || 'Usuario';

    const handleLogout = async () => {
        await logout();
        navigate('/login', { replace: true });
    };

    const handleDeleteUser = async () => {
        if (!window.confirm('¿Deseas eliminar tu usuario?')) return;
        await deleteAccount();
        navigate('/login', { replace: true });
    };

    return (
        <div className="ifx-authenticated-layout">
            <header>
                <div className="brand-mark">
                    <div className="brand-icon">IFX</div>
                    <div><strong>IFX Networks</strong><span>Virtual manager</span></div>
                </div>

                <div className="user-info">
                    <div className="pic-profile"><User size={20} /></div>
                    <div><Text type="text" text={username} /><Text type="small" text={isAdmin ? 'Administrator' : 'Client'} /></div>
                </div>

                <nav className="navigation-list" aria-label="Navegación principal">
                    <NavLink to="/dashboard"><ChartNoAxesCombined size={18} /><span>Dashboard</span></NavLink>
                    <NavLink to="/vms"><Monitor size={18} /><span>Virtual machines</span></NavLink>
                    {isAdmin && <NavLink to="/vms/new"><Plus size={18} /><span>New machine</span></NavLink>}
                </nav>

                <div className="sidebar-footer">
                    <div className="sidebar-footer-label"><Settings size={16} /><span>Account</span></div>
                    <Button text="Eliminar usuario" icon={<Trash2 size={16} />} customClass="danger" onClick={handleDeleteUser} />
                    <Button text="Cerrar sesión" icon={<LogOut size={16} />} customClass="secondary" onClick={handleLogout} />
                </div>
            </header>
            <main><Outlet /></main>
        </div>
    );
}
