"use client";

import { useState } from "react";

const FAQSection = () => {
  return (
    <>
      <section
        id="id_ico_tokenomics_section"
        className="ico_tokenomics_section section_space pb-0"
      >
        <div className="container">
          <div
            className="ico_heading_block text-center"
            data-aos="fade-up"
            data-aos-duration="600"
          >
            <h2 className="heading_text mb-0">
              Why Join the BEPVault Community Program?
            </h2>
          </div>

          <div className="row align-items-center">
            <div className="col-lg-12 position-relative z-1">
              <ul className="about_ico_block unordered_list_block">
                <li
                  data-aos="fade-up"
                  data-aos-duration="600"
                  data-aos-delay="100"
                >
                  <h6 className="iconbox_title">High Earning Potential:</h6>
                  <p className="iconbox_description mb-0">
                    Enjoy competitive commission structures with bonus
                    incentives.
                  </p>
                </li>
                <li
                  data-aos="fade-up"
                  data-aos-duration="600"
                  data-aos-delay="200"
                >
                  <h6 className="iconbox_title">Trusted Finance Network:</h6>
                  <p className="iconbox_description mb-0">
                    The World’s First Network Powered by Regulated Institutional
                    Liquidity Infrastructure.
                  </p>
                </li>
                <li
                  data-aos="fade-up"
                  data-aos-duration="600"
                  data-aos-delay="300"
                >
                  <h6 className="iconbox_title">Transparent Reporting:</h6>
                  <p className="iconbox_description mb-0">
                    Access real-time statistics and detailed reports to track
                    your performance and earnings.
                  </p>
                </li>
                <li
                  data-aos="fade-up"
                  data-aos-duration="600"
                  data-aos-delay="300"
                >
                  <h6 className="iconbox_title">Educational Support:</h6>
                  <p className="iconbox_description mb-0">
                    Get access to a wide range of resources, training materials,
                    and support to help you succeed.
                  </p>
                </li>
                <li
                  data-aos="fade-up"
                  data-aos-duration="600"
                  data-aos-delay="300"
                >
                  <h6 className="iconbox_title">No Limitations:</h6>
                  <p className="iconbox_description mb-0">
                    There’s no cap on the number of referrals you can make or
                    the commissions you can earn.
                  </p>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default FAQSection;
