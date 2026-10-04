import { Link } from 'react-router';
import { useAuth } from '../auth/authContext';

export default function VmsList() {
    const { isAdmin } = useAuth();

    return (
        <section>
            <h1>Máquinas virtuales</h1>
            {isAdmin && <Link to="/vms/new">Crear VM</Link>}
            <p>Listado de máquinas virtuales.</p>
        </section>
    );
}
