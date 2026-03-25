"use client";
import Image from "next/image";
import "../poolbanner/rewardpool1.css";
import Rewardwatch from "../public/assets/img/poolbanner/mercedes_PNG80179 1.png";
export default function Rewardpool5() {
  return (
    <div className="pool-box pool5style pool-box-background">
      {/* Left Image */}
      <div class="eligibility">
        <span class="lock"></span>
        Eligibility Criteria
      </div>
      {/* Main Content */}
      <div className="pool-content">
        {/* Left Watch */}
        <div className="pool-left">
          <Image
            src={Rewardwatch}
            width={330}
            height={230}
            alt="Apple Watch"
            className="watch-img"
          />
        </div>

        {/* Middle Text */}
        <div className="pool-text">
          <h3 className="title">REWARD POOL 5</h3>
          <h2 className="heading">
            Build a team with 3 achievers,
            <br />
            where each achiever qualifies
          </h2>{" "}
          <h1 className="reward-line-inner-top">
            For a car reward worth 7,500 USDT.
          </h1>
          <button className="reward-btn">Reward</button>
          <h2 className="reward-line">A car reward worth</h2>
          <h1 className="reward-line-inner">Worth 25,000 USDT</h1>
          <p className="note">3 achievers should be from 3 different wings.</p>
        </div>
      </div>
    </div>
  );
}
