import Image from "next/image";
import Link from "next/link";
import { Thumbnail } from "./Components";
import moment from "moment";

interface VideoComponentProps {
  videos: {
    id: string;
    title: string;
    thumbnail: string;
    createdAt: Date;
    views: number;
  }[];
  users: {
    name: string;
    image: string;
  }[];
  refetch?: () => Promise<unknown>;
}
export const MultiColumnVideo: React.FC<VideoComponentProps> = ({
  users,
  videos,
}) => {
  return (
    <div className="mx-auto grid grid-cols-1 gap-x-4 gap-y-8 md:mx-0 md:max-w-none md:grid-cols-2 lg:mx-0 lg:max-w-none lg:grid-cols-3 ">
      {videos.map((video, index) => {
        const user = users[index];
        if (!user) return null;
        return (
          <Link
            href={`/video/${video.id}`}
            key={video.id}
            className="flex flex-col items-start justify-between hover:bg-gray-100"
          >
            <div className="relative w-full">
              <Thumbnail thumbnailUrl={video.thumbnail} />
              <div className="max-w-xl">
                <div className=" relative mt-4 flex gap-x-4 ">
                  <UserImage image={user.image || ""} />
                  <div className="w-full">
                    <VideoTitle title={video.title} limitHeight={true} />
                    <VideoInfo
                      views={video.views}
                      createdAt={video.createdAt}
                    />
                    <Username name={user.name || ""} />
                  </div>
                </div>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
};
export const SingleColumnVideo: React.FC<VideoComponentProps> = ({
  users,
  videos,
}) => {
  return (
    <div>
      {videos.map((video, index) => {
        const user = users[index];
        if (!user) return null;
        return (
          <Link href={`/video/${video.id}`} key={video.id}>
            <div className="my-5 flex flex-col gap-4 hover:bg-gray-100 lg:flex-row">
              <div className="sm:aspect[2/1] relative aspect-[16/9] lg:w-64 lg:shrink-0">
                <Thumbnail thumbnailUrl={video.thumbnail} />
              </div>
              <div>
                <VideoTitle title={video.title} />
                <VideoInfo views={video.views} createdAt={video.createdAt} />
                <div className="relative mt-2 flex flex-row items-center gap-x-4">
                  <UserImage image={user.image || ""} />
                  <Username name={user.name || ""} />
                </div>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
};

export const SmallSingleColumnVideo: React.FC<VideoComponentProps> = ({
  users,
  videos,
  refetch,
}) => (
  <div>
    {videos.map((video, index) => {
      const user = users[index];
      if (!user) return null;
      return (
        <Link href={`/video/${video.id}`} key={video.id} onClick={refetch}>
          <div className="relative isolate my-4 flex flex-col gap-4 rounded-2xl border hover:bg-gray-100 lg:flex-row">
            <div className="aspect[16/9] sm:aspect-[2/1] lg:w-52 lg:shrink-0">
              <Thumbnail thumbnailUrl={video.thumbnail} />
            </div>
            <div className="mt-2 flex w-full flex-col items-start overflow-hidden text-xs max-lg:mx-2">
              <VideoTitle
                title={video.title}
                limitHeight={true}
                limitSize={true}
              />
              <VideoInfo views={video.views} createdAt={video.createdAt} />
              <Username name={user.name || ""} />
            </div>
          </div>
        </Link>
      );
    })}
  </div>
);

export function VideoTitle({
  title,
  limitHeight,
  limitSize,
}: {
  title: string;
  limitHeight?: boolean;
  limitSize?: boolean;
}) {
  return (
    <h1
      className={`max-w-md font-semibold leading-6 text-gray-900 group-hover:text-gray-600 ${
        limitSize ? "text-base" : "text-lg"
      }  ${limitHeight ? "max-h-12 w-full overflow-hidden " : ""}`}
    >
      {title}
    </h1>
  );
}

export function VideoInfo({
  views,
  createdAt,
}: {
  views: number;
  createdAt: Date | string;
}) {
  return (
    <div className="mt-1 flex max-h-6 items-start overflow-hidden text-sm">
      <p className="text-gray-600">
        {views}
        <span> Views</span>
      </p>
      <li className="pl-2 text-sm text-gray-500"></li>
      <p className="text-gray-400">{moment(createdAt).fromNow()}</p>
    </div>
  );
}

export function Username({ name }: { name: string }) {
  return (
    <p className="max-h-6 overflow-hidden text-sm font-semibold leading-6 text-gray-900">
      {name}
    </p>
  );
}
export function UserImage({
  image,
  className = "",
}: {
  image: string;
  className?: string;
}) {
  return (
    <div className={`relative h-9 w-9 ${className}`}>
      <Image
        src={image || "/profile.jpg"}
        alt=""
        className="absolute rounded-full"
        fill
      />
    </div>
  );
}
