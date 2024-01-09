import { NextPage } from "next";
import { useSession } from "next-auth/react";
import Head from "next/head";
import { UploadButton } from "~/components/Buttons/Buttons";
import { ErrorMessage, Layout, LoadingMessage } from "~/components/Components";
import { GreenEye, GreenHeart, GreenUserCheck } from "~/components/Icons/Icons";
import { api } from "~/utils/api";
interface StatsItem {
  name: string;
  stat: string;
  icon: (className: string) => JSX.Element;
}
const Dashboard: NextPage = () => {
  const { data: sessionData } = useSession();
  const userId = sessionData?.user.id;
  const { data, isLoading, error, refetch } =
    api.user.getDashboardData.useQuery(userId as string);

  const Error = () => {
    if (isLoading) {
      return <LoadingMessage />;
    } else if (error || !data) {
      return (
        <ErrorMessage
          icon="GreenPeople"
          message="Error loading channel"
          description="Sorry there is an error at this time."
        />
      );
    } else {
      return <></>;
    }
  };
  const stats: StatsItem[] = [
    {
      name: "Total Views",
      stat: data?.totalViews?.toString() || "0",
      icon: (className) => <GreenEye className={className} />,
    },
    {
      name: "Total followers",
      stat: data?.totalFollowers?.toString() || "0",
      icon: (className) => <GreenUserCheck className={className} />,
    },
    {
      name: "Total likes",
      stat: data?.totalLikes?.toString() || "0",
      icon: (className) => <GreenHeart className={className} />,
    },
  ];
  return (
    <>
      <Head>
        <title>Creator Studio - Nontonlah</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Layout closeSidebar={true}>
        <>
          {!data ? (
            <Error />
          ) : (
            <div className="flex flex-col gap-8 bg-white px-4 pt-2 shadow sm:rounded-lg">
              <div className="md:flex md:items-center md:justify-between md:space-x-5">
                <div className="flex items-start space-x-5">
                  <div className="pt-1.5">
                    <h1 className="text-2xl font-bold text-gray-900">
                      <span>Welcome Back </span> {sessionData?.user.name}
                    </h1>
                    <p className="text-sm font-medium text-gray-500">
                      Track and manage your channel and videos
                    </p>
                  </div>
                </div>
                <div className="mt-6 flex flex-col-reverse justify-stretch space-y-4 space-y-reverse sm:flex-row-reverse sm:justify-end sm:space-x-3 sm:space-y-0 sm:space-x-reverse md:mt-0 md:flex-row md:space-x-3">
                  <UploadButton />
                </div>
              </div>
              <div>
                <dl className="mt-5 grid grid-cols-1 divide-y divide-gray-200 overflow-hidden rounded-2xl border border-gray-200  shadow-sm   md:grid-cols-3 md:divide-x md:divide-y-0">
                  {stats.map((item) => (
                    <div key={item.name} className="px-4 py-5 sm:p-6">
                      {item.icon("h-4 w-4 ")}
                      <dt className="text-base font-normal text-gray-900">
                        {item.name}
                      </dt>
                      <dd className="mt-1 text-3xl font-semibold text-primary-600 md:block lg:flex">
                        {item.stat}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
            </div>
          )}
        </>
      </Layout>
    </>
  );
};

export default Dashboard;
