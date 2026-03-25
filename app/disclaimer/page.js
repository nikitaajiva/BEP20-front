"use client";
import LandingNavbar from "../../components/landing/LandingNavbar";
import LandingFooter from "../../components/landing/LandingFooter";
export default function DisclaimerPage() {
  return (
    <>
   
      <LandingNavbar />
      <main className="page_content">
        <section className="blog_details_section section_space">
          <div className="container">
            <div className="details_content">
              <ul className="post_meta style_2 unordered_list">
                <li>
                  <i className="fa-regular fa-calendar-days"></i>&nbsp;
                  Effective Date : May 9, 2025
                </li>
              </ul>
              <h2 className="details_title">Disclaimer</h2>
            </div>

            <hr />

            <div className="row justify-content-lg-between">
              <div className="col-lg-12">
                <div className="details_content">
                  <div className="details_info_title_main">
                    <h3 className="details_info_title">
                      The information presented on the BEPVault website&nbsp;
                      <a
                        href="https://bepvault.io"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        https://bepvault.io
                      </a>{" "}
                      is intended solely for general informational purposes and
                      does not constitute financial, legal, or investment
                      advice. While we endeavor to provide accurate and
                      up-to-date content, BEPVault makes no representations or
                      warranties, express or implied, regarding the
                      completeness, reliability, or suitability of any
                      information contained herein.
                    </h3>

                    <p>
                      BEPVault operates as an independent platform focused on
                      affiliate marketing and liquidity engagement within the
                      digital asset space. We are not an investment advisory
                      firm, and none of the material on this site should be
                      interpreted as a recommendation to invest, trade, or
                      otherwise participate in any financial activity.
                    </p>

                    <p>
                      Participation in digital ecosystems, particularly those
                      involving blockchain technologies, should be undertaken
                      with thoughtful consideration. Market conditions,
                      regulatory developments, and evolving technologies may
                      influence performance and outcomes. Users are encouraged
                      to exercise independent judgment and, where appropriate,
                      seek advice from qualified professionals.
                    </p>
                  </div>

                  <div className="details_info_title_main">
                    <h3 className="details_info_title">Conformation:</h3>
                    <p>
                      By continuing to access or use this website, you confirm
                      your understanding and acceptance of this disclaimer.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <LandingFooter />
    </>
  );
}
