import { NextPage } from "next";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import {
  ErrorMessage,
  Layout,
  LoadingMessage,
  ProfileHeader,
} from "~/components/Components";
import { api } from "~/utils/api";

const ProfileVideos: NextPage = () => {
  const router = useRouter();
  const { userId } = router.query;
  const { data: sessionData } = useSession();
  const { data, isLoading, error, refetch } =
    api.announcement.getAnnouncementsByUserId.useQuery({
      id: userId as string,
      viewerId: sessionData?.user.id,
    });

  const announcements = data?.annoucements;
  const errorTypes = error || announcements?.length == 0 || !data;
  const Error = () => {
    if (isLoading) {
      return <LoadingMessage />;
    } else if (userId == sessionData?.user.id && errorTypes) {
      return (
        <ErrorMessage
          icon="GreenHorn"
          message="No Announcements"
          description="You have yet to make an announcement. Post one now!"
        />
      );
    } else if (errorTypes) {
      return (
        <ErrorMessage
          icon="GreenHorn"
          message="No Announcements"
          description="This page has yet to make an announcement."
        />
      );
    } else {
      return <></>;
    }
  };
  return (
    <>
      <Layout>
        <>
          <ProfileHeader />

          {errorTypes ? (
            <Error />
          ) : (
            <>
              <p>Profile Announcement</p>
            </>
          )}
        </>
      </Layout>
    </>
  );
};
