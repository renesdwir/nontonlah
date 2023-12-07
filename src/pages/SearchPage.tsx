import { signIn, signOut, useSession } from "next-auth/react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
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
import { SingleColumnVideo } from "~/components/VideoComponent";

import { api } from "~/utils/api";

const SearchPage: NextPage = () => {
  const router = useRouter();
  const searchQuery = router.query.q;
  const { data, error, isLoading } = api.video.getVideoBySearch.useQuery(
    searchQuery as string,
    {
      refetchOnWindowFocus: false,
      enabled: Boolean(searchQuery),
    },
  );
  const Error = () => {
    if (isLoading) {
      return <LoadingMessage />;
    } else if (error || !data) {
      return (
        <ErrorMessage
          message="No Videos"
          description="Sorry try another search result ."
        />
      );
    } else {
      return <></>;
    }
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
          <SingleColumnVideo
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
export default SearchPage;
