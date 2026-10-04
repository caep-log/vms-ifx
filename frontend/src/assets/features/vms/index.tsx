import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { useAuth } from '../auth/authContext';
import Text from '../../shared/components/text/text';
import { apiClient } from '../../infrastructure/http/apiClient';
import Table from '../../shared/components/table/table';
import './style.scss';

interface Vm {
    [key: string]: unknown;
    id: string;
    name: string;
    cores: number;
    ram: number;
    disk: number;
    os: string;
    status: string;
}

export default function VmsList() {
    const { isAdmin } = useAuth();
    const navigate = useNavigate();
    const [vms, setVms] = useState<Vm[]>([]);
    const [error, setError] = useState('');

    useEffect(() => {
        let cancelled = false;

        apiClient.get<Vm[]>('/api/vms')
            .then((response) => {
                if (!cancelled) setVms(response);
            })
            .catch(() => {
                if (!cancelled) setError('No fue posible cargar las máquinas virtuales.');
            });

        return () => { cancelled = true; };
    }, []);

    const handleDelete = async (id: string) => {
        if (!window.confirm('¿Deseas eliminar esta máquina virtual?')) return;

        try {
            await apiClient.delete<void>(`/api/vms/${id}`);
            setVms((current) => current.filter((vm) => vm.id !== id));
        } catch {
            setError('No fue posible eliminar la máquina virtual.');
        }
    };

    return (
        <section className="vms-page">
            <div className="header-section-with-action">
                <div>
                    <Text type="title" text="Virtual machines" />
                    <Text type="subtitle" text="Manage the virtual resources of your environment." />
                </div>
                {isAdmin && <Link className="vms-create-link" to="/vms/new">+ Crear VM</Link>}
            </div>
            {error && <p role="alert">{error}</p>}
            <Table
                title="Inventario"
                columns={[
                    { title: 'Name', field: 'name' },
                    { title: 'Operative System', field: 'os' },
                    { title: 'Cores', field: 'cores' },
                    { title: 'RAM (GB)', field: 'ram' },
                    { title: 'Disk (GB)', field: 'disk' },
                    { title: 'Status', field: 'status' },
                ]}
                data={vms}
                editRowFunction={isAdmin ? (vm) => navigate(`/vms/${vm.id}/edit`, { state: { vm } }) : null}
                deleteRowFunction={isAdmin ? (id) => handleDelete(String(id)) : null}
            />
        </section>
    );
}
