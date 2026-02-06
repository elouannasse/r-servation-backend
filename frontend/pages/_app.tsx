import type { AppProps } from "next/app";
import { AuthProvider } from "../context/AuthContext";
import { ToastContainer } from "../components/Toast";
import Navbar from "../components/Navbar";
import "../styles/globals.css";

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <AuthProvider>
      <ToastContainer />
      <Navbar />
      <Component {...pageProps} />
    </AuthProvider>
  );
}

export default MyApp;
