import {
  BriefcaseBusiness,
  GraduationCap,
  Info,
  Monitor,
  Plane,
  ShoppingCart,
} from "lucide-react";
import PublicNav from "../components/PublicNav";

const targetUsers = [
  ["Students", GraduationCap],
  ["Employees", BriefcaseBusiness],
  ["Travelers", Plane],
  ["Office", Monitor],
  ["Mall", ShoppingCart],
];

export default function AboutPage() {
  return (
    <main className="aboutScreen">
      <PublicNav />

      <section className="aboutTop">
        <div className="aboutHeading">
          <div className="aboutTitle">
            <h1>About KyuR</h1>
            <Info size={76} strokeWidth={3.2} />
          </div>

          <p>
            Improving Item Recovery Using a QR-Based Lost and Found System
          </p>
        </div>

        <div className="targetUsersBox">
          <h2>Target Users</h2>

          <div className="targetUsersGrid">
            {targetUsers.map(([label, Icon]) => (
              <article key={label}>
                <Icon size={82} strokeWidth={2.8} />
                <strong>{label}</strong>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="aboutCardsGrid">
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
              <li>To develop a digital lost-and-found management system</li>
              <li>To improve item recovery efficiency using QR codes</li>
              <li>To provide secure communication between finders and owners</li>
              <li>To reduce the number of permanently lost belongings</li>
              <li>To promote responsible handling of found items</li>
            </ul>
          </div>
        </article>

        <article className="aboutColumn">
          <h2>Mission & Vision</h2>
          <div className="aboutCard">
            <p>
              To create a fast, secure, and user-friendly QR-based platform that
              improves the recovery of lost belongings through technology and
              community cooperation.
            </p>

            <p>
              To become a reliable and innovative solution for lost-and-found
              management in schools, workplaces, and public communities.
            </p>
          </div>
        </article>
      </section>
    </main>
  );
}