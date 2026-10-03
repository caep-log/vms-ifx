import propTypes from 'prop-types';
import './style.scss';

function Text(
        { type, text, customClass, title}:
        { type: string, name?: string, text: string, customClass?: string, title?: string }
    ) {
    const Component =
        type === 'title'
            ? 'h1'
            : type === 'subtitle'
            ? 'p'
            : type === 'small'
            ? 'small'
            : 'span';

    return (
        <Component
            className={`vm-ifx-${type} ${customClass}`}
            title={title}
        >
            {text}
        </Component>
    );
}

Text.propTypes = {
    type: propTypes.string.isRequired,
    text: propTypes.string.isRequired,
    customClass: propTypes.string,
    title: propTypes.string,
}

export default Text;
