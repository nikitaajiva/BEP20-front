"use client";
import Image from "next/image";
import "../poolbanner/Win17pro.css";
import styles from "./RewardPool1.module.css";
export default function RewardPoolCard({
  eligibilityText,
  leftImage,
  rightImage,
  rewardTitle,
  headingLine1,
  headingLine2,
  rewardLine,
  rewardSubLine,
  note,
  extraLineTop,
  styleClass = "",
  onEligibilityClick,
}) {
  return (
    <>
      <div
        className={`pool-box ${styleClass} pool-box-background desktop-view`}
      >
        <div className="eligibility" onClick={onEligibilityClick}>
          <span className="lock">
            {/* <svg
              stroke="currentColor"
              fill="currentColor"
              stroke-width="0"
              viewBox="0 0 576 512"
              height="1em"
              width="1em"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M423.5 0C339.5.3 272 69.5 272 153.5V224H48c-26.5 0-48 21.5-48 48v192c0 26.5 21.5 48 48 48h352c26.5 0 48-21.5 48-48V272c0-26.5-21.5-48-48-48h-48v-71.1c0-39.6 31.7-72.5 71.3-72.9 40-.4 72.7 32.1 72.7 72v80c0 13.3 10.7 24 24 24h32c13.3 0 24-10.7 24-24v-80C576 68 507.5-.3 423.5 0z"></path>
            </svg> */}
            <svg
              width="24"
              height="24"
              viewBox="0 0 17 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M0 11.6133C0 10.1332 1.19988 8.93333 2.68 8.93333H13.4C14.8801 8.93333 16.08 10.1332 16.08 11.6133V20.5467C16.08 22.0268 14.8801 23.2267 13.4 23.2267H2.68C1.19988 23.2267 0 22.0268 0 20.5467V11.6133Z"
                fill="#D96C39"
              />
              <path
                d="M7.14667 15.1867C7.14667 14.6933 7.54663 14.2933 8.04 14.2933C8.53337 14.2933 8.93333 14.6933 8.93333 15.1867V19.6533C8.93333 20.1467 8.53337 20.5467 8.04 20.5467C7.54663 20.5467 7.14667 20.1467 7.14667 19.6533V15.1867Z"
                fill="white"
              />
              <path
                d="M9.82667 14.2933C9.82667 15.2801 9.02675 16.08 8.04 16.08C7.05325 16.08 6.25333 15.2801 6.25333 14.2933C6.25333 13.3066 7.05325 12.5067 8.04 12.5067C9.02675 12.5067 9.82667 13.3066 9.82667 14.2933Z"
                fill="white"
              />
              <path
                d="M1.78667 9.40818H4.46667V4.94154C4.91333 2.26154 11.1667 1.81487 11.6133 4.94154V9.40818H14.2933V4.94151C13.4236 -1.42691 3.18064 -1.8638 1.78667 4.94151V9.40818Z"
                fill="#D96C39"
              />
            </svg>
          </span>
          {eligibilityText}
        </div>

        <div className="pool-content">
          {/* LEFT IMAGE */}
          <div className="pool-left">
            {leftImage && (
              <Image
                src={leftImage}
                width={330}
                height={230}
                alt="reward"
                className="watch-img"
              />
            )}
          </div>

          {/* TEXT */}
          <div className="pool-text">
            <h3 className="title">{rewardTitle}</h3>

            <h2 className="heading">
              {headingLine1} <br />
              {headingLine2}
            </h2>
            {extraLineTop && (
              <h1 className="reward-line-inner-top">{extraLineTop}</h1>
            )}

            <button className="reward-btn">Reward</button>

            {rewardLine && <h2 className="reward-line">{rewardLine}</h2>}
            {rewardSubLine && (
              <h1 className="reward-line-inner">{rewardSubLine}</h1>
            )}

            {note && <p className="note">{note}</p>}
          </div>
          {rightImage && (
            <div className="pool-right">
              <Image src={rightImage} alt="reward" className="iphone-img" />
            </div>
          )}
        </div>
      </div>

      <div className={`${styles.banner} mobile-view pool5style`}>
        <div className={styles.badge} onClick={onEligibilityClick}>
          <div className={styles.lock}>
            {" "}
            <svg
              width="24"
              height="24"
              viewBox="0 0 17 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M0 11.6133C0 10.1332 1.19988 8.93333 2.68 8.93333H13.4C14.8801 8.93333 16.08 10.1332 16.08 11.6133V20.5467C16.08 22.0268 14.8801 23.2267 13.4 23.2267H2.68C1.19988 23.2267 0 22.0268 0 20.5467V11.6133Z"
                fill="#D96C39"
              />
              <path
                d="M7.14667 15.1867C7.14667 14.6933 7.54663 14.2933 8.04 14.2933C8.53337 14.2933 8.93333 14.6933 8.93333 15.1867V19.6533C8.93333 20.1467 8.53337 20.5467 8.04 20.5467C7.54663 20.5467 7.14667 20.1467 7.14667 19.6533V15.1867Z"
                fill="white"
              />
              <path
                d="M9.82667 14.2933C9.82667 15.2801 9.02675 16.08 8.04 16.08C7.05325 16.08 6.25333 15.2801 6.25333 14.2933C6.25333 13.3066 7.05325 12.5067 8.04 12.5067C9.02675 12.5067 9.82667 13.3066 9.82667 14.2933Z"
                fill="white"
              />
              <path
                d="M1.78667 9.40818H4.46667V4.94154C4.91333 2.26154 11.1667 1.81487 11.6133 4.94154V9.40818H14.2933V4.94151C13.4236 -1.42691 3.18064 -1.8638 1.78667 4.94151V9.40818Z"
                fill="#D96C39"
              />
            </svg>
            {/* <svg
              stroke="currentColor"
              fill="currentColor"
              stroke-width="0"
              viewBox="0 0 576 512"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M423.5 0C339.5.3 272 69.5 272 153.5V224H48c-26.5 0-48 21.5-48 48v192c0 26.5 21.5 48 48 48h352c26.5 0 48-21.5 48-48V272c0-26.5-21.5-48-48-48h-48v-71.1c0-39.6 31.7-72.5 71.3-72.9 40-.4 72.7 32.1 72.7 72v80c0 13.3 10.7 24 24 24h32c13.3 0 24-10.7 24-24v-80C576 68 507.5-.3 423.5 0z"></path>
            </svg> */}
          </div>
          {eligibilityText}
        </div>

        <div className={styles.content}>
          <div className={styles.poolLabel}>{rewardTitle}</div>

          <h2 className={styles.headline}>{headingLine1}</h2>
          <h2 className={styles.headline}>{headingLine2}</h2>
          {rewardSubLine && (
            <h2 className="reward-line-inner">{extraLineTop}</h2>
          )}

          {/* IMAGES */}
          <div className={styles.imageRow}>
            {leftImage && (
              <div className={`${styles.imgBox}  imgBox`}>
                <Image src={leftImage} alt="reward" className={styles.img} />
                <div className={styles.shadow}></div>
              </div>
            )}

            {rightImage && (
              <div className={styles.imgBox}>
                <Image src={rightImage} alt="reward" className={styles.img} />
                <div className={styles.shadow}></div>
              </div>
            )}
          </div>
          {/* TEXT */}
          {rewardLine && <h3 className={styles.prize}>{rewardLine}</h3>}
          {rewardSubLine && (
            <h1 className="reward-line-inner">{rewardSubLine}</h1>
          )}

          {note && <p className={styles.note}>{note}</p>}

          <button className={styles.rewardBtn}>Reward</button>
        </div>
      </div>
    </>
  );
}
