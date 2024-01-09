import { Plus } from "../Icons/Icons";
import { Button } from "./Buttons";

export default function UploadButton() {
  return (
    <>
      <Button variant="primary" size="2xl" className="ml-2 flex">
        <Plus className="mr-2 h-5 w-5 shrink-0 stroke-white" />
        Upload
      </Button>
    </>
  );
}
