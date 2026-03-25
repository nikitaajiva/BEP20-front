"use client";
import React from "react";
import Image from "next/image";
import RewardPoolimage from "../public/assets/img/poolbanner/REWARDPOOL1.png";

export default function Rewardpool() {
  return (
    <>
      {" "}
      <Image src={RewardPoolimage} alt="Reward Pool" />
    </>
  );
}
