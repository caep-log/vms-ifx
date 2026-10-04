import { useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import Input from '../../shared/components/input/input';
import Button from '../../shared/components/button/button';
import { apiClient } from '../../infrastructure/http/apiClient';
import './style.scss';

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

interface VmResponse extends VmPayload {
    id: string;
}

const initialForm: VmFormData = {
    name: '',
    cores: '',
    ram: '',
    disk: '',
    os: '',
};

export default function VmsForm() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [form, setForm] = useState(initialForm);
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

        try {
            await apiClient.post<VmResponse, VmPayload>('/api/vms', {
                name: form.name.trim(),
                cores: Number(form.cores),
                ram,
                disk,
                os: form.os,
                status: 'active',
            });
            navigate('/vms');
        } catch {
            setError('No fue posible registrar la máquina virtual.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <section>
            <div className="form-create-vm">
                <h1>{id ? 'Editar VM' : 'Crear VM'}</h1>
                <Input
                    name="name"
                    text="Nombre"
                    onChange={handleChange}
                    isRequired
                />
                <Input
                    name="cores"
                    text="Cores"
                    typeInput="select"
                    options={[1, 2, 4, 8].map((cores) => ({
                        label: `${cores} core${cores === 1 ? '' : 's'}`,
                        value: cores,
                    }))}
                    onChange={handleChange}
                    isRequired
                />
                <Input
                    name="os"
                    text="Sistema operativo"
                    typeInput="select"
                    options={[
                        { label: 'Ubuntu', value: 'Ubuntu' },
                        { label: 'Debian', value: 'Debian' },
                        { label: 'Windows Server', value: 'Windows Server' },
                    ]}
                    onChange={handleChange}
                    isRequired
                />

                <Input
                    name="ram"
                    text="RAM (GB)"
                    typeInput="select"
                    options={[
                        { label: '8GB', value: '8' },
                        { label: '16GB', value: '16' },
                        { label: '24GB', value: '24' },
                        { label: '48GB', value: '48' },
                        { label: '64GB', value: '64' },
                        { label: '96GB', value: '96' },
                    ]}
                    onChange={handleChange}
                    isRequired
                />
                <Input
                    name="disk"
                    text="Disco (GB)"
                    typeInput="select"
                    options={[
                        { label: '128GB', value: '128' },
                        { label: '240GB', value: '240' },
                        { label: '512GB', value: '512' },
                        { label: '1TB', value: '1024' },
                        { label: '2TB', value: '2048' },
                        { label: '4TB', value: '4096' },
                    ]}
                    onChange={handleChange}
                    isRequired
                />
                {error && <p role="alert">{error}</p>}
                <Button
                    text={isSubmitting ? 'Registrando...' : 'Registrar VM'}
                    onClick={handleSubmit}
                />
            </div>
        </section>
    );
}