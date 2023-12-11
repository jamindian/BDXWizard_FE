import * as React from "react";

import {
  FormLabel,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@mui/material";

interface IPrivacyPolicy {
  open: boolean;
  handleClose: (key: string) => void;
}

export function MainHeading({ title }: { title: string }): JSX.Element {
  return (
    <h1
      style={{
        paddingBottom: "6px",
        textDecoration: "underline",
        width: "100%",
        color: "#000000",
        fontWeight: 500,
        opacity: 0.96,
        textUnderlineOffset: "16px",
        textDecorationThickness: "1px",
        textDecorationColor: "#9BC2E6",
      }}
    >
      {title}
    </h1>
  );
}

export function ContentHeading({ title }: { title: string }): JSX.Element {
  return (
    <h6
      style={{
        width: "100%",
        color: "#000000",
        fontSize: 15,
        margin: 0,
        padding: 0,
        lineHeight: "3px",
      }}
    >
      {title}
    </h6>
  );
}

export const PrivacyPolicy: React.FC<IPrivacyPolicy> = ({
  handleClose,
  open,
}) => {
  return React.useMemo(() => {
    if (open)
      return (
        <Dialog
          open={open}
          maxWidth="lg"
          fullWidth
          aria-labelledby="privacy-policy-title"
          aria-describedby="privacy-policy-description"
          onClose={(_event, reason) => {
            if (reason !== "backdropClick" && reason !== "escapeKeyDown") {
              handleClose("privacy");
            }
          }}
        >
          <DialogTitle id="privacy-policy-title">
            <FormLabel
              component="legend"
              className="thin"
              style={{ margin: 0, textAlign: "center" }}
            >
              Privacy Policy
            </FormLabel>
          </DialogTitle>
          <DialogContent>
            <p className="text-justify">
              Last updated: <b>November 19, 2022</b>
            </p>
            <p className="text-justify">
              This Privacy Policy describes Our policies and procedures on the
              collection, use, and disclosure of Your information when You use
              the Service and tells You about Your privacy rights and how the
              law protects You.
            </p>
            <p className="text-justify">
              We use Your Personal data to provide and improve the Service. By
              using the Service, You agree to the collection and use of
              information in accordance with this Privacy Policy.
            </p>

            <MainHeading title="Interpretation and Definitions" />
            <br />

            <ContentHeading title="Interpretation" />
            <p className="text-justify">
              The words of which the initial letter is capitalized have meanings
              defined under the following conditions. The following definitions
              shall have the same meaning regardless of whether they appear in
              singular or in plural.
            </p>

            <br />
            <ContentHeading title="Definitions" />
            <p className="text-justify">
              For the purposes of this Privacy Policy:
            </p>
            {[
              {
                title: "Account ",
                heading:
                  "means a unique account created for You to access our Service or parts of our Service.",
              },
              {
                title: "Affiliate ",
                heading:
                  'means an entity that controls, is controlled by, or is under common control with a party, where "control" means ownership of 50% or more of the shares, equity interest, or other securities entitled to vote for election of directors or other managing authority.',
              },
              {
                title: "Application ",
                heading:
                  "means the software program provided by the Company downloaded by You on any electronic device, named BDX Wizard.",
              },
              {
                title: "Company ",
                heading:
                  '(referred to as either "the Company", "We", "Us" or "Our" in this Agreement) refers to VINAR LLC dba Wizard Analytics, 310 May Apple Court, Alpharetta GA 30005.',
              },
              {
                title: "Cookies ",
                heading:
                  "are small files that are placed on Your computer, mobile device, or any other device by a website, containing the details of Your browsing history on that website among its many uses.",
              },
              {
                title: "Country ",
                heading: "refers to: Georgia, United States.",
              },
              {
                title: "Device ",
                heading:
                  "means any device that can access the Service, such as a computer, a cellphone, or a digital tablet.",
              },
              {
                title: "Personal Data ",
                heading:
                  "is any information that relates to an identified or identifiable individual.",
              },
              {
                title: "Service ",
                heading: "refers to the Application or the Website, or both.",
              },
              {
                title: "Service Provider ",
                heading:
                  "means any natural or legal person who processes the data on behalf of the Company. It refers to third-party companies or individuals employed by the Company to facilitate the Service, to provide the Service on behalf of the Company, to perform services related to the Service, or to assist the Company in analyzing how the Service is used.",
              },
              {
                title: "Usage Data ",
                heading:
                  "refers to data collected automatically, either generated by the use of the Service or from the Service infrastructure itself (for example, the duration of a page visit).",
              },
              {
                title: "Website ",
                heading:
                  "refers to Wizard Analytics accessible from www.sovwizard.com",
              },
              {
                title: "You ",
                heading:
                  "means the individual accessing or using the Service, or the company, or other legal entity on behalf of which such individual is accessing or using the Service, as applicable.",
              },
            ].map((item, index) => (
              <p
                className="text-justify"
                key={index}
                style={{ marginLeft: "25px" }}
              >
                <b>{item.title}</b>
                {item.heading}
              </p>
            ))}

            <MainHeading title="Collecting and Using Your Personal Data" />
            <br />

            <ContentHeading title="Types of Data Collected" />
            <br />

            <ContentHeading title="Personal Data" />
            <p className="text-justify">
              While using Our Service, We may ask You to provide Us with certain
              personally identifiable information that can be used to contact or
              identify You. Personally identifiable information may include, but
              is not limited to:
            </p>
            {[
              "Email address",
              "First name and last name",
              "Phone number",
              "Address, State, Province, ZIP/Postal code, City",
              "Usage Data",
            ].map((item, index) => (
              <p key={index} style={{ marginLeft: "25px" }}>
                {item}
              </p>
            ))}

            <ContentHeading title="Usage Data" />
            <p className="text-justify">
              Usage Data is collected automatically when using the Service.
            </p>
            <p className="text-justify">
              Usage Data may include information such as Your Device's Internet
              Protocol address (e.g. IP address), browser type, browser version,
              the pages of our Service that You visit, the time and date of Your
              visit, the time spent on those pages, unique device identifiers
              and other diagnostic data.
            </p>
            <p className="text-justify">
              When You access the Service by or through a mobile device, We may
              collect certain information automatically, including, but not
              limited to, the type of mobile device You use, Your mobile
              device's unique ID, the IP address of Your mobile device, Your
              mobile operating system, the type of mobile Internet browser You
              use, unique device identifiers and other diagnostic data.
            </p>
            <p className="text-justify">
              We may also collect information that Your browser sends whenever
              You visit our Service or when You access the Service by or through
              a mobile device.
            </p>
            <br />

            <ContentHeading title="Tracking Technologies and Cookies" />
            <p className="text-justify">
              We use Cookies and similar tracking technologies to track the
              activity on Our Service and store certain information. Tracking
              technologies used are beacons, tags, and scripts to collect and
              track information and to improve and analyze Our Service. The
              technologies We use may include:
            </p>

            <ul>
              {[
                {
                  title: "Cookies or Browser Cookies.",
                  heading:
                    ". A cookie is a small file placed on Your Device. You can instruct Your browser to refuse all Cookies or to indicate when a Cookie is being sent. However, if You do not accept Cookies, You may not be able to use some parts of our Service. Unless you have adjusted Your browser setting so that it will refuse Cookies, our Service may use Cookies.",
                },
                {
                  title: "Web Beacons. ",
                  heading:
                    "Certain sections of our Service and our emails may contain small electronic files known as web beacons (also referred to as clear gifs, pixel tags, and single-pixel gifs) that permit the Company, for example, to count users who have visited those pages or opened an email and for other related website statistics (for example, recording the popularity of a certain section and verifying system and server integrity).",
                },
              ].map((item, index) => (
                <li key={index} style={{ marginLeft: "25px" }}>
                  <b>{item.title}</b>
                  {item.heading}
                </li>
              ))}
            </ul>
            <br />

            <p className="text-justify">
              Cookies can be "Persistent" or "Session" Cookies. Persistent
              Cookies remain on Your personal computer or mobile device when You
              go offline, while Session Cookies are deleted as soon as You close
              Your web browser. You can learn more about cookies on TermsFeed
              website article
            </p>
            <p className="text-justify">
              We use both Session, and Persistent Cookies for the purposes set
              out below:
            </p>

            <p style={{ marginLeft: "25px" }}>
              <b>Necessary / Essential Cookies</b>
              <span style={{ display: "block" }}>Type: Session Cookies</span>
              <span style={{ display: "block" }}>Administered by: Us</span>
              <span style={{ display: "block" }}>
                Purpose: These Cookies are essential to provide You with
                services available through the Website and to enable You to use
                some of its features. They help to authenticate users and
                prevent fraudulent use of user accounts. Without these Cookies,
                the services that You have asked for cannot be provided, and We
                only use these Cookies to provide You with those services.
              </span>
              <b>Cookies Policy / Notice Acceptance Cookies</b>
              <span style={{ display: "block" }}>Type: Persistent Cookies</span>
              <span style={{ display: "block" }}>Administered by: Us</span>
              <span style={{ display: "block" }}>
                Purpose: These Cookies identify if users have accepted the use
                of cookies on the Website.
              </span>
              <b>Functionality Cookies</b>
              <span style={{ display: "block" }}>Type: Persistent Cookies</span>
              <span style={{ display: "block" }}>Administered by: Us</span>
              <span style={{ display: "block" }}>
                Purpose: These Cookies allow us to remember choices You make
                when You use the Website, such as remembering your login details
                or language preference. The purpose of these Cookies is to
                provide You with a more personal experience and to avoid You
                having to re-enter your preferences every time You use the
                Website.
              </span>
            </p>

            <p className="text-justify">
              For more information about the cookies we use and your choices
              regarding cookies, please visit our Cookies Policy or the Cookies
              section of our Privacy Policy.
            </p>
            <br />

            <ContentHeading title="Use of Your Personal Data" />
            <p className="text-justify">
              The Company may use Personal Data for the following purposes:
            </p>

            {[
              {
                title: "To provide and maintain our Service, ",
                heading: "including to monitor the usage of our Service.",
              },
              {
                title: "To manage Your Account: ",
                heading:
                  "to manage Your registration as a user of the Service. The Personal Data You provide can give You access to different functionalities of the Service that are available to You as a registered user.",
              },
              {
                title: "For the performance of a contract: ",
                heading:
                  "the development, compliance, and undertaking of the purchase contract for the products, items, or services You have purchased or of any other contract with Us through the Service.",
              },
              {
                title: "To contact You: ",
                heading:
                  "To contact You by email, telephone calls, SMS, or other equivalent forms of electronic communication, such as a mobile application's push notifications regarding updates or informative communications related to the functionalities, products, or contracted services, including the security updates, when necessary or reasonable for their implementation.",
              },
              {
                title: "To provide You: ",
                heading:
                  "with news, special offers, and general information about other goods, services, and events which we offer that are similar to those that you have already purchased or enquired about unless You have opted not to receive such information.",
              },
              {
                title: "To manage Your requests: ",
                heading: "To attend and manage Your requests to Us.",
              },
              {
                title: "For business transfers: ",
                heading:
                  "We may use Your information to evaluate or conduct a merger, divestiture, restructuring, reorganization, dissolution, or other sale or transfer of some or all of Our assets, whether as a going concern or as part of bankruptcy, liquidation, or similar proceeding, in which Personal Data held by Us about our Service users is among the assets transferred.",
              },
              {
                title: "For other purposes: ",
                heading:
                  "We may use Your information for other purposes, such as data analysis, identifying usage trends, determining the effectiveness of our promotional campaigns, and to evaluate and improve our Service, products, services, marketing, and your experience.",
              },
            ].map((item, index) => (
              <p key={index} style={{ marginLeft: "25px" }}>
                <b>{item.title}</b>
                {item.heading}
              </p>
            ))}

            <p className="text-justify">
              We may share Your personal information in the following
              situations:
            </p>

            <ul>
              {[
                {
                  title: "With Service Providers: ",
                  heading:
                    "We may share Your personal information with Service Providers to monitor and analyze the use of our Service, to contact You.",
                },
                {
                  title: "For business transfers: ",
                  heading:
                    "We may share or transfer Your personal information in connection with, or during negotiations of, any merger, sale of Company assets, financing, or acquisition of all or a portion of Our business to another company.",
                },
                {
                  title: "With Affiliates: ",
                  heading:
                    "We may share Your information with Our affiliates, in which case we will require those affiliates to honor this Privacy Policy. Affiliates include Our parent company and any other subsidiaries, joint venture partners, or companies that We control or are under common control with Us.",
                },
                {
                  title: "With business partners: ",
                  heading:
                    "We may share Your information with Our business partners to offer You certain products, services, or promotions.",
                },
                {
                  title: "With other users: ",
                  heading:
                    "when You share personal information or otherwise interact in the public areas with other users, such information may be viewed by all users and may be publicly distributed outside.",
                },
                {
                  title: "With Your consent: ",
                  heading:
                    "We may disclose Your personal information for any other purpose with Your consent.",
                },
              ].map((item, index) => (
                <li key={index} style={{ marginLeft: "25px" }}>
                  <b>{item.title}</b>
                  {item.heading}
                </li>
              ))}
            </ul>
            <br />

            <ContentHeading title="Retention of Your Personal Data" />
            <p className="text-justify">
              The Company will retain Your Personal Data only for as long as is
              necessary for the purposes set out in this Privacy Policy. We will
              retain and use Your Personal Data to the extent necessary to
              comply with our legal obligations (for example, if we are required
              to retain your data to comply with applicable laws), resolve
              disputes, and enforce our legal agreements and policies.
            </p>
            <p className="text-justify">
              The Company will also retain Usage Data for internal analysis
              purposes. Usage Data is generally retained for a shorter period of
              time, except when this data is used to strengthen the security or
              to improve the functionality of Our Service, or We are legally
              obligated to retain this data for longer time periods.
            </p>

            <br />

            <ContentHeading title="Transfer of Your Personal Data" />
            <p className="text-justify">
              Your information, including Personal Data, is processed at the
              Company's operating offices and in any other places where the
              parties involved in the processing are located. It means that this
              information may be transferred to — and maintained on — computers
              located outside of Your state, province, country, or other
              governmental jurisdiction where the data protection laws may
              differ than those from Your jurisdiction.
            </p>
            <p className="text-justify">
              Your consent to this Privacy Policy followed by Your submission of
              such information represents Your agreement to that transfer.
            </p>
            <p className="text-justify">
              The Company will take all steps reasonably necessary to ensure
              that Your data is treated securely and in accordance with this
              Privacy Policy, and no transfer of Your Personal Data will take
              place to an organization or a country unless there are adequate
              controls in place, including the security of Your data and other
              personal information.
            </p>

            <br />

            <ContentHeading title="Delete Your Personal Data" />
            <p className="text-justify">
              You have the right to delete or request that We assist in deleting
              the Personal Data We have collected about You.
            </p>
            <p className="text-justify">
              Our Service may give You the ability to delete certain information
              about You from within the Service.
            </p>
            <p className="text-justify">
              You may update, amend, or delete Your information at any time by
              signing in to Your Account, if you have one, and visiting the
              account settings section that allows you to manage Your personal
              information. You may also contact Us to request access to,
              correct, or delete any personal information that You have provided
              to Us.
            </p>
            <p className="text-justify">
              Please note, however, that We may need to retain certain
              information when we have a legal obligation or lawful basis to do
              so.
            </p>

            <br />

            <ContentHeading title="Disclosure of Your Personal Data" />
            <br />
            <ContentHeading title="Business Transactions" />
            <p className="text-justify">
              If the Company is involved in a merger, acquisition, or asset
              sale, Your Personal Data may be transferred. We will provide
              notice before Your Personal Data is transferred and becomes
              subject to a different Privacy Policy.
            </p>
            <br />

            <ContentHeading title="Law enforcement" />
            <p className="text-justify">
              Under certain circumstances, the Company may be required to
              disclose Your Personal Data if required to do so by law or in
              response to valid requests by public authorities (e.g. a court or
              a government agency).
            </p>
            <br />

            <ContentHeading title="Other legal requirements" />
            <p className="text-justify">
              The Company may disclose Your Personal Data in the good faith
              belief that such action is necessary to:
            </p>
            <ul>
              {[
                "Comply with a legal obligation",
                "Protect and defend the rights or property of the Company",
                "Prevent or investigate possible wrongdoing in connection with the Service",
                "Protect the personal safety of Users of the Service or the public",
                "Protect against legal liability",
              ].map((item, index) => (
                <li key={index} style={{ marginLeft: "25px" }}>
                  {item}
                </li>
              ))}
            </ul>
            <br />

            <ContentHeading title="Security of Your Personal Data" />
            <p className="text-justify">
              The security of Your Personal Data is important to Us, but
              remember that no method of transmission over the Internet, or
              method of electronic storage is 100% secure. While We strive to
              use commercially acceptable means to protect Your Personal Data,
              We cannot guarantee its absolute security.
            </p>

            <MainHeading title="Links to Other Websites" />
            <p className="text-justify">
              Our Service may contain links to other websites that are not
              operated by Us. If You click on a third-party link, You will be
              directed to that third-party's site. We strongly advise You to
              review the Privacy Policy of every site You visit.
            </p>
            <p className="text-justify">
              We have no control over and assume no responsibility for the
              content, privacy policies, or practices of any third-party sites
              or services.
            </p>

            <MainHeading title="Changes to this Privacy Policy" />
            <p className="text-justify">
              We may update Our Privacy Policy from time to time. We will notify
              You of any changes by posting the new Privacy Policy on this page.
            </p>
            <p className="text-justify">
              We will let You know via email and/or a prominent notice on Our
              Service, prior to the change becoming effective and update the
              "Last updated" date at the top of this Privacy Policy.
            </p>
            <p className="text-justify">
              You are advised to review this Privacy Policy periodically for any
              changes. Changes to this Privacy Policy are effective when they
              are posted on this page.
            </p>

            <MainHeading title="Contact Us" />
            <p className="text-justify">
              If you have any questions about this Privacy Policy, You can
              contact us:
            </p>
            {[
              "By email: contact@wizardanalytics.io",
              "By visiting this page on our website: www.sovwizard.com",
            ].map((item, index) => (
              <p key={index} style={{ marginLeft: "25px" }}>
                {item}
              </p>
            ))}
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => handleClose("privacy")}
              color="inherit"
              variant="contained"
              size="small"
            >
              Close
            </Button>
          </DialogActions>
        </Dialog>
      );
    else return null;
  }, [open]);
};
