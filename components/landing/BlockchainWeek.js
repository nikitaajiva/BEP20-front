import React from "react";
import Image from "next/image";
import "./Blogsection.css";
import Grouphero from "../../public/assets/images/grouphero.png";

const EventHeroSection = () => {
  return (
    <section className="pt-20 md:pt-28 text-white">
      <div className="container mx-auto px-4 md:px-12 grid md:grid-cols-2 gap-12 items-center">
        {/* Left: Image */}
        <div className="relative w-full h-[300px] md:h-[450px]">
          {/* <Image
            src={Grouphero}
            alt="Group Hero"
            fill
            className="object-contain md:object-cover rounded-xl"
            priority
          /> */}
        </div>

        {/* Right: Content */}
        <div>
         <h1 class="text-4xl md:text-5xl font-bold leading-tight mb-4 text-white relative inline-block blockchainweek-title">
  BEPVault Live at Malaysia Blockchain Week 2025
  <span class="block w-full h-1 bg-[#ffd700] mt-2 rounded-lg"></span>
</h1>
          <p className="text-lg md:text-xl text-gray-300 mb-6 max-w-2xl">
            We’re proud to represent the next wave of decentralized finance at MYBW 2025 — Asia’s most influential blockchain summit.
          </p>
<br></br>
          <div className="flex gap-4 items-start">
            <div className="pt-1">
              <svg
                width={24}
                height={24}
                xmlns="http://www.w3.org/2000/svg"
                className="text-[#ffd700]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 11c1.38 0 2.5-1.12 2.5-2.5S13.38 6 12 6s-2.5 1.12-2.5 2.5S10.62 11 12 11zM12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"
                />
              </svg>
            </div>

            <div>
              <p className="text-gray-400 text-sm mb-1">Location</p>
              <p className="text-[#ffd700] font-semibold leading-snug">
                World Trade Center, Kuala Lumpur<br />
                Alongside Global Leaders: Google Cloud, GAIA IT, and more. <br />
                This is more than an appearance — it’s our global declaration.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default EventHeroSection;
