import * as React from "react";

import {
  FormLabel,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@mui/material";
import { ContentHeading, PrivacyPolicy } from "./PolicyTerms";

interface ITermsOfConditions {
  open: boolean;
  handleClose: (key: string) => void;
}

export const TermsOfConditions: React.FC<ITermsOfConditions> = ({
  handleClose,
  open,
}) => {
  const [viewPolicy, setViewPolicy] = React.useState<boolean>(false);

  return React.useMemo(() => {
    if (viewPolicy)
      return (
        <PrivacyPolicy
          open={viewPolicy}
          handleClose={() => setViewPolicy(false)}
        />
      );
    else if (open)
      return (
        <Dialog
          open={open}
          maxWidth="lg"
          fullWidth
          aria-labelledby="terms-title"
          aria-describedby="terms-description"
          onClose={(_event, reason) => {
            if (reason !== "backdropClick" && reason !== "escapeKeyDown") {
              handleClose("terms");
            }
          }}
        >
          <DialogTitle id="terms-title">
            <FormLabel
              component="legend"
              className="thin"
              style={{ margin: 0, textAlign: "center" }}
            >
              BDX WIZARD TERMS & CONDITIONS
            </FormLabel>
          </DialogTitle>
          <DialogContent>
            <p className="text-justify">
              Please read these Terms and Conditions carefully before using BDX
              Wizard.
            </p>
            <ContentHeading title="Definitions:" />
            <p className="text-justify">
              For the purposes of these Terms and Conditions:
            </p>
            {[
              {
                title: "Account ",
                heading:
                  "means a unique account created for You to access our Service or parts of our Service.",
              },
              {
                title: "Authorized User ",
                heading:
                  "means each Customer employee designated by Customer to have access to any Platform or Service.",
              },
              {
                title: "Confidential Information ",
                heading:
                  'means information about a Customer or Company’s business affairs, products, Intellectual Property, trade secrets, third-party confidential information, and other sensitive or proprietary information whether orally or in written , electronic, or other form or media/in written or electronic form or media, whether or not marked, designated or otherwise identified as "confidential", and with respect to Company, shall also include: (a) its proprietary information consisting of non-public trade secret, commercially valuable, or competitively sensitive information or other material and information relating to products, projects, operations, customers, finances, business, affairs, or activities, including but not limited to: (i) information about systems, technologies, procedures, methodologies, and practices used in performing its services; (ii) financial information, market analyses and forecasts, sales and marketing research, proposed products or services, customer lists and other customer-specific information, personnel information, technical information, contracts, analyses, projections, forecasts, policies, procedures, plans, software (both source and object code), data files, file layouts, data bases, algorithms, and technical know-how; (iii) all Wizard Analytics Data (collectively “Wizard Analytics Non-Disclosable Information”), and (b) Information that is proprietary or confidential to Wizard Analytics Affiliates and/or third parties to whom it or they may owe an obligation of confidentiality.',
              },
              {
                title: "Customer ",
                heading: "has the meaning noted in Paragraph 1(vii) below.",
              },
              {
                title: "Customer Data ",
                heading:
                  "means data, and other content, in any form or medium, that is submitted, posted, or otherwise transmitted by or on behalf of Customer or an Authorized User through the Service.",
              },
              {
                title: "Company ",
                heading:
                  '(referred to as either "the Company", "We", "Us" or "Our" in these Terms) refers to Wizard Analytics.',
              },
              {
                title: "Service ",
                heading:
                  "(referred to either as “Service” or “BDX Wizard”) refers to the Website for that certain hosted “software as a service” referenced in the applicable Master Service Agreement.",
              },
              {
                title: "Master Servicing Agreement ",
                heading:
                  "means the master servicing agreement entered into by your employer (referred to as the “Customer”) and Wizard Analytics, which is incorporated herein by this reference.",
              },
              {
                title: "Terms and Conditions ",
                heading:
                  '(also referred as "Terms") mean these Terms and Conditions that form the entire agreement between You and the Company regarding the use of the Service.',
              },
              {
                title: "Website ",
                heading:
                  "refers to Wizard Analytics accessible from www.sovwizard.com.",
              },
              {
                title: "You ",
                heading: "means the individual accessing or using the Service.",
              },
              {
                title: "Intellectual Property ",
                heading:
                  "means all information, concepts, inventions (whether or not protected under patent laws),  ideas or materials of a technical or creative nature (such as research and development results, designs and specifications, computer source and object code, patent applications, and other materials and concepts relating to a Party's products, services, processes, technology or other intellectual property rights), works of authorship, information fixed in any tangible medium of expression (whether or not protected under copyright laws), moral rights, mask works, trademarks, trade names, trade dress, trade secrets, publicity rights, names, likenesses, know-how, ideas (whether or not protected under trade secret laws) and all other subject matter protected under patent (or which is not patented, but is subject matter that is protected under patent law), copyright, mask work, trademark, trade secret, or other laws, whether existing now or in the future, whether statutory or common law, in any jurisdiction in the world, for all media now known or later developed, including all new or useful art, combinations, discoveries, formulae, algorithms, specifications, manufacturing techniques, technical developments, systems, computer architecture, artwork, software, programming, applets, scripts, designs, processes and methods of doing business.",
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
            <br />
            <ContentHeading title="Acknowledgement:" />
            <p className="text-justify">
              These are the Terms and Conditions governing the use of this
              Service and the agreement that operates between You and the
              Company. These Terms and Conditions set out the rights and
              obligations of all users regarding the use of the Service.
            </p>
            <h4 style={{ textTransform: "uppercase", textAlign: "center" }}>
              NOTE: THESE TERMS OF USE CONTAINS AN ARBITRATION AND CLASS ACTION
              WAIVER PROVISION IN THE “ARBITRATION” SECTION BELOW (SECTION 8)
              THAT AFFECTS YOUR RIGHTS UNDER THESE TERMS AND CONDITIONS WITH
              RESPECT TO ANY DISPUTE BETWEEN YOU AND US OR OUR AFFILIATES.
            </h4>
            <p className="text-justify">
              Your access to and use of the Service is conditioned on Your
              acceptance of and compliance with these Terms and Conditions.
              These Terms and Conditions apply to all visitors, users and others
              who access or use the Service. Your access to and use of the
              Service is also conditioned on Your acceptance of and compliance
              with the Privacy Policy of the Company. Our Privacy Policy
              describes Our policies and procedures on the collection, use and
              disclosure of Your personal information when You use the
              Application or the Website and tells You about Your privacy rights
              and how the law protects You. Please read Our Privacy Policy
              carefully before using Our Service.
            </p>
            <p className="text-justify">
              By accessing this Service, You acknowledge that You are an
              Authorized User who appears on Your employer’s Authorized User
              List and are lawfully in possession of the Login Credentials
              necessary to access this Service. You are responsible for
              safeguarding the Login Credentials that You use to access the
              Service and for any activities or actions under Your Login
              Credentials. You agree not to disclose Your password to any third
              party. You must notify Us immediately upon becoming aware of any
              breach of security or unauthorized use of Your account.
            </p>
            <br />
            <ContentHeading title="THIRD-PARTY TOOL INTEGRATIONS:" />
            <p className="text-justify">
              If applicable, the Service may integrate with third-party
              services. You hereby consent to the sharing of the information in
              the Service with these third party services and certifies that it
              has any and all required consents for doing so.
            </p>
            <br />
            <ContentHeading title="DISCLAIMER OF WARRANTIES:" />
            <p className="text-justify">
              Bdx wizard is provided “as is” and with all faults and defects and
              without warranty of any kind. Wizard analytics makes no
              representations or warranties, express or implied, regarding bdx
              wizard, including any representation that the services thereunder
              will be uninterrupted or error-free. To the fullest extent
              permitted under applicable law, wizard analytics disclaims any
              implied or statutory warranty, including any implied warranty of
              title, non-infringement, merchantability, or fitness for a
              particular purpose in respect of bdx wizard. For the avoidance of
              doubt, all bdx wizard updates are prelease, are expected to
              contain defects that may be material, and are not expected to
              operate at the level of performance or compatibility of a final,
              generally available product offering. bdx wizard may not operate
              accurately and may be substantially modified before public
              availability or withdrawn at any time. Accordingly, access to and
              use of the bdx wizard is entirely at customer’s own risk. In no
              event shall wizard analytics be liable for any damage whatsoever
              arising out of the use of or inability to use the bdx wizard, even
              if wizard analytics has been advised of the possibility of such
              damages. You are advised to safeguard important data, to use
              caution, and not to rely in any way on the correct functioning or
              performance of bdx wizard.
            </p>
            <br />
            <ContentHeading title="LIMITATION OF LIABILITY:" />
            <p className="text-justify">
              To the fullest extent permissible by applicable law, neither
              company nor any of company’s directors, officers, shareholders,
              employees, contractors, agents, representatives, or affiliates
              (the “company parties”) shall be liable for any indirect,
              incidental, consequential, special, exemplary or punitive damages
              (including, without limitation, damages for loss of business,
              profits, use or data), whether based on warranty, contract,
              statute, tort (including, without limitation, negligence and
              strict liability) or any other legal theory, even if the company
              parties have been advised of the possibility of such damages,
              arising out of or relating in any way to our provision of (or
              failure to provide) products or services, or from unauthorized
              access to or alteration of your data, even if a remedy set forth
              herein is found to have failed its essential purpose. You
              specifically acknowledge that the company parties are not liable
              for any defamatory, offensive or illegal conduct of other users or
              third parties and that the risk of injury from the foregoing rests
              entirely with you. Furthermore, the shutterfly parties will have
              no liability to you or to any third party for any third-party
              content uploaded. Your sole and exclusive remedy for
              dissatisfaction with products is to obtain a refund for the
              payment(s) made for the service during the last three (3) months,
              and your sole and exclusive remedy for dissatisfaction with
              services is to stop using the services. To the fullest extent
              permissible by applicable law, the maximum liability of the
              company parties arising out of or relating in any way to our
              provision of (or failure to provide) products or services shall be
              the actual price paid during the last three (3) months by you.
              Note: certain jurisdictions may not allow the exclusion or
              limitation of incidental, consequential or certain other types of
              damages, so some of the above exclusions or limitations may not
              apply to you.
            </p>
            <br />
            <ContentHeading title="INDEMNITY:" />
            <p className="text-justify">
              You agree to indemnify and hold Wizard Analytics, its officers,
              directors, and employees harmless from any losses (including
              attorneys’ fees) that result from any third-party claims related
              to Your access, use, or misuse of the Service, or any act or
              omission by You in violation of these Terms.
            </p>
            <br />
            <ContentHeading title="COMPLIANCE WITH LAWS AND LEGAL ADVICE:" />
            <p className="text-justify">
              Each party must comply with all laws, rules, or regulations
              applicable to such party’s activities in relation to these Terms,
              including export control laws of the United States that apply to
              the Application and may prohibit the use of the Application in
              certain sanctioned or embargoed countries. Wizard Analytics will
              not provide You with legal advice regarding compliance with data
              privacy or other relevant laws, rules, or regulations in the
              jurisdictions in which You use the BDX Wizard (“Laws”). The
              parties acknowledge and agree that not all features, functions,
              and capabilities of the BDX Wizard may be used in all
              jurisdictions. You recognize that certain features, functions, and
              capabilities may need to be configured differently or not used in
              certain jurisdictions to comply with applicable local Laws. In
              certain jurisdictions, consents may need to be obtained from
              individuals submitting data via the BDX Wizard as to the intended
              purpose, storage, distribution, access, and use of the data
              submitted (“Local Use Decisions”). You are responsible for Local
              Use Decisions, and Wizard Analytics disclaims all liability for
              Local Use Decisions.
            </p>
            <br />
            <ContentHeading title="ARBITRATION AGREEMENT:" />
            <p className="text-justify">
              If You are in the United States (including its possessions and
              territories), You and Company agree that any dispute, claim, or
              controversy arising out of or relating in any way to a Company
              product or service, these Terms and Conditions and this
              Arbitration Agreement, or your relationship with Company (past,
              present, or future) shall be determined by binding arbitration.
              Arbitration is more informal than a lawsuit in court. Arbitration
              uses a neutral arbitrator instead of a judge or jury, allows for
              more limited discovery than in court, and is subject to very
              limited review by courts. Arbitrators can award the same damages
              and relief that a court can award. You agree that, by agreeing to
              these Terms and Conditions, the U.S. Federal Arbitration Act
              governs the interpretation and enforcement of this provision, and
              that You and Company are each waiving the right to a trial or to
              participate in a class action. This arbitration provision shall
              survive termination of this agreement, the applicable Master
              Service Agreement, and/or the termination of your Account.
            </p>
            <p className="text-justify">
              If You elect to seek arbitration, You must first send to Company,
              by certified mail, a written Notice of your claim (“Notice”). The
              Notice to Company must be addressed to: [address] (“Notice
              Address”). If Company initiates arbitration, it will send a
              written Notice to the email address used for your Account. A
              Notice, whether sent by You or by Company, must (a) describe the
              nature and basis of the claim or dispute; (b) set forth the
              specific relief sought and the basis for the calculations; (c)
              include your name, the email address associated with your Account,
              your current phone number, mailing address, and email address, and
              your signature.{" "}
            </p>
            <p className="text-justify">
              If You and Company do not reach an agreement to resolve the claim
              within 60 days after the Notice is received, You or Company may
              commence an arbitration proceeding. The parties agree that the
              notice required by this Paragraph is a material provision of these
              Terms. Unless You and Company agree otherwise, any arbitration
              hearings will take place virtually, or in the City, County, and
              State of New York and shall be governed by the Arbitration Rules
              of the American Arbitration Association (“AAA”), as modified by
              these Terms, and will be administered by AAA. Your and Company’s
              right to recover attorneys’ fees, costs and arbitration fees,
              shall be governed the laws that apply to the parties’ dispute, as
              well as any applicable arbitration rules.
            </p>
            <p className="text-justify">
              The arbitrator is bound by these Terms. All issues are for the
              arbitrator to decide, including issues relating to the scope and
              enforceability of this arbitration agreement. Regardless of the
              manner in which the arbitration is conducted, the arbitrator shall
              issue a reasoned written decision sufficient to explain the
              essential findings and conclusions on which the award is based.
              The arbitrator may award declaratory or injunctive relief only in
              favor of the individual party seeking relief and only to the
              extent necessary to provide relief warranted by that party’s
              individual claim.{" "}
            </p>
            <br />
            <ContentHeading title="INTELLECTUAL PROPERTY:" />
            <p className="text-justify">
              The Service and its original content (excluding Customer Data
              provided by You or other users), features. and functionality, in
              addition to Company’s Confidential Information and Intellectual
              Property, are and will remain the exclusive property of the
              Company and You agree to not disclose any such information without
              the express written consent of Company.
            </p>
            <p className="text-justify">
              You further consent and agree that You will not, nor permit or
              encourage any third party to, directly or indirectly (i) reverse
              engineer, decompile, disassemble or otherwise attempt to discover
              or derive the source code, object code or underlying structure,
              ideas, know-how or algorithms relevant to the Service; (ii)
              modify, translate, or create derivative works based on the
              Service; (iii) modify, remove or obstruct any proprietary notices
              or labels; or (iv) use the Service in any manner to assist or take
              part in the development, marketing or sale of a product
              potentially competitive with the Service.{" "}
            </p>
            <br />
            <ContentHeading title="WIZARD ANALYTICS PRIVACY POLICY:" />
            <p style={{ fontSize: "14px" }}>
              View our Privacy Policy by clicking.
              <b
                style={{ textDecoration: "underline", marginLeft: "5px" }}
                className="cursor-pointer"
                onClick={() => setViewPolicy(true)}
              >
                Click
              </b>
            </p>

            <br />
            <ContentHeading title="MISCELLANEOUS:" />
            <p className="text-justify">
              Company provides this Service for use only by persons located in
              the United States. Company makes no claims that the Service or any
              of its content is accessible or appropriate outside of the United
              States. Access to the Service may not be legal by certain persons
              or in certain countries or territories. If You access the Service
              from outside the United States, You do so on Your own initiative
              and are responsible for compliance with laws relating thereto.
            </p>
            <p className="text-justify">
              These Terms are the complete and exclusive statement of the
              agreement with respect to the subject matter hereof and supersede
              all other communications or representations or agreements (whether
              oral, written, or otherwise) relating thereto. In the event of an
              actual irreconcilable conflict or inconsistency among the
              provisions of these Terms and the terms of Master Service
              Agreement applicable to Your use of the Service, the terms of the
              Master Service Agreement shall take precedence in reconciling the
              conflict or inconsistency unless the parties specifically agree in
              writing otherwise.{" "}
            </p>
            <p className="text-justify">
              If any provision of these Terms shall to any extent be held
              invalid, illegal, or unenforceable, the validity, legality, and
              enforceability of the remaining provisions of these Terms shall in
              no way be affected or impaired thereby and each such provision of
              these Terms shall be valid and enforceable to the fullest extent
              permitted by law. In such case, these Terms shall be reformed to
              the minimum extent necessary to correct any invalidity,
              illegality, or unenforceability, while preserving to the maximum
              extent the rights and expectations of the parties hereto, as
              expressed herein. The Paragraph headings in these Terms are for
              convenience only and shall have no legal or contractual effect.
            </p>
            <h4 style={{ textTransform: "uppercase", textAlign: "center" }}>
              BY USING THE SERVICE, YOU ACKNOWLEDGE THAT YOU HAVE READ THIS
              AGREEMENT AND AGREE TO BE BOUND BY ITS TERMS.
            </h4>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => handleClose("terms")}
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
  }, [open, viewPolicy]);
};
