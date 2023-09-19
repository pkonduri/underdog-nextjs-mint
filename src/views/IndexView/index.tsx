import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { Container } from "@/components/Container";
import { Header } from "@/components/MediaObject/Header";
import { SignInWithWalletButton } from "@/components/SignInWithWalletButton";
import { openOnXray, shortenAddress } from "@/lib";
import { useProject } from "@underdog-protocol/js";
import { signOut, useSession } from "next-auth/react";
import { useEffect } from "react";

export const IndexView: React.FC = () => {
  const session = useSession();

  const { project, refetch } = useProject({ params: { projectId: 1 }, query: { page: 1, limit: 10, sortBy: "id", order: "desc" } });

  useEffect(() => {
    if (session) {
      refetch();
    }
  }, [session]);

  if (!project) return null;

  return (
    <Container size="md" className="py-8 space-y-8">
        <Card className="space-y-4 p-4">
          <img src={project.image} />          

          {session.status === "authenticated" ? (
            <Button onClick={() => signOut({ redirect: false })} block>
              Sign Out
            </Button>
          ) : (
            <SignInWithWalletButton />
          )}
        </Card>

        <Card className="flex w-full flex-col space-y-4 p-4">
          <Header title="Activity" />
          {project.nfts.results.map((nft) => (
            <div key={nft.id} className="flex justify-between items-center space-x-4">
              <p className="text-light">
                {nft.ownerAddress && `${shortenAddress(nft.ownerAddress)} minted ${nft.name}`}
              </p>
              <Button className="flex-shrink-0 text-primary" type="link" size="xs" onClick={() => openOnXray(nft.mintAddress)}>View on XRAY</Button>
            </div>
          ))}
        </Card>
    </Container>
  );
};
