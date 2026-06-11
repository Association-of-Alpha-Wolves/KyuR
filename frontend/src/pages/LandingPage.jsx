import { Link } from "react-router-dom";
import {
  BadgeCheck,
  Clock,
  Globe2,
  MapPinned,
  QrCode,
  Search,
  ShieldCheck,
  Smartphone,
  ClipboardList,
  RotateCcw,
} from "lucide-react";
import PublicNav from "../components/PublicNav";

const benefits = [
  ["Instant Identification", Search],
  ["Easy Scanning", QrCode],
  ["Secure and Private", ShieldCheck],
  ["Faster Recovery", Clock],
  ["Accessible Anywhere", Globe2],
  ["Smart Tracking", MapPinned],
];

const steps = [
  ["Register Item", ClipboardList, "Step 1"],
  ["Generate QR", QrCode, "Step 2"],
  ["Scan & Report", Smartphone, "Step 3"],
  ["Recover Item", RotateCcw, "Step 4"],
];

export default function LandingPage() {
  return (
    <main className="landingPage">
      <PublicNav />

      <section className="homeHero">
        <div className="heroCopy">
          <h1>LOST SOMETHING?</h1>
          <h2>
            Find It Faster with <span>KyuR (KuickReturn)</span>
          </h2>
          <p>
            KyuR is a smart lost-and-found platform that improves item recovery
            through QR-based identification and secure communication.
          </p>

          <div className="heroButtons">
            <Link to="/register" className="bigBlueBtn">
              Get started
            </Link>
            <Link to="/login" className="bigWhiteBtn">
              Learn more
            </Link>
          </div>
        </div>

        <div className="heroProduct">
          <div className="bagMock">
            <div className="bagHandle" />
            <div className="bagPocket" />
          </div>

          <div className="phoneCard">
            <div className="phoneTop">7:30</div>
            <div className="phoneIcon">
              <BadgeCheck size={54} />
            </div>
            <strong>Item Found!</strong>
            <QrCode size={86} />
            <button>Report Found Item</button>
          </div>
        </div>

        <aside className="whyCard">
          <h3>Why choose KyuR?</h3>
          <div className="benefitGrid">
            {benefits.map(([label, Icon]) => (
              <article key={label}>
                <Icon size={58} />
                <span>{label}</span>
              </article>
            ))}
          </div>
        </aside>
      </section>

      <section className="lowerHome" id="how-it-works">
        <div className="howPanel">
          <h3>How It Works?</h3>
          <div className="stepGrid">
            {steps.map(([title, Icon, label]) => (
              <article key={title}>
                <h4>{title}</h4>
                <Icon size={72} />
                <p>{label}</p>
              </article>
            ))}
          </div>
        </div>

        <div className="protectPanel" id="management">
          <ShieldCheck size={96} />
          <div>
            <h3>Start Protecting Your Belongings Today</h3>
            <p>
              Join KyuR and experience a smarter way to recover lost items using
              recovery technology.
            </p>
            <Link to="/register" className="createAccountBtn">
              Create Account
            </Link>
          </div>
        </div>
      </section>
      
    </main>
  );
}