import kyurLogo from "../assets/logo-kyur.svg";

export default function Brand() {
  return (
    <div className="brand">
      <img src={kyurLogo} alt="KyuR Logo" style={{ height: 40, width: "auto", display: "block", transform: "scale(2)", transformOrigin: "left center", marginLeft: -25 }} />
    </div>
  );
}
