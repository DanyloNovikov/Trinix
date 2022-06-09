import '../styles/globals.css';
import { BaseLayout } from "@ui";
import type { AppProps } from 'next/app';
import { Web3Provider } from '@providers';

function MyApp({ Component, pageProps }: AppProps) {
  return <>
    <Web3Provider>
      <BaseLayout>
        <Component {...pageProps} />
      </BaseLayout>
    </Web3Provider>
  </>
}

export default MyApp
