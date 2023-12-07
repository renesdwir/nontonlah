import { signIn, signOut, useSession } from "next-auth/react";
import Head from "next/head";
import Link from "next/link";
import { NextPage } from "next/types";
import Button from "~/components/Buttons/Button";
import {
  ErrorMessage,
  Layout,
  LoadingMessage,
  MultiColumnVideo,
  Navbar,
  Sidebar,
} from "~/components/Components";

import { api } from "~/utils/api";

const Home: NextPage = () => {
  const { data, error, isLoading } = api.video.getRandomVideos.useQuery(10, {
    refetchOnWindowFocus: false,
  });
  console.log(data, isLoading);
  const Error = () => {
    if (isLoading) return <LoadingMessage />;
    else if (error || !data)
      return (
        <ErrorMessage
          message="No Videos"
          description="Sorry there is no videos at this time"
        />
      );
    else return <></>;
  };
  return (
    <>
      <Head>
        <title>Nontonlah</title>
        <meta name="description" content="Nonton lah video kesukaan anda" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Layout>
        {!data || error ? (
          <Error />
        ) : (
          <MultiColumnVideo
            videos={data.videos.map((video) => ({
              id: video?.id || "",
              title: video?.title || "",
              thumbnail: video?.thumbnailUrl || "",
              createdAt: video?.createdAt || new Date(),
              views: video?._count.VideoEngagement || 0,
            }))}
            users={data.users.map((user) => ({
              name: user?.name || "",
              image: user?.image || "",
            }))}
          />
        )}
      </Layout>
    </>
  );
};
export default Home;
function AuthShowcase() {
  const { data: sessionData } = useSession();

  const { data: secretMessage } = api.post.getSecretMessage.useQuery(
    undefined, // no input
    { enabled: sessionData?.user !== undefined },
  );

  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <p className="text-center text-2xl text-white">
        {sessionData && <span>Logged in as {sessionData.user?.name}</span>}
        {secretMessage && <span> - {secretMessage}</span>}
      </p>
      <Button
        size="xl"
        variant="primary"
        onClick={sessionData ? () => void signOut() : () => void signIn()}
      >
        {sessionData ? "Sign out" : "Sign in"}
      </Button>
    </div>
  );
}
