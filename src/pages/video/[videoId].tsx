import { NextPage } from "next";
import { useSession } from "next-auth/react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect } from "react";
import ReactPlayer from "react-player";
import FollowButton from "~/components/Buttons/FollowButton";
import {
  CommentSection,
  Description,
  SmallSingleColumnVideo,
} from "~/components/Components";
import ErrorMessage from "~/components/ErrorMessage";
import Layout from "~/components/Layout";
import LoadingMessage from "~/components/LoadingMessage";
import {
  UserImage,
  Username,
  VideoInfo,
  VideoTitle,
} from "~/components/VideoComponent";
import { api } from "~/utils/api";
import { type GetServerSideProps } from "next";
import { getServerAuthSession } from "~/server/auth";
import { LikeDislikeButton } from "~/components/Buttons/Buttons";

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const session = await getServerAuthSession(ctx);
  return {
    props: { session },
  };
};

const VideoPage: NextPage = () => {
  const { data: sessionData } = useSession();
  const router = useRouter();
  const { videoId } = router.query;
  const { data, isLoading, error, refetch } = api.video.getVideoById.useQuery(
    {
      id: videoId as string,
      viewerId: sessionData?.user?.id as string,
    },
    {
      enabled: false,
      refetchOnWindowFocus: false,
    },
  );
  const {
    data: sidebarVideos,
    isLoading: sidebarLoading,
    error: sidebarError,
    refetch: refetchSidebarVideos,
  } = api.video.getRandomVideos.useQuery(20, {
    enabled: false,
  });
  const addViewMutation = api.videoEngagement.addViewCount.useMutation();
  const addView = (input: { id: string; userId: string }) => {
    if (input.id) {
      addViewMutation.mutate(input, {
        onSuccess: () => {
          refetch();
          if (!sidebarVideos) void refetchSidebarVideos();
        },
      });
    }
  };
  useEffect(() => {
    if (videoId) {
      addView({
        id: videoId as string,
        userId: sessionData ? sessionData.user.id : "",
      });
    }
  }, [videoId]);

  const video = data?.video;
  const user = data?.user;
  const viewer = data?.viewer;
  const errorTypes = error || !video || !user || !viewer;
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
        <title>{video?.title || "Nontonlah"}</title>
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
                    onPlay={() => console.log("playy")}
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
                      <div className="flex-inline flex items-end justify-start  gap-4 self-start  ">
                        <LikeDislikeButton
                          EngagementData={{
                            id: video.id,
                            likes: video.likes,
                            dislikes: video.dislikes,
                          }}
                          viewer={{
                            hasDisliked: viewer.hasDisliked,
                            hasLiked: viewer.hasLiked,
                          }}
                        />
                      </div>
                    </div>
                    <div className="flex flex-row place-content-between gap-x-4">
                      <Link
                        href={`/${video.userId}/ProfileVideos`}
                        key={video.userId}
                      >
                        <div className="flex flex-row gap-2">
                          <UserImage image={user.image || ""} />
                          <button className="flex flex-col">
                            <Username name={user.name || ""} />
                            <p className=" text-sm text-gray-600">
                              {user.followers}
                              <span> Followers</span>
                            </p>
                          </button>
                        </div>
                      </Link>
                      <FollowButton
                        followingId={user.id}
                        viewer={{ hasFollowed: viewer?.hasFollowed }}
                      />
                    </div>
                    <Description
                      text={video.description || ""}
                      length={200}
                      border={true}
                    />
                  </div>
                </div>
                <CommentSection
                  videoId={video.id}
                  comments={data.comments.map(({ user, Comment }) => ({
                    comment: {
                      id: Comment.id,
                      message: Comment.message,
                      createdAt: Comment.createdAt,
                    },
                    user: {
                      id: user.id,
                      name: user.name,
                      image: user.image,
                      handle: user.handle,
                    },
                  }))}
                  refetch={refetch}
                />
              </div>
            </>
          )}
          <div className="px-4 lg:w-2/5 lg:px-0">
            {!sidebarVideos || sidebarError ? (
              <DataError />
            ) : (
              <SmallSingleColumnVideo
                refetch={refetchSidebarVideos}
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
