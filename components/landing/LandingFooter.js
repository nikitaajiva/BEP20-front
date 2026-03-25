"use client";
import "../../app/herosection.css";
import Link from "next/link";
import Image from "next/image";
// SVG for button arrows (reusable or define locally if specific styles needed)
const ArrowIcon = ({ direction = "left" }) => (
  <svg
    width="20"
    height="18"
    viewBox="0 0 20 18"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
    style={{ margin: direction === "left" ? "0 8px 0 0" : "0 0 0 8px" }}
  >
    {direction === "left" ? (
      <path
        d="M2.5 9L6.5 5M2.5 9L6.5 13M2.5 9H17.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    ) : (
      <path
        d="M17.5 9L13.5 5M17.5 9L13.5 13M17.5 9H2.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    )}
  </svg>
);

const CreativeButton = ({ href, label, iconDirection = "left" }) => {
  const buttonStyle = {
    display: "inline-flex",
    alignItems: "center",
    padding: "0.8rem 1.8rem",
    background: "var(--primary-gold)",
    color: "#000000",
    fontFamily: "Inter, sans-serif",
    fontWeight: "800",
    fontSize: "0.9rem",
    textTransform: "uppercase",
    letterSpacing: "1px",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    boxShadow: "0 4px 15px rgba(255, 215, 0, 0.2)",
    transition: "transform 0.2s ease, box-shadow 0.3s ease",
  };
  return (
    <Link href={href} passHref>
      <button
        type="button"
        style={buttonStyle}
        onMouseOver={(e) => {
          e.currentTarget.style.transform = "translateY(-2px)";
          e.currentTarget.style.boxShadow =
            "0 6px 20px rgba(255, 215, 0, 0.4)";
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.transform = "translateY(0px)";
          e.currentTarget.style.boxShadow =
            "0 4px 15px rgba(255, 215, 0, 0.2)";
        }}
      >
        {iconDirection === "left" && <ArrowIcon direction="left" />}
        {label}
        {iconDirection === "right" && <ArrowIcon direction="right" />}
      </button>
    </Link>
  );
};

const LandingFooter = () => {
  const footerStyle = {
    backgroundColor: "#000000",
    color: "#888888",
    padding: "4rem 2rem 2rem 2rem",
    borderTop: "1px solid rgba(255, 215, 0, 0.1)",
    position: "relative",
    fontFamily: "Inter, sans-serif",
  };

  // const shapeDividerStyle = {
  //   position: "absolute",
  //   top: 0,
  //   left: 0,
  //   width: "100%",
  //   lineHeight: 0,
  //   transform: "translateY(-99%)",
  //   zIndex: 1,
  // };

  const footerContentStyle = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: "2.5rem",
    maxWidth: "1200px",
    margin: "0 auto 3rem auto", // Center content, add bottom margin before copyright
    textAlign: "center", // Default center, individual columns can override
  };

  const columnStyle = {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "1rem",
  };

  const footerTitleStyle = {
    fontSize: "1.1rem",
    color: "#FFFFFF",
    fontWeight: "600",
    textTransform: "uppercase",
    marginBottom: "0.5rem",
  };

  const linkStyle = {
    color: "#888888",
    textDecoration: "none",
    fontSize: "0.9rem",
    transition: "color 0.3s ease",
  };

  const newsletterFormStyle = {
    display: "flex",
    gap: "0.5rem",
    marginTop: "0.5rem",
  };

  const inputStyle = {
    padding: "0.7rem 1rem",
    borderRadius: "6px",
    border: "1px solid rgba(255, 215, 0, 0.2)",
    backgroundColor: "#0a0a0a",
    color: "#E0E0E0",
    fontSize: "0.9rem",
    flexGrow: 1,
  };

  const submitButtonStyle = {
    padding: "0.7rem 1.2rem",
    borderRadius: "6px",
    border: "none",
    background: "linear-gradient(135deg, #ffd700, #ffc107)",
    color: "#000000",
    cursor: "pointer",
    fontWeight: "bold",
    fontSize: "0.9rem",
  };

  const copyrightTextStyle = {
    textAlign: "center",
    fontSize: "0.85rem",
    color: "#888888",
    paddingTop: "2rem",
    borderTop: "1px solid rgba(255, 215, 0, 0.1)",
  };

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    // Basic alert for now, actual submission logic would go here
    alert("Thank you for subscribing!");
    e.target.reset();
  };

  return (
    <footer className="ico_site_footer section_decoration section_shadow_top">
      <div className="decoration_item shape_top">
        <img
          src="assets/images/shapes/shape_ico_hero_section_bottom.svg"
          alt="Bottom Line Shape"
        />
      </div>
      <div className="container">
        <ul className="pagelist_block unordered_list justify-content-center text-uppercase">
          <li>
            <a className="scrollspy_btn" href="/disclaimer">
              <span className="pagelist_label">Disclaimer</span>
            </a>
          </li>
          <li>
            <a className="scrollspy_btn" href="/privacy-policy">
              <span className="pagelist_label">Privacy Policy</span>
            </a>
          </li>
          <li>
            <a className="scrollspy_btn" href="/terms-conditions">
              <span className="pagelist_label">Terms & Conditions</span>
            </a>
          </li>
        </ul>
        <div className="middle_area">
          <div className="column">
            <h3 className="footer_title text-uppercase">
              Join our social group
            </h3>
            <a
              className="ico_creative_btn"
              href="https://linktr.ee/BEPVaultOfficial"
              target="_BLANK"
            >
              <span className="btn_wrapper">
                <span className="btn_icon_left">
                  <small className="dot_top"></small>
                  <small className="dot_bottom"></small>
                </span>
                <span className="btn_label text-white">LINKTREE</span>
                <span className="btn_icon_right">
                  <small className="dot_top"></small>
                  <small className="dot_bottom"></small>
                </span>
              </span>
            </a>
          </div>
          <div className="column">
            <h3 className="footer_title text-uppercase">
              Subscribe to our newsletter
            </h3>
            <form className="ico_newsletter_form">
              <input type="email" name="email" placeholder="Enter your email" />
              <button className="submit_btn" onclick="sendLetter()">
                Submit
              </button>
            </form>
          </div>
          <div className="column">
            <h3 className="footer_title text-uppercase">
              Let’s BEPVault great together.
            </h3>
            <a className="ico_creative_btn" href="/sign-up">
              <span className="btn_wrapper">
                <span className="btn_icon_left">
                  <small className="dot_top"></small>
                  <small className="dot_bottom"></small>
                  <svg
                    className="icon_arrow_left"
                    viewBox="0 0 28 23"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M13.4106 20.8083L5.36673 12.6878C5.26033 12.5804 5.11542 12.52 4.96423 12.52H1.84503C1.34158 12.52 1.08822 13.1276 1.44252 13.4852L9.48642 21.6057C9.59281 21.7131 9.73773 21.7736 9.88892 21.7736H13.0081C13.5116 21.7736 13.7649 21.166 13.4106 20.8083Z" />
                    <path d="M12.6803 9.57324H24.71C25.7116 9.57324 26.5234 10.3851 26.5234 11.3866C26.5234 12.3882 25.7116 13.2 24.71 13.2H12.6803C11.6788 13.2 10.8669 12.3882 10.8669 11.3866C10.8669 10.3851 11.6788 9.57324 12.6803 9.57324Z" />
                    <path d="M1.44252 9.28834L9.48641 1.16784C9.59281 1.06043 9.73772 1 9.88891 1H13.0081C13.5116 1 13.7649 1.60758 13.4106 1.96525L5.36672 10.0858C5.26033 10.1932 5.11541 10.2536 4.96422 10.2536H1.84502C1.34158 10.2536 1.08822 9.64601 1.44252 9.28834Z" />
                  </svg>
                </span>
                <span className="btn_label">Let's Start</span>
                <span className="btn_icon_right">
                  <small className="dot_top"></small>
                  <small className="dot_bottom"></small>
                  <svg
                    className="icon_arrow_right"
                    viewBox="0 0 27 23"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M13.6558 2.19168L21.6997 10.3122C21.8061 10.4196 21.951 10.48 22.1022 10.48H25.2214C25.7248 10.48 25.9782 9.87238 25.6239 9.51478L17.58 1.39428C17.4736 1.28688 17.3287 1.22638 17.1775 1.22638H14.0583C13.5548 1.22638 13.3015 1.83398 13.6558 2.19168Z" />
                    <path d="M14.3861 13.4268H2.35637C1.35486 13.4268 0.542969 12.6149 0.542969 11.6134C0.542969 10.6118 1.35486 9.79996 2.35637 9.79996H14.3861C15.3876 9.79996 16.1995 10.6118 16.1995 11.6134C16.1995 12.6149 15.3876 13.4268 14.3861 13.4268Z" />
                    <path d="M25.6239 13.7117L17.58 21.8322C17.4736 21.9396 17.3287 22 17.1775 22H14.0583C13.5548 22 13.3015 21.3924 13.6558 21.0347L21.6997 12.9142C21.8061 12.8068 21.951 12.7464 22.1022 12.7464H25.2214C25.7248 12.7464 25.9782 13.354 25.6239 13.7117Z" />
                  </svg>
                </span>
              </span>
            </a>
          </div>
        </div>
        <div className="footer_bottom text-center">
          <p className="copyright_text m-0 text-secondary">
            Copyright© 2025 BEPVault. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default LandingFooter;
