import { useState } from 'react';
import './style.scss';
import Text from '../../shared/components/text/text';
import Input from '../../shared/components/input/input';
import Button from '../../shared/components/button/button';

function Index() {
    const [user, setUser] = useState({
        username: '',
        password: '',
    });

    const habdlerCompleteForm: NonNullable<React.ComponentProps<typeof Input>['onChange']> = (e) => {
        const { name, value } = e.target;
        setUser((prevState) => ({ ...prevState, [name]: value }));
    }

    const handlerLogin = () => {
        console.log(user);
        // setUser();
    };

    return (
        <div className="mv-ifx-login-page">
            <div className="mv-ifx-login-form">
                <Text type='title' text='MVs IFX Login' />
                <div>
                    <Input
                        typeInput='text'
                        name="username"
                        onChange={habdlerCompleteForm}
                        isRequired={true}
                    />
                    <Input
                        typeInput='password'
                        name="password"
                        onChange={habdlerCompleteForm}
                        isRequired={true}
                    />
                    <Button text='Login' onClick={handlerLogin} />
                </div>
            </div>
        </div>
    );
};

export default Index;
