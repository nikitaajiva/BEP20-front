"use client";
import LandingNavbar from "../../components/landing/LandingNavbar";
import LandingFooter from "../../components/landing/LandingFooter";

export default function TermsPage() {
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
              <h2 className="details_title">Terms & Conditions</h2>
            </div>

            <hr />

            <div className="row justify-content-lg-between">
              <div className="col-lg-12">
                <div className="details_content">
                  <h3 className="details_info_title">
                    These Terms and Conditions ("Terms") govern your access to
                    and use of the BEPVault website (
                    <a
                      href="https://bepvault.io"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      https://bepvault.io
                    </a>
                    ) and any related services made available through it. By
                    continuing to use this website, you agree to be bound by
                    these Terms. If you do not agree, please refrain from
                    accessing or using the platform.
                  </h3>

                  {/* Section 1 */}
                  <div className="details_info_title_main">
                    <h3 className="details_info_title">1. Definitions</h3>
                    <ul className="iconlist_block unordered_list_block">
                      {[
                        `"User" refers to any individual, entity, or representative accessing, browsing, or interacting with the Website or its offerings.`,
                        `"BEPVault", “we,” “our,” or “us” refers to the decentralized collective facilitating the platform and its open-access services.`,
                        `"Services" refers to the tools, content, community initiatives, affiliate opportunities, and information made available through the Website.`,
                      ].map((item, index) => (
                        <li key={index}>
                          <span className="iconlist_icon">
                            <i className="fa-solid fa-circle"></i>
                          </span>
                          <span className="iconlist_label">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  {/* Section 2 */}
                  <div className="details_info_title_main">
                    <h3 className="details_info_title">2. Eligibility</h3>
                    <p>2.1 By using this Website, you confirm that:</p>
                    <ul className="iconlist_block unordered_list_block">
                      {[
                        `You are at least 18 years old or the legal age of majority in your jurisdiction.`,
                        `You have the authority to enter into binding agreements and are not restricted by law or regulation from participating in digital or affiliate platforms.`,
                        `2.2 BEPVault does not require user registration or verification but reserves the right to limit access to certain features where eligibility is relevant or required under applicable frameworks.`,
                      ].map((item, index) => (
                        <li key={index}>
                          <span className="iconlist_icon">
                            <i className="fa-solid fa-circle"></i>
                          </span>
                          <span className="iconlist_label">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Section 3 */}
                  <div className="details_info_title_main">
                    <h3 className="details_info_title">
                      3. Nature of Services
                    </h3>
                    <ul className="iconlist_block unordered_list_block">
                      {[
                        `3.1 BEPVault operates as a decentralized, open-access platform for individuals and communities participating in affiliate marketing, digital liquidity efforts, and blockchain-based promotional activities.`,
                        `3.2 The platform does not provide custodial services, financial intermediation, or investment advisory. All content is shared for educational and informational purposes only and should not be construed as advice or endorsement of any financial or commercial activity.`,
                        `3.3 Interactions initiated through the Website, including through affiliate links or referral programs, are undertaken voluntarily and at your discretion. BEPVault does not verify or supervise third-party offerings.`,
                      ].map((item, index) => (
                        <li key={index}>
                          <span className="iconlist_icon">
                            <i className="fa-solid fa-circle"></i>
                          </span>
                          <span className="iconlist_label">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  {/* Section 4 */}
                  <div className="details_info_title_main">
                    <h3 className="details_info_title">
                      4. Intellectual Property
                    </h3>
                    <ul className="iconlist_block unordered_list_block">
                      {[
                        `4.1 All content made available on the Website, including visual design, text, logos, and original content, is either open-source or the property of its contributors. Unauthorized duplication or commercial use without permission or attribution is discouraged.`,
                        `4.2 Trademarks, logos, or references to external entities (such as Ripple Labs or other partners) remain the property of their respective holders. Use of such references on this platform does not imply formal affiliation or endorsement.`,
                      ].map((item, index) => (
                        <li key={index}>
                          <span className="iconlist_icon">
                            <i className="fa-solid fa-circle"></i>
                          </span>
                          <span className="iconlist_label">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  {/* Section 5 */}
                  <div className="details_info_title_main">
                    <h3 className="details_info_title">
                      5. Third-Party Links and Interactions
                    </h3>
                    <ul className="iconlist_block unordered_list_block">
                      {[
                        `5.1 The Website may include links or gateways to independent third-party tools, protocols, or websites. BEPVault does not exercise control over these external sites and assumes no liability for the content, integrity, or conduct of such third parties.`,
                        `5.2 You acknowledge that any engagement with third-party platforms is done entirely at your own risk and responsibility.`,
                      ].map((item, index) => (
                        <li key={index}>
                          <span className="iconlist_icon">
                            <i className="fa-solid fa-circle"></i>
                          </span>
                          <span className="iconlist_label">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  {/* Section 6 */}
                  <div className="details_info_title_main">
                    <h3 className="details_info_title">6. User Conduct</h3>
                    <ul className="iconlist_block unordered_list_block">
                      {[
                        `6.1 Users agree to engage with the Website and its community in a respectful, lawful, and constructive manner.`,
                        `6.2 Use of the platform for activities involving fraud, spam, manipulation, harassment, or violation of applicable laws is strictly prohibited and may result in restricted access.`,
                      ].map((item, index) => (
                        <li key={index}>
                          <span className="iconlist_icon">
                            <i className="fa-solid fa-circle"></i>
                          </span>
                          <span className="iconlist_label">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Section 7 */}
                  <div className="details_info_title_main">
                    <h3 className="details_info_title">7. No Warranties</h3>
                    <ul className="iconlist_block unordered_list_block">
                      {[
                        `7.1 BEPVault is provided on a strictly “as-is” and “as-available” basis. We do not guarantee uninterrupted access, accuracy of content, or any particular outcome from use of the Website or Services.`,
                        `7.2 To the fullest extent permitted by applicable law, we disclaim all warranties, express or implied, including merchantability, non-infringement, and fitness for a particular purpose.`,
                      ].map((item, index) => (
                        <li key={index}>
                          <span className="iconlist_icon">
                            <i className="fa-solid fa-circle"></i>
                          </span>
                          <span className="iconlist_label">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Section 8 */}
                  <div className="details_info_title_main">
                    <h3 className="details_info_title">
                      8. Limitation of Liability
                    </h3>
                    <p>
                      To the extent permissible by decentralized and borderless
                      digital engagement, BEPVault and its contributors shall
                      not be held liable for any indirect, incidental, or
                      consequential damages arising from your use of the Website
                      or reliance on its content. Users are advised to make
                      independent evaluations before acting on any information
                      or link accessed through the platform.
                    </p>
                  </div>
                  {/* Section 9 */}
                  <div className="details_info_title_main">
                    <h3 className="details_info_title">9. Indemnity</h3>
                    <p>
                      You agree to hold harmless the BEPVault ecosystem, its
                      contributors, and community members from any claims,
                      liabilities, or damages arising from your use of the
                      Website, breach of these Terms, or interactions with
                      external parties introduced via the platform.
                    </p>
                  </div>

                  {/* Section 10 */}
                  <div className="details_info_title_main">
                    <h3 className="details_info_title">10. Amendments</h3>
                    <p>
                      These Terms may be updated from time to time to reflect
                      changes in community standards, legal developments, or
                      platform enhancements. We encourage periodic review of
                      this page. Continued use of the Website following updates
                      signifies your acceptance of the revised Terms.
                    </p>
                  </div>

                  {/* Section 11 */}
                  <div className="details_info_title_main">
                    <h3 className="details_info_title">
                      11. Legal Framework and Jurisdiction
                    </h3>
                    <p>
                      BEPVault is a decentralized, borderless initiative not
                      domiciled in any specific country or governed by a
                      particular national legal system. By accessing the
                      platform, you acknowledge and accept that your use is
                      governed by the principles of self-responsibility,
                      voluntary participation, and peer-to-peer autonomy.
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
