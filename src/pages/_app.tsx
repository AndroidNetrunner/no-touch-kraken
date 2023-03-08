import "../styles/globals.css";
import type { AppProps } from "next/app";
import { useEffect } from "react";
import { Provider } from "react-redux";
import store from "store";

export default function App({ Component, pageProps }: AppProps) {
  useEffect(() => {
    const script = document.createElement("script");
    script.src =
      "https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha1/dist/js/bootstrap.bundle.min.js";
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);
  }, []);
  return (
    <Provider store={store}>
      <link
        href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha1/dist/css/bootstrap.min.css"
        rel="stylesheet"
        integrity="sha384-GLhlTQ8iRABdZLl6O3oVMWSktQOp6b7In1Zl3/Jr59b6EGGoI1aFkw7cmDA6j6gD"
        crossOrigin="anonymous"
      />
      <Component {...pageProps} />
    </Provider>
  );
}
