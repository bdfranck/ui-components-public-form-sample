import { Outlet } from 'react-router-dom';
import {
    GoabAppHeader,
    GoabMicrositeHeader,
    GoabAppFooter,
    GoabPageBlock,
    GoabOneColumnLayout,
} from '@abgov/react-components';

export function App() {
    return (
        <GoabOneColumnLayout>
            <section slot="header">
                <GoabMicrositeHeader type="alpha"/>
                <GoabAppHeader url="/" heading="Service name" maxContentWidth="100%"/>
            </section>

            <GoabPageBlock width="100%">
                <Outlet/>
            </GoabPageBlock>

            <section slot="footer">
                <GoabAppFooter maxContentWidth="100%">
                </GoabAppFooter>
            </section>
        </GoabOneColumnLayout>
    );
}

export default App;
