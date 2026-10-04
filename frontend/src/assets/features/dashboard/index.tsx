import Text from '../../shared/components/text/text';
import BentoGrid from './bento-grid/bento-grid';
import './style.scss';

export default function Dashboard() {
    return (
        <section>
            <Text type='title' text='Dashboard' />
            <BentoGrid />
        </section>
    );
}
