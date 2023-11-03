import { useRouter } from "next/router";
import { classNames } from "~/utils/helper";
import {
  ClockRewind,
  Folder,
  Home,
  Settings,
  ThumbsUp,
  UserCheck,
  VideoRecorder,
} from "./Icons/Icons";
import Link from "next/link";
import { signIn, useSession } from "next-auth/react";
import { useEffect } from "react";

interface SidebarProps {
  isOpen?: boolean;
  openSidebar?: (open: boolean) => void;
  closeSidebar?: (open: boolean) => void;
}
interface NavigationItem {
  name: string;
  path?: string;
  icon: (className: string) => JSX.Element;
  current: boolean;
}
export default function Sidebar({
  isOpen,
  closeSidebar,
  openSidebar,
}: SidebarProps) {
  const router = useRouter();
  const { data: sessionData } = useSession();
  const userId = sessionData?.user.id;

  const DesktopNavigation: NavigationItem[] = [
    {
      name: "Home",
      path: `/`,
      icon: (className) => <Home className={className} />,
      current: router.pathname === "/",
    },
    {
      name: "Liked Videos",
      path: userId ? "/playlist/LikedVideos" : "sign-in",
      icon: (className) => <ThumbsUp className={className} />,
      current: router.pathname === "/playlist/LikedVideos",
    },
    {
      name: "History",
      path: userId ? `/playlist/History` : "sign-in",
      icon: (className) => <ClockRewind className={className} />,
      current: router.pathname === `/playlist/History`,
    },
    {
      name: "Your Videos",
      path: userId ? `/${String(userId)}/ProfileVideos` : "sign-in",
      icon: (className) => <VideoRecorder className={className} />,
      current: router.asPath === `/${String(userId)}/ProfileVideos`,
    },
    {
      name: "Library",
      path: userId ? `/${String(userId)}/ProfilePlaylists` : "sign-in",
      icon: (className) => <Folder className={className} />,
      current: router.asPath === `/${String(userId)}/ProfilePlaylists`,
    },
    {
      name: "Following",
      path: userId ? `/${String(userId)}/ProfileFollowing` : "sign-in",
      icon: (className) => <UserCheck className={className} />,
      current: router.asPath === `/${String(userId)}/ProfileFollowing`,
    },
  ];
  useEffect(() => {
    DesktopNavigation.forEach((nav) => {
      nav.current = nav.path === router.pathname;
    });
  }, [router.pathname]);
  return (
    <>
      <div
        className={classNames(
          closeSidebar ? "lg:w-20" : "lg:w-56",
          "bottom-0  top-16 hidden  lg:fixed lg:z-40 lg:flex lg:flex-col",
        )}
      >
        <div className="flex grow flex-col gap-y-5 overflow-y-auto border border-gray-200 bg-white px-6 pb-4">
          <nav className="flex flex-1 flex-col pt-8">
            <ul role="list" className="flex flex-1 flex-col gap-y-7">
              <li>
                <ul role="list" className="-mx-2 space-y-1">
                  {DesktopNavigation.map((item) => (
                    <li key={item.name}>
                      <Link
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          if (item.path === "sign-in") {
                            void signIn();
                          } else {
                            void router.push(item.path || "/");
                          }
                        }}
                        className={classNames(
                          item.current
                            ? " bg-gray-50 text-primary-600"
                            : " text-gray-700 hover:bg-gray-50 hover:text-primary-600",
                          "group flex gap-x-3 rounded-md p-2 text-sm font-semibold leading-6",
                        )}
                      >
                        {item.current
                          ? item.icon("h-5 w-5 shrink-0 stroke-primary-600")
                          : item.icon(
                              "h-5 w-5 shrink-0 stroke-gray-500 group-hover:stroke-primary-600",
                            )}
                        <p className={classNames(closeSidebar ? "hidden" : "")}>
                          {item.name}
                        </p>
                      </Link>
                    </li>
                  ))}
                </ul>
              </li>
              <li className="mt-auto">
                <Link
                  href={"#"}
                  className="group -mx-2 flex items-center gap-x-3 rounded-md p-2 text-sm font-semibold leading-6 text-gray-700 hover:bg-gray-50 hover:text-primary-600"
                  onClick={(e) => {
                    e.preventDefault();
                    sessionData ? void router.push("/Settings") : void signIn();
                  }}
                >
                  <Settings className="h-5 w-5 shrink-0 stroke-gray-500 group-hover:stroke-primary-600" />
                  <p className={classNames(closeSidebar ? "hidden" : "")}>
                    Settings
                  </p>
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </>
  );
}
