import '../styles/globals.css'
import { BaseLayout } from "@ui";
import type { AppProps } from 'next/app'

function MyApp({ Component, pageProps }: AppProps) {
  return <>
    <BaseLayout>
      <Component {...pageProps} />
    </BaseLayout>
  </>
}

export default MyApp
