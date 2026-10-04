import { useEffect, useMemo, useState } from 'react';
import { apiClient } from '../../../infrastructure/http/apiClient';
// import Chart from 'chart.js/auto';

interface Vm {
    id: string;
    name: string;
    cores: number;
    ram: number;
    disk: number;
    os: string;
    status: string;
}

function BentoGrid() {
    const [vms, setVms] = useState<Vm[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        const controller = new AbortController();

        apiClient.get<Vm[]>('/api/vms', { signal: controller.signal })
            .then(setVms)
            .catch((requestError: unknown) => {
                if (!(requestError instanceof DOMException && requestError.name === 'AbortError')) {
                    setError(true);
                }
            })
            .finally(() => setLoading(false));

        return () => controller.abort();
    }, []);

    const metrics = useMemo(() => {
        const active = vms.filter((vm) => vm.status.toLowerCase() === 'active').length;

        return {
            active,
            totalCores: vms.reduce((total, vm) => total + vm.cores, 0),
            totalRam: vms.reduce((total, vm) => total + vm.ram, 0),
            totalDisk: vms.reduce((total, vm) => total + vm.disk, 0),
            latest: vms.at(-1),
        };
    }, [vms]);

    if (loading) {
        return <div className="dashboard-state">Cargando mÃ¡quinas virtuales...</div>;
    }

    if (error) {
        return <div className="dashboard-state dashboard-state--error">No se pudieron cargar las mÃ¡quinas virtuales.</div>;
    }

    return (
        <div className="grid">
            <div className="item item-0">
                <span>Total VMs</span>
                <strong>{vms.length}</strong>
            </div>
            <div className="item item-1">
                <span>VM Registry</span>
                <strong>{metrics.latest?.name ?? 'Sin registros'}</strong>
                <small>{metrics.latest?.os ?? 'No hay mÃ¡quinas virtuales'}</small>
            </div>
            <div className="item item-2">
                <span>Active</span>
                <strong>{metrics.active}</strong>
            </div>
            <div className="item item-4">
                <span>vCPU</span>
                <strong>{metrics.totalCores}</strong>
            </div>
            <div className="item item-5">
                <span>RAM</span>
                <strong>{metrics.totalRam} GB</strong>
            </div>
            <div className="item item-6">
                <span>Disc</span>
                <strong>{metrics.totalDisk} GB</strong>
            </div>
            <div className="item item-7">
                <span>State</span>
                <strong>{vms.length ? `${metrics.active} activas` : 'Sin datos'}</strong>
            </div>
        </div>
    );
};

export default BentoGrid;
