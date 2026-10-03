import PropTypes from 'prop-types';
import './style.scss';

function Input({
    type,
    name,
    label,
    onChange,
    isRequired = false,
}: {
    type: string;
    name?: string;
    label?: string; 
    onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
    isRequired?: boolean;
}) {

    const handlerBuildInput = (type: string, name?: string, onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void, isRequired?: boolean) => {
        switch (type) {
            case 'text':
                return (
                    <input
                        type="text"
                        id={name}
                        name={name}
                        onChange={onChange}
                        required={isRequired}
                        placeholder={`${label} ${isRequired ? '*' : ''}`}
                    />
                );

            case 'password':
                return (
                    <input
                        type="password"
                        id={name}
                        name={name}
                        onChange={onChange}
                        required={isRequired}
                        placeholder={`${label} ${isRequired ? '*' : ''}`}
                    />
                );

            case 'email':
                return (
                    <input
                        type="email"
                        id={name}
                        name={name}
                        onChange={onChange}
                        required={isRequired}
                        placeholder={`${label} ${isRequired ? '*' : ''}`}
                    />
                );

            case 'number':
                return (
                    <input
                        type="number"
                        id={name}
                        name={name}
                        onChange={onChange}
                        required={isRequired}
                        placeholder={`${label} ${isRequired ? '*' : ''}`}
                    />
                );

            case 'checkbox':
                return (
                    <input
                        type="checkbox"
                        id={name}
                        name={name}
                        onChange={onChange}
                        required={isRequired}
                    />
                );

            default:
                return (
                    <input
                        type="text"
                        id={name}
                        name={name}
                        onChange={onChange}
                        required={isRequired}
                        placeholder={`${label} ${isRequired ? '*' : ''}`}
                    />
                );
        }
    };

    const buildInputGroup = (type: string, name?: string, label?: string, onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void, isRequired?: boolean) => {
        return (
            <div className="mv-ifx-input-group">
                {handlerBuildInput(type, name, onChange, isRequired)}
                {isRequired && <small className="required-message">This field is required</small>}
            </div>
        );
    }

    return <>{buildInputGroup(type, name, label, onChange, isRequired)}</>;
}

Input.propTypes = {
    type: PropTypes.string.isRequired,
    name: PropTypes.string,
    label: PropTypes.string,
    onChange: PropTypes.func,
    isRequired: PropTypes.bool,
};

export default Input;