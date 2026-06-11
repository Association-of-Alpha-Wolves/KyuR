import { PackageCheck } from "lucide-react";

export default function Brand() {
  return (
    <div className="brand">
      <div className="brandMark">
        <PackageCheck size={34} />
      </div>
      <div>
        <strong>KyuR</strong>
        <span></span>
      </div>
    </div>
  );
}