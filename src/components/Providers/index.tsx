import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { UnderdogProvider } from "@underdog-protocol/js";
import { Session } from "next-auth";
import { SessionProvider } from "next-auth/react";

type ProvidersProps = {
  children: React.ReactNode;
  session: Session;
};

export function Providers({ children, session }: ProvidersProps) {
  return (
    <SessionProvider session={session}>
      <UnderdogProvider>
        <ConnectionProvider endpoint="https://orbital-rough-fog.solana-devnet.quiknode.pro/5a555de90294fa466470466a468213c4062dad40/">
          <WalletProvider wallets={[]} autoConnect>
            <WalletModalProvider>{children}</WalletModalProvider>
          </WalletProvider>
        </ConnectionProvider>
      </UnderdogProvider>
    </SessionProvider>
  );
}
