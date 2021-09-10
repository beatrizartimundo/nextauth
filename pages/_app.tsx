import { AppProps } from 'next/dist/shared/lib/router/router'
import { AuthProvider } from '../contexts/AuthContext'
import '../styles/globals.scss'

function MyApp({ Component, pageProps }: AppProps) {
  return (
  <AuthProvider>
    <Component {...pageProps} />
  </AuthProvider>
  )
}

export default MyApp
