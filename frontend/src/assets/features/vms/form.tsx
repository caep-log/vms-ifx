import { useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router';
import Input from '../../shared/components/input/input';
import Button from '../../shared/components/button/button';
import { apiClient } from '../../infrastructure/http/apiClient';
import './style.scss';
import Text from '../../shared/components/text/text';

interface VmFormData {
    name: string;
    cores: string;
    ram: string;
    disk: string;
    os: string;
}

interface VmPayload {
    name: string;
    cores: number;
    ram: number;
    disk: number;
    os: string;
    status: string;
}

interface VmResponse extends VmPayload { id: string; }
interface VmRouteState { vm?: VmResponse; }

const initialForm: VmFormData = { name: '', cores: '', ram: '', disk: '', os: '' };

export default function VmsForm() {
    const { id } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const selectedVm = (location.state as VmRouteState | null)?.vm;
    const [form, setForm] = useState<VmFormData>(() => selectedVm ? {
        name: selectedVm.name,
        cores: String(selectedVm.cores),
        ram: String(selectedVm.ram),
        disk: String(selectedVm.disk),
        os: selectedVm.os,
    } : initialForm);
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange: NonNullable<React.ComponentProps<typeof Input>['onChange']> = (event) => {
        const { name, value } = event.target;
        setForm((current) => ({ ...current, [name]: value }));
    };

    const handleSubmit = async () => {
        setError('');
        if (!form.name.trim() || !form.cores || !form.os || !form.ram || !form.disk) {
            setError('Completa todos los campos.');
            return;
        }

        const ram = Number(form.ram);
        const disk = Number(form.disk);
        if (ram <= 0 || disk <= 0) {
            setError('RAM y disco deben ser mayores que cero.');
            return;
        }

        setIsSubmitting(true);
        const payload: VmPayload = {
            name: form.name.trim(),
            cores: Number(form.cores),
            ram,
            disk,
            os: form.os,
            status: 'active',
        };

        try {
            if (id) {
                await apiClient.put<VmResponse, VmPayload>(`/api/vms/${id}`, payload);
            } else {
                await apiClient.post<VmResponse, VmPayload>('/api/vms', payload);
            }
            navigate('/vms');
        } catch {
            setError(`No fue posible ${id ? 'actualizar' : 'registrar'} la máquina virtual.`);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <section>
            <Text type="title" text={id ? 'Editar VM' : 'Crear VM'} />
            <div className="container-form-new-vm">
                <Input name="name" text="Name" onChange={handleChange} val={form.name} isRequired />
                <Input name="cores" text="Cores" typeInput="select" val={form.cores} options={[1, 2, 4, 8].map((cores) => ({ label: `${cores} core${cores === 1 ? '' : 's'}`, value: cores }))} onChange={handleChange} isRequired />
                <Input name="os" text="Operative System" typeInput="select" val={form.os} options={[{ label: 'Ubuntu', value: 'Ubuntu' }, { label: 'Debian', value: 'Debian' }, { label: 'Windows Server', value: 'Windows Server' }]} onChange={handleChange} isRequired />
                <Input name="ram" text="RAM (GB)" typeInput="select" val={form.ram} options={['4', '8', '12', '16', '24', '32', '48', '96'].map((ram) => ({ label: `${ram}GB`, value: ram }))} onChange={handleChange} isRequired />
                <Input name="disk" text="Disk (GB)" typeInput="select" val={form.disk} options={[['512', '512GB'], ['1024', '1TB'], ['2048', '2TB'], ['4096', '4TB']].map(([value, label]) => ({ label, value }))} onChange={handleChange} isRequired />
                {error && <Text text={error} type="text" customClass="text-danger" />}
                <br />
                <Button text={isSubmitting ? (id ? 'Actualizando...' : 'Registrando...') : (id ? 'Guardar cambios' : 'Registrar VM')} onClick={handleSubmit} />
            </div>
        </section>
    );
}
