import PropTypes from 'prop-types';
import { useRef, useState } from 'react';
import Text from '../text/text';
import { Search, X } from 'lucide-react';
import './style.scss';

type InputOptionValue = string | number | boolean;

interface InputOption {
    label: string;
    value: InputOptionValue;
}

export interface InputChangeEvent {
    target: {
        id: string;
        name: string;
        value: string;
        checked?: boolean;
    };
}

interface InputProps {
    id?: string;
    name?: string;
    text?: string;
    typeInput?: 'text' | 'number' | 'date' | 'password' | 'checkbox' | 'textarea' | 'select';
    options?: InputOption[];
    onChange?: (event: InputChangeEvent) => void;
    disabled?: boolean;
    val?: string | number | boolean;
    autocomplete?: boolean;
    isRequired?: boolean;
    mustBeValidate?: boolean;
    style?: string;
    asSearch?: boolean;
}

function Input({
    id = '',
    name = '',
    text = '',
    typeInput = 'text',
    options = [],
    onChange,
    disabled = false,
    val,
    autocomplete = false,
    isRequired,
    mustBeValidate = true,
    style = '',
    asSearch = false,
}: InputProps) {
    const inputRef = useRef<HTMLInputElement>(null);

    const [value, setValue] = useState<string | boolean>(
        typeInput === 'checkbox' ? false : ''
    );

    const [hasWrittenValue, setHasWrittenValue] = useState(false);
    const [isFocused, setIsFocused] = useState(false);

    const inputId = id
        ? id
        : `vm-ifx-input-${text.toLowerCase().replace(/\s/g, '-')}`;

    const isCheckbox = typeInput === 'checkbox';
    const isSelect = typeInput === 'select';
    const isSearch = asSearch && typeInput === 'text';
    const shouldValidate = isRequired ?? mustBeValidate;

    const currentValue = val !== undefined ? val : value;

    const hasValue = isCheckbox
        ? Boolean(currentValue)
        : String(currentValue ?? '').trim() !== '';

    const hasError =
        shouldValidate &&
        hasWrittenValue &&
        !isCheckbox &&
        String(currentValue ?? '').trim() === '';

    const inputClassName = `vm-ifx-input ${style} vm-ifx-text${
        hasError ? ' vm-ifx-input--error' : ''
    }`;

    const selectClassName = `vm-ifx-select ${style} vm-ifx-text${
        hasError ? ' vm-ifx-input--error' : ''
    }`;

    const fieldClassName =
        `vm-ifx-input-field` +
        `${isFocused ? ' vm-ifx-input-field--focused' : ''}` +
        `${hasValue ? ' vm-ifx-input-field--has-value' : ''}` +
        `${hasError ? ' vm-ifx-input-field--error' : ''}` +
        `${disabled ? ' vm-ifx-input-field--disabled' : ''}` +
        `${isSelect ? ' vm-ifx-input-field--select' : ''}` +
        `${isSearch ? ' vm-ifx-input-field--search' : ''} ${style}`;

    const checkboxGroupClassName =
        `vm-ifx-input-group ${style} vm-ifx-input-group--checkbox` +
        `${hasError ? ' vm-ifx-input-group--error' : ''}` +
        `${disabled ? ' vm-ifx-input-group--disabled' : ''}`;

    const handleChange = (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        let nextValue: string | boolean = isCheckbox
            ? event.target.checked
            : event.target.value;

        if (typeInput === 'number' && !isCheckbox) {
            nextValue = String(nextValue).replace(/\D/g, '');

            if (String(currentValue) === '0') {
                nextValue = String(nextValue).replace(/^0+/, '');
            }

            event.target.value = String(nextValue);
        }

        if (!isCheckbox) {
            setHasWrittenValue(true);
        }

        setValue(nextValue);

        if (onChange) {
            onChange({
                target: {
                    id: event.target.id,
                    name: event.target.name,
                    value: event.target.value,
                    checked: event.target.checked,
                },
            });
        }
    };

    const handleSelectChange = (
        event: React.ChangeEvent<HTMLSelectElement>
    ) => {
        setHasWrittenValue(true);
        setValue(event.target.value);

        if (onChange) {
            onChange({
                target: {
                    id: event.target.id,
                    name: event.target.name,
                    value: event.target.value,
                },
            });
        }
    };

    const handleFocus = () => {
        setIsFocused(true);
    };

    const handleBlur = () => {
        setIsFocused(false);
    };

    const handleClear = () => {
        setValue('');
        setHasWrittenValue(true);

        if (inputRef.current) {
            inputRef.current.value = '';
            inputRef.current.focus();
        }

        if (onChange) {
            onChange({
                target: {
                    id: inputId,
                    name,
                    value: '',
                },
            });
        }
    };

    const buildInput = () => {
        if (isCheckbox) {
            return (
                <label
                    className="vm-ifx-checkbox-field"
                    htmlFor={inputId}
                >
                    <input
                        id={inputId}
                        name={name}
                        className="vm-ifx-checkbox-input"
                        type="checkbox"
                        onChange={handleChange}
                        checked={Boolean(currentValue)}
                        disabled={disabled}
                        autoComplete={autocomplete ? 'on' : 'off'}
                    />

                    <span className="vm-ifx-checkbox-label vm-ifx-text">
                        {text}
                    </span>
                </label>
            );
        }

        return (
            <div className={fieldClassName}>
                <label
                    className={`vm-ifx-input-label vm-ifx-text ${style}`}
                    htmlFor={inputId}
                >
                    {text}
                </label>

                {isSearch && (
                    <button
                        className="vm-ifx-input-search-icon"
                        type="button"
                        tabIndex={-1}
                        aria-hidden="true"
                    >
                        <Search size={18} />
                    </button>
                )}

                <input
                    ref={inputRef}
                    id={inputId}
                    name={name}
                    className={inputClassName}
                    type={typeInput}
                    onChange={handleChange}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    defaultValue={isCheckbox ? undefined : String(currentValue ?? '')}
                    placeholder={text}
                    disabled={disabled}
                    autoComplete={autocomplete ? 'on' : 'off'}
                />

                {isSearch && hasValue && !disabled && (
                    <button
                        className="vm-ifx-input-clear-button"
                        type="button"
                        aria-label="Limpiar busqueda"
                        onClick={handleClear}
                    >
                        <X size={18} />
                    </button>
                )}
            </div>
        );
    };

    const buildTextArea = () => {
        return (
            <div className={fieldClassName}>
                <label
                    className={`vm-ifx-input-label vm-ifx-text ${style}`}
                    htmlFor={inputId}
                >
                    {text}
                </label>

                <textarea
                    id={inputId}
                    name={name}
                    className={inputClassName}
                    onChange={(event) => {
                        setHasWrittenValue(true);
                        setValue(event.target.value);

                        onChange?.({
                            target: {
                                id: event.target.id,
                                name: event.target.name,
                                value: event.target.value,
                            },
                        });
                    }}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    defaultValue={isCheckbox ? undefined : String(currentValue ?? '')}
                    placeholder={text}
                    disabled={disabled}
                    rows={3}
                />
            </div>
        );
    };

    const buildSelect = () => {
        return (
            <div className={fieldClassName}>
                <label
                    className={`vm-ifx-input-label vm-ifx-text ${style}`}
                    htmlFor={inputId}
                >
                    {text}
                </label>

                <select
                    id={inputId}
                    name={name}
                    className={selectClassName}
                    onChange={handleSelectChange}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    defaultValue={isCheckbox ? undefined : String(currentValue ?? '')}
                    disabled={disabled}
                >
                    <option value="">Seleccionar</option>

                    {options.map((option) => (
                        <option
                            key={String(option.value)}
                            value={String(option.value)}
                        >
                            {option.label}
                        </option>
                    ))}
                </select>
            </div>
        );
    };

    const handlerChooseInput = () => {
        switch (typeInput) {
            case 'text':
            case 'number':
            case 'date':
            case 'password':
            case 'checkbox':
                return buildInput();

            case 'textarea':
                return buildTextArea();

            case 'select':
                return buildSelect();

            default:
                return buildInput();
        }
    };

    const handlerValidatorInput = (
        val: string | number | boolean
    ) => {
        if (isCheckbox) {
            return null;
        }

        if (
            shouldValidate &&
            hasWrittenValue &&
            String(val ?? '').trim() === ''
        ) {
            return (
                <Text
                    type="small"
                    text="This field is required"
                    customClass="required-message"
                />
            );
        }

        return null;
    };

    return (
        <div
            className={
                isCheckbox
                    ? checkboxGroupClassName
                    : 'vm-ifx-input-group'
            }
        >
            <div className="vm-ifx-input-group__input">
                {handlerChooseInput()}
            </div>

            {handlerValidatorInput(currentValue)}
        </div>
    );
}

Input.propTypes = {
    id: PropTypes.string,
    name: PropTypes.string,
    text: PropTypes.string,
    typeInput: PropTypes.oneOf([
        'text',
        'number',
        'date',
        'password',
        'checkbox',
        'textarea',
        'select',
    ]),
    options: PropTypes.arrayOf(
        PropTypes.shape({
            label: PropTypes.string.isRequired,
            value: PropTypes.oneOfType([
                PropTypes.string,
                PropTypes.number,
                PropTypes.bool,
            ]).isRequired,
        })
    ),
    onChange: PropTypes.func,
    disabled: PropTypes.bool,
    val: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.number,
        PropTypes.bool,
    ]),
    autocomplete: PropTypes.bool,
    mustBeValidate: PropTypes.bool,
    style: PropTypes.string,
    asSearch: PropTypes.bool,
    isRequired: PropTypes.bool,
};

export default Input;
