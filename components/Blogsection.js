import React from "react";
import Image from "next/image";
import "./Blogsection.css"; // Import custom CSS
import Grouphero from "../../public/assets/images/grouphero.png";
import Banner_logo from "../../public/assets/images/banner_image.png";
const headlineStyle = {
  fontSize: "clamp(1.8rem, 6vw, 2.5rem)",
  fontWeight: "bold",
  color: "#FFFFFF",
  marginBottom: "1.5rem",
  // textShadow:
  //   "0 0 10px rgba(200, 180, 255, 0.5), 0 0 20px rgba(200, 180, 255, 0.3)",
  zIndex: 2,
};
const BlockHeroSection = () => {
  return (
    <div className=" event-section-main min-h-screen bg-black text-white flex items-center px-6 md:px-20 py-12">
      <div className="main-outer-section grid md:grid-cols-2 gap-3 items-center w-full mx-auto">
        {/* Right Content */}
        <section class="event-section">
          <div class="event-container">
            <div class="event-content">
              <div className="event-content-inner">
                <h1 class="event-title">
                  Bridge Your Finances with <br></br>USDT Liquidity
                </h1>
              </div>
              {/* <p class="event-subtitle"></p> */}
              <div class="event-description">
                Start earning daily returns and referral bonuses with BEPVault’s
                community platform.
              </div>
              <div className="mt-5">
                {" "}
                <button className="ico_btn_outline">
                  <a href="/sign-up">Join the Movement</a>
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
export default BlockHeroSection;
