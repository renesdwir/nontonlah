import { NextPage } from "next";
import { useSession } from "next-auth/react";
import Head from "next/head";
import { useRouter } from "next/router";
import Layout from "~/components/Layout";
import { api } from "~/utils/api";

const VideoPage: NextPage = () => {
  const router = useRouter();
  const { videoId } = router.query;
  const { data: sessionData } = useSession();
  const { data, isLoading, error, refetch } = api.video.getVideoById.useQuery(
    {
      id: videoId as string,
      viewerId: sessionData?.user?.id as string,
    },
    { enabled: !!videoId && !!sessionData?.user?.id },
  );

  const video = data?.video;
  const user = data?.user;
  const errorTypes = error || !video || !user;
  return (
    <>
      <Head>
        <title>{video?.title}</title>
        <meta name="description" content={user?.description || ""} />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Layout closeSidebar={true}>
        <p>Hello World</p>
      </Layout>
    </>
  );
};

export default VideoPage;
