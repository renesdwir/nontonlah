import { useState } from "react";
import Menu from "./Icons/Menu";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

interface LayoutProps {
  children: JSX.Element;
  closeSidebar?: boolean;
}
export default function Layout({ children, closeSidebar }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  return (
    <>
      <Navbar>
        <button
          type="button"
          className="-mx-2 inline-flex items-center justify-center rounded-md p-2 focus:outline-none"
        >
          <Menu className="h-6 w-6 stroke-gray-400" aria-hidden="true" />
        </button>
      </Navbar>
      <Sidebar
        isOpen={sidebarOpen}
        closeSidebar={setSidebarOpen}
        openSidebar={setSidebarOpen}
      ></Sidebar>
      <div className="space-x-4">{children}</div>
    </>
  );
}
