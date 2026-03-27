"use client";
import React from "react";
import Image from "next/image";
import KevinPang from "@/public/assets/images/myteam/KevinPang.jpg";
import AlanYeap from "@/public/assets/images/myteam/AlanYeap.jpg";
import WendyVanessa from "@/public/assets/images/myteam/WendyVanessa.jpg";
import RolanCleverReyes from "@/public/assets/images/myteam/RolanCleverReyes.jpg";
import BrianahGatchalian from "@/public/assets/images/myteam/BrianahGatchalian.jpg";
import JocelynOjinal from "@/public/assets/images/myteam/JocelynOjinal.jpg";
import "./TeamSection.css"; // Import custom CSS
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";

const teamMembers = [
  {
    name: "Kevin Pang",
    role: "Chief Executive Officer (CEO)",
    image: KevinPang,
    description:
      "Strategic Fintech Visionary | Global Compliance Leader | CEO of BEPVault\n\nKevin Pang is a globally respected fintech executive with over 30 years of leadership experience in technology, telecommunications, and financial services. His career spans renowned organizations like IBM, HP, Telstra, and MoneyGram, where he led complex digital transformation and global payments innovation across Asia, the Middle East, and Europe. As a regulatory expert, Kevin has architected compliance-first strategies under the Singapore MAS, EU MiCA, and Hong Kong SFC, earning recognition for bridging DeFi innovation with real-world financial systems. He has vast experience in multiple regulated crypto-payment platforms and has spearheaded token launches, licensing, and KYC/AML infrastructure across jurisdictions. Kevin brings the rare ability to unite institutional-grade security with user-focused decentralization, positioning BEPVault as a powerful force for next-generation liquidity.",
  },
  {
    name: "Alan Yeap",
    role: "Chief Marketing Officer (CMO)",
    image: AlanYeap,
    description:
      "Community Builder | Web3 Growth Leader | Global DeFi Advocate\n\nAlan Yeap is a strategic marketing powerhouse with deep expertise in DeFi, GameFi, NFTs, and Real-World Asset tokenization. With over a decade of experience activating Web3 ecosystems across Southeast Asia and the Middle East, Alan has cultivated a highly engaged community of over 100,000 members. His marketing leadership is rooted in action—Alan has hosted over 150+ AMAs, executed multi-country product launches, and built trusted grassroots networks in Korea, Vietnam, Indonesia, Philippines, China, and Malaysia. As the architect of BEPVault’s global community expansion, he turns blockchain vision into on-chain adoption. Alan's strength lies in connecting people to purpose. With a loyal user base, multi-language communication fluency, and a passion for education, Alan ensures BEPVault grows not just as a product, but as a movement.",
  },
  {
    name: "Wendy Vanessa",
    role: "Chief Strategy Officer (CSO)",
    image: WendyVanessa,
    description:
      "Technologist | Ecosystem Strategist | Award-Winning Blockchain Leader\n\nWendy Vanessa is a pioneering strategist at the intersection of blockchain innovation, smart city development, and fintech regulation. With a background that spans public-private ventures, startup acceleration, and government consulting, Wendy has led programs that brought over $830M+ in investment into Southeast Asia. Named an MIT Technology Review \"Innovators Under 35\" evangelist, Wendy has delivered blockchain transformation initiatives for national governments, tech startups, and major accelerators like Seedstars. Her work with institutions like DBS Bank, the Vietnam Smart City Taskforce, and Singapore's MTI has positioned her as a respected voice in regulatory technology and ecosystem building. At BEPVault, Wendy leads global expansion strategy, Binance Smart Chain integration, and real-world use case adoption. She is the strategic force shaping BEPVault into a globally trusted ecosystem engine.",
  },
  {
    name: "Rolan Clever Reyes",
    role: "Head of Operations",
    image: RolanCleverReyes, // Replace with actual import if you have the image
    description: `Precision-Driven Operator | Ecosystem Architect | Execution at Scale
    
    Rolan Clever Reyes leads the operational heartbeat of BEPVault, ensuring every moving part of the ecosystem functions with clarity, consistency, and scale. With a sharp eye for systems optimization and cross-functional efficiency, Rolan oversees everything from platform logistics and backend workflows to regional coordination.
    
    Known for his methodical leadership and solution-focused mindset, Rolan brings over a decade of hands-on experience in operational management across fintech and emerging tech sectors. At BEPVault, he translates big-picture vision into seamless execution, onboarding users, supporting LP growth, and managing backend systems with unwavering precision.
    
    Rolan also plays a key role in regional alignment and Southeast Asian partner success, serving as both strategist and operator on the ground.`,
  },
  {
    name: "Brianah Gatchalian",
    role: "Key Account Manager",
    image: BrianahGatchalian, // Replace with actual import if you have the image
    description: `Philippines Lead | Strategic Partner Liaison | Web3 Growth Advocate
    
    Brianah Gatchalian serves as the Key Account Manager at BEPVault, spearheading strategic relationship management and ecosystem partnerships across the Philippines and broader Southeast Asia.
    
    With a passion for Web3 innovation and inclusive finance, Brianah bridges key institutional and community relationships that drive BEPVault’s expansion.
    
    She brings valuable experience in partner onboarding, community growth, and high-touch account servicing—ensuring that every engagement is anchored in transparency, trust, and long-term value. As one of the leading faces of BEPVault in the region, Brianah plays a pivotal role in scaling adoption, supporting local activations, and fostering a dynamic community.`,
  },
  {
    name: "Jocelyn Ojinal",
    role: "Relationship Manager",
    image: JocelynOjinal, // Replace with actual import if you have the image
    description: `Connector | Community Champion | Growth-Focused Liaison
    
    As Relationship Manager at BEPVault, Jo plays a vital role in building and nurturing trusted relationships across our global ecosystem, from individual users and liquidity providers to institutional partners and Web3 communities.
    
    With a background in client engagement, strategic partnerships, and Web3 education, Jo ensures that every stakeholder interaction reflects BEPVault’s core values: transparency, accessibility, and sustainable growth.
    
    Whether onboarding new partners, community members, or coordinating regional engagement programs, Jo bridges the gap between our vision and the communities powering it.`,
  },
];

const TeamSection = () => {
  return (
    <section className="team-section" id="id_ico_our_team">
      <div className="container">
        <h2 className="team-title">Meet the BEPVault Leadership</h2>
        <Swiper
          slidesPerView={1}
          spaceBetween={20}
          pagination={{
            clickable: true,
          }}
          autoplay={{
            delay: 4000, // 4 seconds
            disableOnInteraction: false,
          }}
          breakpoints={{
            640: { slidesPerView: 1 },
            768: { slidesPerView: 3 },
            1024: { slidesPerView: 4 },
            1280: { slidesPerView: 4 },
            1440: { slidesPerView: 4 }, // stays at 4 on very wide screens
          }}
          modules={[Pagination, Autoplay]}
        >
          {teamMembers.map((member, index) => (
            <SwiperSlide key={index}>
              <div className="team-card">
                <div className="team-image-wrapper">
                  <Image
                    src={member.image}
                    alt={member.name}
                    fill
                    className="team-image"
                  />
                </div>
                <div className="team-content">
                  <h3 className="team-name">{member.name}</h3>
                  <p className="team-role">{member.role}</p>
                </div>
                <div className="team-overlay">
                  <div className="team-overlay-inner">
                    <div className="team-content">
                      <h3 className="team-name">{member.name}</h3>
                      <p className="team-role">{member.role}</p>
                    </div>
                    <div className="team-overlay-content">
                      <p className="team-description">{member.description}</p>
                    </div>
                  </div>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
};


export default TeamSection;
