import React from 'react';
import './style.scss';

function Button(
    { icon, text, onClick, typeBtn, customClass, disabled }:
    { icon?: React.ReactNode; text?: string; onClick?: () => void; typeBtn?: 'primary' | 'secondary'; customClass?: string; disabled?: boolean })
  {
  return (
    <button onClick={onClick} className={`btn btn-${typeBtn} ${customClass}`} disabled={disabled}>
        {icon && (icon)}
        {text}
    </button>
  )
};

export default Button;
