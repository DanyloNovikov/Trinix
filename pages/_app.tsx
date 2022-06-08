import '../styles/globals.css'
import { BaseLayout } from "../components";
import type { AppProps } from 'next/app'

function MyApp({ Component, pageProps }: AppProps) {
  return <>
    <BaseLayout>
      <Component {...pageProps} />
    </BaseLayout>
  </>
}

export default MyApp
