import moment from "moment";
import { NextPage } from "next";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { AnnouncementButton } from "~/components/Buttons/Buttons";
import {
  ErrorMessage,
  Layout,
  LoadingMessage,
  ProfileHeader,
  UserImage,
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
            <ul role="list" className="-pt-8 divide-y divide-gray-200">
              {announcements
                ?.sort(
                  (a, b) =>
                    new Date(b.createdAt).getTime() -
                    new Date(a.createdAt).getTime(),
                )
                .map((announcement, index) => {
                  const user = data.user[index];
                  if (!user) {
                    return null;
                  }
                  return (
                    <li className="pt-4" key={announcement.id}>
                      <div className="flex gap-2">
                        <UserImage image={user.image || ""} />
                        <div className="flex w-full flex-col ">
                          <div className="flex flex-col">
                            <div className="flex flex-row items-start gap-2 text-xs">
                              <p className="w-max text-sm font-semibold leading-6 text-gray-900">
                                {user.name}
                              </p>
                              <p className="text-sm text-gray-600">
                                {moment(announcement.createdAt).fromNow()}
                              </p>
                            </div>
                            <p className="text-sm text-gray-600">
                              {user.handle}
                            </p>
                          </div>
                          <p className="my-2 text-sm text-gray-600">
                            {announcement.message}
                          </p>
                          <AnnouncementButton />
                        </div>
                      </div>
                    </li>
                  );
                })}
            </ul>
          )}
        </>
      </Layout>
    </>
  );
};
