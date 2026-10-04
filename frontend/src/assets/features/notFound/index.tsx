import { Link } from 'react-router';

export default function NotFound() {
    return (
        <section>
            <h1>Página no encontrada</h1>
            <Link to="/login">Volver al inicio</Link>
        </section>
    );
}
