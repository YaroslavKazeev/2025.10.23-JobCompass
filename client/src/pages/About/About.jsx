import "./About.css";

import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { images } from "../../assets";
import {
  Filter,
  Map,
  Lock,
  User,
  Heart,
  Zap,
  Compass,
  Target,
} from "lucide-react";

export default function About() {
  const location = useLocation();

  useEffect(() => {
    const nodes = document.querySelectorAll("[data-about-reveal]");
    if (!nodes.length) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("about-reveal--visible");
          observer.unobserve(entry.target);
        });
      },
      { rootMargin: "0px 0px -40px 0px", threshold: 0.12 },
    );
    nodes.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (location.hash !== "#contact") return;
    document.getElementById("contact")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }, [location.pathname, location.hash]);

  const contributors = [
    {
      name: "Yaroslav Kazeev",
      role: "HYF trainee",
      avatar: images.yaroslavAvatar,
      description:
        "The main instigator and disruptor of the project. He realized that many job search sites produce results that are irrelevant to the applicant, and figured out how to make them customizable. Combined big-picture vision with the hands-on implementation of core features.",
      gitHub: "https://github.com/YaroslavKazeev",
      linkedin: "https://www.linkedin.com/in/yaroslavkazeev/",
    },
    {
      name: "Hanna Dubyna",
      role: "HYF trainee",
      avatar: images.hannaAvatar,
      description:
        "Led UI/UX design and brought key features to life — from route calculation and Firebase-powered avatar uploads to LinkedIn API integration, guest user experience, and database connection. Also built the About page and core navigation.",
      gitHub: "https://github.com/HannaInIT",
      linkedin: "https://www.linkedin.com/in/hanna-dubyna/",
    },

    {
      name: "Yahya Al-Ademi",
      role: "HYF trainee",
      avatar: images.yahyaAvatar,
      description:
        "Designed and implemented the full authentication architecture for the application, covering secure backend workflows (user registration, login, hashing, token-based password reset, email delivery) and complete frontend integration using React Context, ensuring seamless communication between client and server.",
      gitHub: "https://github.com/YahyaAl-Ademi",
      linkedin: "https://www.linkedin.com/in/yahya-al-ademi-12786555/",
    },
    {
      name: "Stas Seldin",
      role: "DevOps",
      avatar: images.stasAvatar,
      description:
        "Our DevOps, Education Director and technical compass who provided invaluable guidance on everything from database configuration to deployment strategies during weekly Tech Hours, ensuring that the team could tackle any challenge with confidence.",
      gitHub: "https://github.com/stasel",
      linkedin: "https://www.linkedin.com/in/stasel/",
    },

    {
      name: "Jana Gombitová",
      role: "Product Owner",
      avatar: images.janaAvatar,
      description:
        "Our Product Owner, Scrum Master and guiding light — translating user needs into clear features, providing invaluable design feedback, teaching us industry best practices, keeping the team aligned, and helping us build a product that truly serves its users.",
      gitHub: "https://github.com/janagombitova",
      linkedin:
        "https://www.linkedin.com/in/jana-gombitova-42b08394?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=ios_app",
    },

    {
      name: "Tim Lorent",
      role: "Tech lead",
      avatar: images.timAvatar,
      description:
        "Our Tech Lead who guided us through technical sessions, helping us navigate challenges, distribute responsibilities, and establish effective development workflows — especially during the critical early stages of the project.",
      gitHub: "https://github.com/tlorent",
      linkedin: "https://www.linkedin.com/in/timlorent/",
    },
  ];

  const features = [
    {
      icon: <Filter className="feature-icon" />,
      title: "Smart filtering and sorting",
      description:
        "Filter by job type, work mode, and experience level, and sort listings based on what matters most to you — all in one flexible tool.",
    },
    {
      icon: <Zap className="feature-icon" />,
      title: "Smart matching",
      description: "Real-time job search with smart matching feature",
    },
    {
      icon: <Map className="feature-icon" />,
      title: "Commute calculator",
      description:
        "See travel time and number of transfers from your home to workplace",
    },

    {
      icon: <Heart className="feature-icon" />,
      title: "Save to favorites",
      description: "Mark interesting job posts to easily view them later",
    },

    {
      icon: <Lock className="feature-icon" />,
      title: "Secure and modern architecture",
      description:
        "Meets modern security standards, secure authentication, and protection against malicious scripts.",
    },

    {
      icon: <User className="feature-icon" />,
      title: "User-friendly interface",
      description: "Intuitive design makes job discovery fast and efficient",
    },
  ];

  function handleContactSubmit(e) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    const name = (data.get("name") ?? "").toString().trim();
    const email = (data.get("email") ?? "").toString().trim();
    const message = (data.get("message") ?? "").toString().trim();

    let body = "";
    if (name) body += `${name}\n`;
    if (email) body += `${email}\n`;
    if (name || email) body += "\n";
    body += message;

    const subject = "Question about JobCompass";
    window.location.href = `mailto:jobcompass2025@gmail.com?subject=${encodeURIComponent(
      subject,
    )}&body=${encodeURIComponent(body)}`;
  }

  return (
    <div className="about-page content-container">
      <main className="about-main">
        <section
          className="about-hero about-reveal"
          data-about-reveal
          aria-labelledby="about-page-title"
        >
          <div className="about-hero__backdrop" aria-hidden />
          <div className="about-hero__inner">
            <h1 id="about-page-title" className="about-title">
              About the project
            </h1>
          </div>
        </section>

        {/* Project Overview */}
        <div className="project-overview">
          <div
            className="overview-highlight-card overview-item about-reveal"
            data-about-reveal
          >
            <span className="overview-accent" aria-hidden />
            <div className="overview-text">
              <div className="overview-heading-row">
                <span className="overview-icon-wrap" aria-hidden>
                  <Compass className="overview-section-icon" />
                </span>
                <h3>What We Do</h3>
              </div>
              <p>
                We help you find ideal positions with advanced filtering
                capabilities that go beyond traditional job boards. Our platform
                offers a comprehensive search experience tailored to your needs.
              </p>
            </div>
          </div>

          <div
            className="overview-highlight-card overview-item about-reveal"
            data-about-reveal
          >
            <span className="overview-accent" aria-hidden />
            <div className="overview-text">
              <div className="overview-heading-row">
                <span className="overview-icon-wrap" aria-hidden>
                  <Target className="overview-section-icon" />
                </span>
                <h3>Our mission</h3>
              </div>
              <p>
                Connect talented professionals with opportunities that match
                their skills, preferences, and career goals.
              </p>
            </div>
          </div>
        </div>

        {/* Key Features */}
        <div className="about-section-bundle about-reveal" data-about-reveal>
          <h2>Key Features</h2>
          <div className="features-grid">
            {features.map((feature, index) => (
              <div key={index} className="feature-card">
                <div className="icon-wrapper">{feature.icon}</div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="about-section-bundle about-reveal" data-about-reveal>
          <h2 className="contributors-title">Contributors</h2>

          <div className="contributor-grid-flex">
            {contributors.map((contributor, index) => (
              <div key={index} className="contributor-card">
                <div className="contributor-content">
                  <div className="contributor-heading">
                    <img
                      src={contributor.avatar}
                      alt={`${contributor.name}'s avatar`}
                      className="contributor-avatar"
                    />
                    <div className="name-and-role">
                      <h3 className="contributor-name">{contributor.name}</h3>
                      <p className="contributor-role">{contributor.role}</p>
                    </div>
                  </div>

                  <p className="contributor-description">
                    {contributor.description}
                  </p>
                </div>

                <div className="contributor-links">
                  <a
                    href={contributor.gitHub}
                    className="link-button"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <span>GitHub</span>
                  </a>
                  <a
                    href={contributor.linkedin}
                    className="link-button"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <span>LinkedIn</span>
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div
          className="contact-section about-reveal"
          id="contact"
          data-about-reveal
        >
        <div className="contact-section" id="contact">
          <h2 className="contact-title">Get in touch?</h2>
          <p className="contact-text-primary">
            Have questions or feedback? We would love to hear from you.
          </p>

          <form className="contact-form" onSubmit={handleContactSubmit}>
            <div className="contact-form-field">
              <label className="contact-form-label" htmlFor="contact-name">
                Name
              </label>
              <input
                id="contact-name"
                name="name"
                type="text"
                autoComplete="name"
                placeholder="Yahya Al-Ademi"
                className="contact-form-input"
              />
            </div>
            <div className="contact-form-field">
              <label className="contact-form-label" htmlFor="contact-email">
                Email
              </label>
              <input
                id="contact-email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="yaroslavkazeev@gmail.com"
                className="contact-form-input"
              />
            </div>
            <div className="contact-form-field contact-form-field--full">
              <label className="contact-form-label" htmlFor="contact-message">
                Message
              </label>
              <textarea
                id="contact-message"
                name="message"
                rows={4}
                className="contact-form-textarea"
              />
            </div>
            <button type="submit" className="contact-form-submit">
              Submit
            </button>
          </form>

          <p className="contact-text-secondary">
            Drop us a line at{" "}
            <a
              href="mailto:jobcompass2025@gmail.com?subject=Question%20about%20JobCompass"
              className="email-link"
            >
              jobcompass2025@gmail.com
            </a>{" "}
            and we will get back to you as soon as possible!
          </p>
        </div>
      </main>
    </div>
  );
}
