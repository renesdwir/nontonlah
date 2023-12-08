import { NextPage } from "next";
import { useSession } from "next-auth/react";
import Head from "next/head";
import { useRouter } from "next/router";
import ReactPlayer from "react-player";
import ErrorMessage from "~/components/ErrorMessage";
import Layout from "~/components/Layout";
import LoadingMessage from "~/components/LoadingMessage";
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
  const DataError = () => {
    if (isLoading) {
      return <LoadingMessage />;
    } else if (errorTypes) {
      return (
        <ErrorMessage
          message="No Video"
          description="Sorry there is an error loading video."
        />
      );
    } else {
      return <></>;
    }
  };
  return (
    <>
      <Head>
        <title>{video?.title}</title>
        <meta name="description" content={user?.description || ""} />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Layout closeSidebar={true}>
        <main className="lg-flex mx-auto">
          {errorTypes ? (
            <DataError />
          ) : (
            <>
              <div className="w-full sm:px-4 lg:w-3/5">
                <div className="py-4">
                  <ReactPlayer
                    controls={true}
                    style={{ borderRadius: "1rem", overflow: "hidden" }}
                    width={"100%"}
                    height={"50%"}
                    url={video.videoUrl || ""}
                  />
                </div>
              </div>
            </>
          )}
          <div className="px-4 lg:w-2/5 lg:px-0"></div>
        </main>
      </Layout>
    </>
  );
};

export default VideoPage;
