import type { AppProps } from 'next/app';
import { AuthProvider } from '../context/AuthContext';
import { Toaster } from 'react-hot-toast';
import Layout from '../components/Layout';
import '../styles/globals.css';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <AuthProvider>
      <Layout>
        <Component {...pageProps} />
        <Toaster position="top-right" />
      </Layout>
    </AuthProvider>
  );
}

export default MyApp;
