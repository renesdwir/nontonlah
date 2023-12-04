import { GreenHorn, GreenPeople, GreenPlay } from "./Icons/Icons";

interface ErrorMessageProps {
  children?: React.ReactNode;
  icon?: "GreenHorn" | "GreenPeople" | undefined;
  message: string;
  description?: string;
}

export default function ErrorMessage(props: ErrorMessageProps) {
  const IconSelection = ({
    icon,
    className,
  }: {
    icon?: string;
    className: string;
  }) => {
    if (icon === "GreenHorn") return <GreenHorn className={className} />;
    else if (icon === "GreenPeople")
      return <GreenPeople className={className} />;
    else return <GreenPlay className={className} />;
  };
  return (
    <div className="relative mt-16 flex w-full flex-col items-center justify-center gap-2 text-center">
      <IconSelection className=" items-center" icon={props.icon} />
      <h1 className="text-2xl font-semibold text-gray-600">{props.message}</h1>
      <p className="max-w-xs text-gray-600">{props.description}</p>
      {props.children}
    </div>
  );
}
