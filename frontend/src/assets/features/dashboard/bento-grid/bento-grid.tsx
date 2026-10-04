import { useEffect, useMemo, useRef, useState } from 'react';
import Chart from 'chart.js/auto';
import { apiClient } from '../../../infrastructure/http/apiClient';
import Skeleton from '../../../shared/components/skeleton/skeleton';
import '../style.scss';

interface Vm {
    id: string;
    name: string;
    cores: number;
    ram: number;
    disk: number;
    os: string;
    status: string;
}

// Límites actuales del entorno. Para uso mensual real se necesita historial en backend.
const CAPACITY = { vms: 20, cores: 100, ram: 512, disk: 4096 };

function BentoGrid() {
    const [vms, setVms] = useState<Vm[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const chartRef = useRef<HTMLCanvasElement>(null);
    const resourceChartRef = useRef<HTMLCanvasElement>(null);
    const capacityChartRef = useRef<HTMLCanvasElement>(null);
    const totalVmsChartRef = useRef<HTMLCanvasElement>(null);
    const activeVmsChartRef = useRef<HTMLCanvasElement>(null);
    const vcpuChartRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const controller = new AbortController();

        apiClient.get<Vm[]>('/api/vms', { signal: controller.signal })
            .then(setVms)
            .catch((requestError: unknown) => {
                if (!(requestError instanceof DOMException && requestError.name === 'AbortError')) setError(true);
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

    useEffect(() => {
        if (loading || error || vms.length === 0) return;

        const systems = vms.reduce<Record<string, number>>((counts, vm) => {
            counts[vm.os] = (counts[vm.os] ?? 0) + 1;
            return counts;
        }, {});

        const chart = chartRef.current ? new Chart(chartRef.current, {
            type: 'doughnut',
            data: {
                labels: Object.keys(systems),
                datasets: [{
                    data: Object.values(systems),
                    backgroundColor: ['#B6FF00', '#39FF14', '#7CFFCB', '#7FAF00'],
                    borderColor: '#101812',
                    borderWidth: 4,
                }],
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: { color: '#c2c9c4', padding: 16, usePointStyle: true },
                    },
                },
            },
        }) : null;

        const resourceChart = resourceChartRef.current ? new Chart(resourceChartRef.current, {
            type: 'bar',
            data: {
                labels: vms.map((vm) => vm.name),
                datasets: [
                    { label: 'Cores', data: vms.map((vm) => vm.cores), backgroundColor: '#B6FF00', borderRadius: 6 },
                    { label: 'RAM', data: vms.map((vm) => vm.ram), backgroundColor: '#39FF14', borderRadius: 6 },
                    { label: 'Disco', data: vms.map((vm) => vm.disk), backgroundColor: '#7CFFCB', borderRadius: 6 },
                ],
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: { ticks: { color: '#9BAAA0' }, grid: { display: false } },
                    y: { ticks: { color: '#9BAAA0' }, grid: { color: '#26352A' } },
                },
                plugins: {
                    legend: { labels: { color: '#c2c9c4', usePointStyle: true } },
                },
            },
        }) : null;

        const capacityChart = capacityChartRef.current ? new Chart(capacityChartRef.current, {
            type: 'bar',
            data: {
                labels: ['VMs', 'vCPU', 'RAM', 'Disco'],
                datasets: [{
                    label: 'Capacidad alcanzada (%)',
                    data: [
                        Math.min((vms.length / CAPACITY.vms) * 100, 100),
                        Math.min((metrics.totalCores / CAPACITY.cores) * 100, 100),
                        Math.min((metrics.totalRam / CAPACITY.ram) * 100, 100),
                        Math.min((metrics.totalDisk / CAPACITY.disk) * 100, 100),
                    ],
                    backgroundColor: ['#B6FF00', '#39FF14', '#7CFFCB', '#7FAF00'],
                    borderRadius: 6,
                }],
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: { min: 0, max: 100, ticks: { color: '#9BAAA0', callback: (value) => `${value}%` }, grid: { color: '#26352A' } },
                    x: { ticks: { color: '#9BAAA0' }, grid: { display: false } },
                },
                plugins: { legend: { labels: { color: '#c2c9c4', usePointStyle: true } } },
            },
        }) : null;

        const doughnutOptions = {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '72%',
            plugins: { legend: { display: false } },
        } as const;

        const totalVmsChart = totalVmsChartRef.current ? new Chart(totalVmsChartRef.current, {
            type: 'doughnut',
            data: {
                labels: ['Utilizadas', 'Disponibles'],
                datasets: [{ data: [vms.length, Math.max(CAPACITY.vms - vms.length, 0)], backgroundColor: ['#B6FF00', '#26352A'], borderWidth: 0 }],
            },
            options: doughnutOptions,
        }) : null;

        const activeVmsChart = activeVmsChartRef.current ? new Chart(activeVmsChartRef.current, {
            type: 'doughnut',
            data: {
                labels: ['Activas', 'Inactivas'],
                datasets: [{ data: [metrics.active, Math.max(vms.length - metrics.active, 0)], backgroundColor: ['#39FF14', '#26352A'], borderWidth: 0 }],
            },
            options: doughnutOptions,
        }) : null;

        const vcpuChart = vcpuChartRef.current ? new Chart(vcpuChartRef.current, {
            type: 'bar',
            data: {
                labels: ['Utilizada', 'Disponible'],
                datasets: [{ data: [metrics.totalCores, Math.max(CAPACITY.cores - metrics.totalCores, 0)], backgroundColor: ['#B6FF00', '#26352A'], borderRadius: 6, barThickness: 18 }],
            },
            options: {
                indexAxis: 'y',
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    x: { min: 0, max: CAPACITY.cores, ticks: { color: '#9BAAA0' }, grid: { color: '#26352A' } },
                    y: { ticks: { color: '#c2c9c4' }, grid: { display: false } },
                },
            },
        }) : null;

        return () => {
            chart?.destroy();
            resourceChart?.destroy();
            capacityChart?.destroy();
            totalVmsChart?.destroy();
            activeVmsChart?.destroy();
            vcpuChart?.destroy();
        };
    }, [vms, metrics.active, loading, error]);

    if (loading) {
        return <div className="grid grid--loading">{Array.from({ length: 7 }, (_, index) => <Skeleton key={index} className={`item item-${index}`} />)}</div>;
    }

    if (error) return <div className="dashboard-state dashboard-state--error">No se pudieron cargar las máquinas virtuales.</div>;

    return (
        <div className="grid">
            <div className="item item-0"><span>Total VMs</span><strong>{vms.length} <small>/ {CAPACITY.vms}</small></strong><div className="mini-chart"><canvas ref={totalVmsChartRef} /></div></div>
            <div className="item item-1">
                <div className="item-heading"><span>VM Registry</span><small>{metrics.latest?.os ?? 'Sin registros'}</small></div>
                <strong>{metrics.latest?.name ?? 'Sin registros'}</strong>
                {vms.length > 0 && <div className="dashboard-chart"><canvas ref={chartRef} /></div>}
            </div>
            <div className="item item-2"><span>Active</span><strong>{metrics.active}</strong><div className="mini-chart"><canvas ref={activeVmsChartRef} /></div></div>
            <div className="item item-4"><span>Allocated vCPU</span><strong>{metrics.totalCores} <small>/ {CAPACITY.cores}</small></strong><div className="dashboard-chart dashboard-chart--compact"><canvas ref={vcpuChartRef} /></div></div>
            <div className="item item-5"><span>RAM</span><strong>{metrics.totalRam} <small>/ {CAPACITY.ram} GB</small></strong><div className="capacity-progress"><i style={{ width: `${Math.min((metrics.totalRam / CAPACITY.ram) * 100, 100)}%` }} /></div></div>
            <div className="item item-6"><span>Resources per VM</span><div className="dashboard-chart"><canvas ref={resourceChartRef} /></div></div>
            <div className="item item-7"><span>Capacity reached</span><strong>{vms.length ? `${metrics.active} activas` : 'Sin datos'}</strong>{vms.length > 0 && <div className="dashboard-chart"><canvas ref={capacityChartRef} /></div>}</div>
        </div>
    );
}

export default BentoGrid;
