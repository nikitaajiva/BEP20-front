import React from "react";
import Image from "next/image";
import "./Blogsection.css"; // Import custom CSS

const BlockHeroSection = () => {
  return (
    <div className="event-section-main min-h-screen flex items-center px-6 md:px-20 py-12" style={{ background: "transparent" }}>
      <div className="main-outer-section grid md:grid-cols-2 gap-3 items-center w-full mx-auto" style={{ zIndex: 10 }}>
        {/* Right Content */}
        <section className="event-section" style={{ background: "transparent", color: "#ffffff" }}>
          <div className="event-container">
            <div className="event-content" style={{ textAlign: "center", margin: "0 auto" }}>
              <div className="event-content-inner" style={{ justifyContent: "center" }}>
                <h1 className="event-title" style={{ paddingRight: "0", fontSize: "clamp(2.5rem, 5vw, 4rem)", textShadow: "0 0 15px rgba(255, 215, 0, 0.4)", color: "#ffd700" }}>
                  Bridge Your Finances with BEP20 BNB
                </h1>
              </div>
              <div className="event-description" style={{ margin: "20px auto", fontSize: "1.2rem", color: "rgba(255, 255, 255, 0.8)", maxWidth: "800px" }}>
                Start earning daily BNB returns and referral bonuses with BEPVault’s
                community platform. No complex DeFi skills required.
              </div>
              <div className="mt-5 ico_btn_outline_outer" style={{ display: "flex", justifyContent: "center", gap: "1rem" }}>
                <a href="/sign-up">
                  <button style={{
                    background: "linear-gradient(135deg, #ffd700 0%, #ffa500 100%)",
                    color: "#000", border: "none", padding: "1rem 2.5rem", borderRadius: "50px",
                    fontWeight: "800", fontSize: "1.1rem", cursor: "pointer",
                    boxShadow: "0 8px 25px rgba(255, 215, 0, 0.3)", transition: "all 0.3s ease",
                    textTransform: "uppercase", letterSpacing: "1px"
                  }}>
                    Join the Movement
                  </button>
                </a>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
export default BlockHeroSection;
