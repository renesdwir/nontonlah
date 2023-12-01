export default function LoadingMessage() {
  return (
    <div className="relative mt-16 flex w-full flex-col items-center justify-center gap-2 text-center text-[#11999E]">
      <div className="flex flex-row-reverse items-center gap-x-4">
        <strong>Loading...</strong>
        <div className="ml-auto inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
      </div>
    </div>
  );
}
