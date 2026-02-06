import type { AppProps } from "next/app";
import { AuthProvider } from "../context/AuthContext";
import { ToastContainer } from "../components/Toast";
import Layout from "../components/Layout";
import "../styles/globals.css";

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <AuthProvider>
      <ToastContainer />
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </AuthProvider>
  );
}

export default MyApp;
