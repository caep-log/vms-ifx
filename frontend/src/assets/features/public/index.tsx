import { useState } from 'react';
import { useNavigate } from 'react-router';
import './style.scss';
import Text from '../../shared/components/text/text';
import Input from '../../shared/components/input/input';
import Button from '../../shared/components/button/button';
import { useAuth } from '../auth/authContext';

function Index() {
    const [user, setUser] = useState({
        username: '',
        password: ''
    });
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const { login } = useAuth();

    const habdlerCompleteForm: NonNullable<React.ComponentProps<typeof Input>['onChange']> = (e) => {
        const { name, value } = e.target;
        setUser((prevState) => ({ ...prevState, [name]: value }));
    }

    const handlerLogin = async () => {
        setError('');
        try {
            await login(user.username, user.password);
            navigate('/dashboard', { replace: true });
        } catch {
            setError('No fue posible iniciar sesión');
        }
    };

    return (
        <div className="mv-ifx-login-page">
            <div className="mv-ifx-login-form">
                <Text type='title' text='MVs IFX Login' />
                <div>
                    <Input
                        typeInput='text'
                        name="username"
                        text="Correo electrónico"
                        onChange={habdlerCompleteForm}
                        isRequired={true}
                    />
                    <Input
                        typeInput='password'
                        name="password"
                        text="Contraseña"
                        onChange={habdlerCompleteForm}
                        isRequired={true}
                    />
                    {error && <p className="alert" role="alert">{error}</p>}
                    <Button text='Login' onClick={handlerLogin} />
                </div>
            </div>
        </div>
    );
};

export default Index;
