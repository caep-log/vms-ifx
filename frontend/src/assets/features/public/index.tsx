import { useState } from 'react';
import { useNavigate } from 'react-router';
import './style.scss';
import Text from '../../shared/components/text/text';
import Input from '../../shared/components/input/input';
import Button from '../../shared/components/button/button';
import { useAuth } from '../auth/authContext';

function Index() {
    const [form, setForm] = useState(0);

    const [user, setUser] = useState({
        username: '',
        password: '',
        role: ''
    });
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const { login, signUp } = useAuth();

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

    const handlerSignUp = async () => {
        setError('');
        try {
            await signUp(user.username, user.password, user.role);
            navigate('/dashboard', { replace: true });
        } catch {
            setError('No fue posible iniciar sesión');
        }
    }

    const handlerShowLoginForm = () => {
        setForm(0);
    }

    const handlerShowSignUpForm = () => {
        setForm(1);
    }

    return (
        <div className="mv-ifx-login-page">

            <div className="ifx-public-forms">
                <div className="auth-brand">
                    <div className="auth-brand-mark">IFX</div>
                    <div>
                        <Text type="text" text="IFX Networks" />
                        <Text type="small" text="Virtual manager" />
                    </div>
                </div>
                <Text type="subtitle" text="Control your virtual infrastructure." customClass="auth-intro" />
                <div className='pill-forms'>
                    <Button
                        text='Login'
                        onClick={handlerShowLoginForm}
                        customClass={form === 0 ? 'active-form' : ''}
                    />
                    <Button
                        text='Sign up'
                        onClick={handlerShowSignUpForm}
                        customClass={form === 1 ? 'active-form' : ''}
                    />
                </div>

                {form === 0 && (
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
                )}

                {form === 1 && (
                    <div className="mv-ifx-login-form">
                        <Text type='title' text='MVs IFX Sign up' />
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
                            <Input
                                typeInput='select'
                                name="role"
                                text="Role"
                                onChange={habdlerCompleteForm}
                                options={[
                                    { label: 'Admin', value: 'Admin' },
                                    { label: 'Client', value: 'Client' }
                                ]}
                                isRequired={true}
                            />
                            {error && <p className="alert" role="alert">{error}</p>}
                            <Button text='Sign Up' onClick={handlerSignUp} />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Index;
