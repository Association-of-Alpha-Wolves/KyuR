import {
  BriefcaseBusiness,
  GraduationCap,
  Monitor,
  Plane,
  ShoppingCart,
} from "lucide-react";
import PublicNav from "../components/PublicNav";
import AnimatedBg from "../components/AnimatedBg";

const targetUsers = [
  ["Students", GraduationCap],
  ["Employees", BriefcaseBusiness],
  ["Travelers", Plane],
  ["Office", Monitor],
  ["Mall", ShoppingCart],
];

const wrap = { maxWidth: 1080, margin: "0 auto", padding: "0 28px" };

export default function AboutPage() {
  return (
    <main className="aboutScreen" style={{ position: "relative" }}>
      <AnimatedBg />

      <div style={{ position: "relative", zIndex: 1 }}>
        <PublicNav />

        <section className="aboutTop" style={{ ...wrap, padding: "52px 28px 28px" }}>
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
        </section>

        <section className="aboutCardsGrid" style={{ ...wrap, padding: "0 28px 64px" }}>
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
        </section>
      </div>
    </main>
  );
}
