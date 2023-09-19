import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal, WalletIcon } from "@solana/wallet-adapter-react-ui";
import axios from "axios";
import bs58 from "bs58";
import { signIn } from "next-auth/react";
import { useRouter } from "next/router";
import { useCallback } from "react";

import { Org } from "@underdog-protocol/js";

import { ButtonType, Button } from "../Button";
import { sizeToDimensionsClassName, TailwindSize } from "@/lib/tailwind";
import { useToggle } from "@/hooks/useToggle";

type SignInWithWalletButtonProps = {
  type?: ButtonType;
  size?: TailwindSize;
  org?: Org;
};

export function SignInWithWalletButton({
  type = "primary",
  size = "md",
}: SignInWithWalletButtonProps) {
  const router = useRouter();

  const { wallet, signMessage, publicKey, disconnect } = useWallet();
  const { setVisible } = useWalletModal();

  const [signingIn, toggleSigningIn] = useToggle();

  const getNonce = async () => {
    const response = await axios.get("/api/auth/nonce");
    return response.data.nonce;
  };

  const handleConnect = useCallback(async () => {
    console.log(signMessage, publicKey);
    if (signMessage && publicKey) {
      const nonce = await getNonce();
      const message = `Sign this message to connect your wallet.\n\nNonce: ${nonce}`;
      const encodedMessage = new TextEncoder().encode(message);

      const signedMessage = await signMessage(encodedMessage);

      try {
        toggleSigningIn();
        await signIn("credentials", {
          redirect: false,
          walletAddress: publicKey.toBase58(),
          signature: bs58.encode(signedMessage),
          callbackUrl: (router.query.callbackUrl as string) || "/",
        });
      } catch {}
      toggleSigningIn();
    }
  }, [signMessage, publicKey, toggleSigningIn, router.query.callbackUrl]);

  if (!wallet) {
    return (
      <Button size={size} block type={type} onClick={() => setVisible(true)}>
        Select a Wallet
      </Button>
    );
  }

  return (
    <div>
      <Button block size={size} type={type} onClick={handleConnect}>
        <div className="flex items-center space-x-2">
          <WalletIcon
            wallet={wallet}
            className="h-6 w-6"
          />
          <span>{signingIn ? "Signing In..." : "Sign In with Wallet"}</span>
        </div>
      </Button>
      <Button type="link" className="text-primary" block onClick={() => disconnect()}>
        Connect a different wallet
      </Button>
    </div>
  );
}
