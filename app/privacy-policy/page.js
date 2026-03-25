"use client";
import LandingNavbar from "../../components/landing/LandingNavbar";
import LandingFooter from "../../components/landing/LandingFooter";
export default function PrivacyPolicyPage() {
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
              <h2 className="details_title">Privacy Policy</h2>
            </div>

            <hr />

            <div className="row justify-content-lg-between">
              <div className="col-lg-12">
                <div className="details_content">
                  <h3 className="details_info_title">
                    At BEPVault (“we,” “our,” or “us”), we are committed to
                    respecting and protecting the privacy of individuals who
                    access our decentralized platform via{" "}
                    <a
                      href="https://bepvault.io"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      https://bepvault.io
                    </a>{" "}
                    (“the Website”). This Privacy Policy explains how we
                    collect, use, and safeguard information shared through your
                    interaction with the Website.
                  </h3>

                  <p>
                    By continuing to use the Website, you acknowledge that you
                    have read, understood, and agreed to the terms outlined in
                    this Policy.
                  </p>

                  <div className="details_info_title_main">
                    <h3 className="details_info_title">1. About BEPVault</h3>
                    <p>
                      BEPVault is a decentralized, non-custodial platform built
                      to support affiliate-driven growth and digital liquidity
                      within the USDT ecosystem. We do not operate as a
                      centralized entity, nor do we maintain conventional
                      database.
                    </p>
                  </div>

                  <div className="details_info_title_main">
                    <h3 className="details_info_title">
                      2. Information We Collect
                    </h3>
                    <p>
                      BEPVault is designed to minimize the collection of
                      personal data. However, we may collect the following types
                      of information in limited and non-intrusive ways:
                    </p>

                    <ul className="iconlist_block unordered_list_block">
                      {[
                        "Technical and Usage Data",
                        "Browser and device information",
                        "IP address (anonymized where applicable)",
                        "Pages visited and general usage metrics",
                        "Referral sources and time spent on the Website",
                        "Voluntary Information",
                        "Email addresses submitted via contact forms or newsletter opt-ins",
                        "Wallet addresses submitted as part of affiliate or promotional participation",
                        "Messages, inquiries, or feedback submitted via communication channels",
                        "We do not knowingly collect personal data from individuals under the age of 18",
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
                  <div className="details_info_title_main">
                    <h3 className="details_info_title">
                      3. How We Use Your Information
                    </h3>
                    <p>
                      Information collected through the Website is used solely
                      to:
                    </p>

                    <ul className="iconlist_block unordered_list_block">
                      {[
                        "Maintain and improve the Website’s functionality and content",
                        "Respond to inquiries or feedback submitted by users",
                        "Share updates, newsletters, or project communications (only with your consent)",
                        "Analyze engagement and website performance metrics",
                        "Support transparency, community development, and decentralized governance practices",
                        "We do not profile users, sell data, or use collected information for targeted advertising",
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
                  <div className="details_info_title_main">
                    <h3 className="details_info_title">
                      4. Sharing and Disclosure
                    </h3>
                    <p>
                      BEPVault does not sell or trade personal data to third
                      parties. However, we may share limited information in the
                      following circumstances:
                    </p>
                    <p>
                      With trusted third-party service providers (e.g.,
                      analytics or email distribution platforms) who are
                      contractually bound to maintain confidentiality.
                      <br />
                      If legally required to comply with applicable laws,
                      regulations, or decentralized community standards.
                      <br />
                      To protect the integrity, security, or legal interests of
                      the platform and its participants.
                    </p>
                  </div>
                  <div className="details_info_title_main">
                    <h3 className="details_info_title">
                      5. Cookies and Analytics
                    </h3>
                    <p>
                      We may use cookies or similar technologies to enhance the
                      user experience and gather anonymous usage data. These
                      tools help us understand how visitors interact with the
                      Website. You may disable cookies through your browser
                      settings; however, this may impact certain website
                      features or functionality.
                    </p>
                  </div>

                  <div className="details_info_title_main">
                    <h3 className="details_info_title">6. Data Security</h3>
                    <p>
                      We implement reasonable technical and organizational
                      safeguards to protect the information processed through
                      the Website. However, as a decentralized platform, BEPVault
                      does not store sensitive user data or hold custodial
                      access to user funds. We encourage all users to take
                      appropriate measures to secure their personal devices,
                      wallets, and communications.
                    </p>
                  </div>
                  <div className="details_info_title_main">
                    <h3 className="details_info_title">
                      7. Your Rights and Choices
                    </h3>
                    <p>
                      Depending on your jurisdiction, you may have rights to:
                    </p>

                    <ul className="iconlist_block unordered_list_block">
                      {[
                        "Request access to or correction of your personal data",
                        "Request deletion of any voluntarily submitted information",
                        "Withdraw consent to any communication or data collection previously authorized",
                        "To exercise these rights or raise a concern, please contact us at support@bepvault.io",
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

                  <div className="details_info_title_main">
                    <h3 className="details_info_title">
                      8. Global Access and Jurisdiction
                    </h3>
                    <p>
                      As a decentralized project, BEPVault operates without
                      affiliation to any specific country or legal jurisdiction.
                      By using the Website, you acknowledge that your
                      information may be processed in a decentralized manner
                      across global infrastructures, consistent with open
                      blockchain principles.
                    </p>
                  </div>

                  <div className="details_info_title_main">
                    <h3 className="details_info_title">
                      9. Changes to This Policy
                    </h3>
                    <p>
                      This Privacy Policy may be updated periodically to reflect
                      changes in regulatory guidance, technological
                      advancements, or community governance. We encourage you to
                      review this page from time to time. The most recent
                      version will always be available on our Website, with the
                      effective date clearly stated.
                    </p>
                  </div>
                  <div className="details_info_title_main">
                    {" "}
                    <h3 className="details_info_title">10. Contact Us</h3>
                    <p>
                      If you have any questions, requests, or concerns regarding
                      this Privacy Policy or your data, please reach out to us
                      at support@bepvault.io
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

