import { Link } from "react-router-dom";
import {
  BadgeCheck,
  BriefcaseBusiness,
  Clock,
  Globe2,
  GraduationCap,
  MapPinned,
  Monitor,
  Plane,
  QrCode,
  Search,
  ShieldCheck,
  ShoppingCart,
  Smartphone,
  ClipboardList,
  RotateCcw,
} from "lucide-react";
import PublicNav from "../components/PublicNav";
import AnimatedBg from "../components/AnimatedBg";
import blueBag from "../assets/bluebag-1.svg";
import phoneLanding from "../assets/phone-landing.svg";

const benefits = [
  ["Instant ID", Search],
  ["Easy Scanning", QrCode],
  ["Secure & Private", ShieldCheck],
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

const targetUsers = [
  ["Students", GraduationCap],
  ["Employees", BriefcaseBusiness],
  ["Travelers", Plane],
  ["Office", Monitor],
  ["Mall", ShoppingCart],
];

const teamMembers = [
  "Dañganan, Marian",
  "Agalabia, Kristine Grace",
  "Biong, Yuan Dominique",
  "Conception, Jay Lourence",
  "Custodio, Cyril",
  "Gomez, Josevero",
  "Lardizabal, Farhana",
  "Patron, Jimuelle",
  "Pugosa, Jhake",
  "Rodriguez, Sabina",
  "Sace, Kyle",
  "Tesado, Alyssa",
  "Tombocon, France Norris",
  "Tiburcio, Yancy Allen"
];

const wrap = { maxWidth: 1080, margin: "0 auto", padding: "0 28px" };

export default function LandingPage() {
  return (
    <main className="landingPage" style={{ position: "relative" }}>
      <AnimatedBg />

      <div style={{ position: "relative", zIndex: 1 }}>
        <PublicNav showScrollProgress />

        {/* ── HOME ─────────────────────────────────── */}
        <section
          id="home"
          style={{ ...wrap, padding: "64px 28px 40px", display: "grid", gridTemplateColumns: "1fr 0.6fr", gap: 52, alignItems: "center" }}
        >
          <div className="heroCopy">
            <h1>LOST SOMETHING?</h1>
            <h2>
              Find It Faster with <span>KyuR (KuickReturn)</span>
            </h2>
            <p>
              A smart lost-and-found platform built for PUP — recover lost items
              faster through QR-based identification and secure real-time messaging.
            </p>
            <div className="heroButtons">
              <Link to="/register" className="bigBlueBtn">Get started</Link>
              <a href="#about" className="bigWhiteBtn">Learn more</a>
            </div>
          </div>

          <div className="heroProduct">
            <div style={{ position: "relative", display: "inline-block", transform: "translateX(-25px)" }}>
              <img src={blueBag} alt="Blue bag" style={{ width: 500, height: "auto", display: "block" }} />
              <img src={phoneLanding} alt="Phone mockup" style={{ width: 580, height: "auto", display: "block", position: "absolute", bottom: -105, right: -150 }} />
            </div>
          </div>
        </section>

        {/* ── BENEFITS ─────────────────────────────── */}
        <section id="why-choose-kyur" style={{ ...wrap, padding: "0 28px 44px" }}>
          <div className="whyCard">
            <h3>Why choose KyuR?</h3>
            <div className="benefitGrid">
              {benefits.map(([label, Icon]) => (
                <article key={label}>
                  <Icon size={36} />
                  <span>{label}</span>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ── HOW IT WORKS ─────────────────────────── */}
        <section
          id="how-it-works"
          style={{ ...wrap, padding: "0 28px 72px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 22, alignItems: "stretch" }}
        >
          <div className="howPanel">
            <h3>How It Works</h3>
            <div className="stepGrid">
              {steps.map(([title, Icon, label]) => (
                <article key={title}>
                  <Icon size={32} />
                  <h4>{title}</h4>
                  <p>{label}</p>
                </article>
              ))}
            </div>
          </div>

          <div className="protectPanel">
            <ShieldCheck size={44} />
            <div>
              <h3>Start Protecting Your Belongings</h3>
              <p>
                Join KyuR and experience a smarter, faster way to recover lost
                items using QR-based technology built for the PUP community.
              </p>
              <Link to="/register" className="createAccountBtn">
                Create Account
              </Link>
            </div>
          </div>
        </section>

        {/* ── ABOUT ────────────────────────────────── */}
        <section id="about" style={{ ...wrap, padding: "0 28px 80px" }}>
          <div style={{ borderTop: "1px solid var(--border)", paddingTop: 56 }}>

            <div className="aboutTop" style={{ padding: "0 0 32px" }}>
              <div className="aboutHeading">
                <div className="aboutTitle">
                  <h1>
                    About <span style={{ background: "linear-gradient(135deg, var(--blue), var(--cyan))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text", color: "transparent" }}>KyuR</span>
                  </h1>
                </div>
                <p>Improving Item Recovery Using a QR-Based Lost and Found System</p>
              </div>

              <div className="targetUsersBox">
                <h2>Target Users</h2>
                <div className="targetUsersGrid">
                  {targetUsers.map(([label, Icon]) => (
                    <article key={label}>
                      <Icon size={40} strokeWidth={2} />
                      <strong>{label}</strong>
                    </article>
                  ))}
                </div>
              </div>
            </div>

            <div className="aboutCardsGrid" style={{ padding: 0 }}>
              <article className="aboutColumn">
                <h2>About the Project</h2>
                <div className="aboutCard">
                  <p>
                    KyuR aims to modernize traditional lost-and-found processes
                    through QR code technology. Many lost items remain unrecovered
                    because owners cannot easily be identified or contacted.
                  </p>
                  <p>
                    This system connects found items directly to their owners using
                    unique QR codes, making the recovery process faster, easier, and
                    more effective.
                  </p>
                </div>
              </article>

              <article className="aboutColumn">
                <h2>Objectives</h2>
                <div className="aboutCard">
                  <ul>
                    <li>Develop a digital lost-and-found management system</li>
                    <li>Improve item recovery efficiency using QR codes</li>
                    <li>Provide secure communication between finders and owners</li>
                    <li>Reduce the number of permanently lost belongings</li>
                    <li>Promote responsible handling of found items</li>
                  </ul>
                </div>
              </article>

              <article className="aboutColumn">
                <h2>Mission & Vision</h2>
                <div className="aboutCard">
                  <p>
                    To create a fast, secure, and user-friendly QR-based platform
                    that improves the recovery of lost belongings through technology
                    and community cooperation.
                  </p>
                  <p>
                    To become a reliable and innovative solution for lost-and-found
                    management in schools, workplaces, and public communities.
                  </p>
                </div>
              </article>
            </div>

          </div>
        </section>

        {/* ── FOOTER ───────────────────────────────── */}
        <footer className="landingFooter">
          <div className="footerContent">
            <h3>Meet the Team</h3>
            <div className="membersList">
              {teamMembers.map((member, idx) => (
                <span key={idx} className="memberBadge">{member}</span>
              ))}
            </div>
          </div>
          <div className="footerBottom">
            <p>&copy; {new Date().getFullYear()} KyuR. All rights reserved.</p>
          </div>
        </footer>
      </div>
    </main>
  );
}
