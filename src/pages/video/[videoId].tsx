import { NextPage } from "next";
import { useSession } from "next-auth/react";
import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect } from "react";
import ReactPlayer from "react-player";
import { SmallSingleColumnVideo } from "~/components/Components";
import ErrorMessage from "~/components/ErrorMessage";
import Layout from "~/components/Layout";
import LoadingMessage from "~/components/LoadingMessage";
import { VideoInfo, VideoTitle } from "~/components/VideoComponent";
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
  const {
    data: sidebarVideos,
    isLoading: sidebarLoading,
    error: sidebarError,
    refetch: refetchSidebarVideos,
  } = api.video.getRandomVideos.useQuery(20, {
    enabled: false,
  });

  useEffect(() => {
    if (!sidebarVideos) {
      void refetchSidebarVideos();
    }
  }, []);

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
        <main className="mx-auto lg:flex">
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
                <div className="flex space-x-3 rounded-2xl border border-gray-200 p-4 shadow-sm">
                  <div className="min-w-0 flex-1 space-y-3">
                    <div className="xs:flex-wrap flex flex-row justify-between gap-4  max-md:flex-wrap">
                      <div className="flex flex-col items-start justify-center  gap-1 self-stretch">
                        <VideoTitle title={video.title || ""} />
                        <VideoInfo
                          views={video.views}
                          createdAt={video.createdAt}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
          <div className="px-4 lg:w-2/5 lg:px-0">
            {!sidebarVideos || sidebarError ? (
              <DataError />
            ) : (
              <SmallSingleColumnVideo
                videos={sidebarVideos.videos.map((video) => ({
                  id: video?.id || "",
                  title: video?.title || "",
                  thumbnail: video?.thumbnailUrl || "",
                  createdAt: video?.createdAt || new Date(),
                  views: video?._count.VideoEngagement || 0,
                }))}
                users={sidebarVideos.users.map((user) => ({
                  name: user?.name || "",
                  image: user?.image || "",
                }))}
              />
            )}
          </div>
        </main>
      </Layout>
    </>
  );
};

export default VideoPage;
