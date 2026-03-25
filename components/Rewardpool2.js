"use client";
import Image from "next/image";
import "../poolbanner/rewardpool1.css";
// import RewardPoolimage from "../public/assets/img/poolbanner/REWARDPOOL1.png";
import RewardPoolimage from "../public/assets/img/poolbanner/Apple-iPhone-17-Pro-Max.png";
import Rewardwatch from "../public/assets/img/poolbanner/Grouppool3.png";
export default function RewardPool2() {
  return (
    <div className="pool-box RewardPool2-style pool-box-background">
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
          <h3 className="title">REWARD POOL 2</h3>

          <h2 className="heading">
            Have 8 iPhone 17 Pro <br />
            Achievers in your team
          </h2>

          <button className="reward-btn">Reward</button>

          <h2 className="reward-line">iPhone 17 Pro + Apple iPad</h2>

          <p className="note">
            Maximum 3 Iphone 17 Pro achivers will be counted from a single wing
          </p>
        </div>

        {/* Right iPhone */}
        <div className="pool-right">
          <Image
            src={RewardPoolimage}
            width={240}
            height={240}
            alt="iPhone"
            className="iphone-img"
          />
        </div>
      </div>
    </div>
  );
}
