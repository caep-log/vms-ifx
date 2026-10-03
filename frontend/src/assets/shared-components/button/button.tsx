import React from 'react';
import './style.scss';

function Button({ icon, text, onClick, typeBtn }: { icon?: React.ReactNode; text?: string; onClick?: () => void; typeBtn?: 'primary' | 'secondary' }) {
  return (
    <button onClick={onClick} className={`btn btn-${typeBtn}`}>
        {icon && (icon)}
        {text}
    </button>
  )
};

export default Button;
