import { Providers } from "@/components/Providers";
import type { AppProps } from "next/app";
import Head from "next/head";

require("@solana/wallet-adapter-react-ui/styles.css");
require("../styles/globals.css");

export default function App({
  Component,
  pageProps: { session, ...pageProps },
}: AppProps) {
  return (
    <Providers session={session}>
      <Head>
        <title>
          {process.env.NEXT_PUBLIC_APP_NAME || "Gallery | Underdog Protocol"}
        </title>
      </Head>

      <Component {...pageProps} />
    </Providers>
  );
}
