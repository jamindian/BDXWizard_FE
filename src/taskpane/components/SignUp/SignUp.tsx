import React, { useCallback, useState } from "react";
import { useDispatch } from "react-redux";

import { TextField } from "@mui/material";
import FormGroup from "@mui/material/FormGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import { toast } from "react-toastify";
import { AlertsMsgs, signUpFormFields } from "@taskpaneutilities/Constants";
import { AuthWrapper } from "@hoc/AuthWrapper";
import CustomButton from "@components/CustomButton/CustomButton";
import { TermsOfConditions } from "./TermsConditions";
import { PrivacyPolicy } from "./PolicyTerms";
import NetworkCalls from "@taskpane/services/ApiNetworkCalls";

interface IAccount {
  email: string;
  password: string;
  company_name: string;
}

const SignUpPage: React.FC<{ setTabValue: (n: number) => void }> = ({ setTabValue }) => {
  const dispatch = useDispatch();
  const [values, setValues] = useState<IAccount>({
    email: "",
    password: "",
    company_name: "",
  });
  const [checkbox, setCheckbox] = useState<{ active: string; flag: boolean }>({
    flag: false,
    active: "",
  });
  const [error, setError] = useState<{ [key: string]: boolean; }>();
  const [loading, setLoading] = useState<boolean>(false);

  // User Register Function
  const onRegister = (): void => {
    if (
      !values.company_name ||
      !values.email ||
      !values.password
    ) {
      let err = {};
      Object.keys(values).forEach((key) => {
        if (!values[key]) {
          err = { ...err, [key]: ["This field may not be blank."] };
        } else {
          err = { ...err, [key]: "" };
        }
      });

      setError(err);
    } else {
      if (!checkbox.flag) {
        toast.error("Please agree to all the terms and conditions");
      } else {
        setLoading(true);
        NetworkCalls.userSignUp(values).then(() => {
          toast.success("Your account has been created successfully.");
          setLoading(false);
          setTabValue(0);
        }).catch((e) => {
          toast.error(e.response.data[0] || e.response.data.email[0] || AlertsMsgs.somethingWentWrong);
          setLoading(false);
        });
      }
    }
  };

  const onInputChange = useCallback(
    (e: any) => {
      const { name, value } = e.target;
      setValues({ ...values, [name]: value });
      setError({ ...error, [name]: "" });
    },
    [values, error]
  );

  const handleChange = useCallback(
    (value: any, key: string) => {
      setCheckbox({ ...checkbox, [key]: value });
    },
    [checkbox]
  );

  return (
    <AuthWrapper button=" Sign in." message="Already have an account ?" onClick={() => setTabValue(0)}>
      {signUpFormFields.map((field, index) => (
        <div className="control-wrapper" key={index}>
          <div className="w-100">
            <TextField
              error={error?.[field.key] ? true : false}
              label={field.label}
              name={field.key}
              required
              type={field.type}
              value={values[field.key]}
              onChange={onInputChange}
              variant="outlined"
            />
          </div>
          {error?.[field.key] && (
            <p className="error-text text-sm m-0">{error?.[field.key][0]}</p>
          )}
        </div>
      ))}

      <FormGroup>
        <FormControlLabel
          control={
            <Checkbox
              size="small"
              checked={checkbox.flag}
              onChange={(event) => handleChange(event.target.checked, "flag")}
            />
          }
          label={
            <p style={{ fontSize: 13 }} className="m-0">
              I agree to <b>BDX Wizard</b>
              <span
                style={{
                  textDecoration: "underline",
                  color: "#0f94ce",
                  margin: "0 3px",
                }}
                onClick={() => handleChange("terms", "active")}
              >
                Terms of Use
              </span>
              &
              <span
                style={{
                  textDecoration: "underline",
                  color: "#0f94ce",
                  marginLeft: "3px",
                }}
                onClick={() => handleChange("privacy", "active")}
              >
                Privacy Policy
              </span>
              .
            </p>
          }
        />
      </FormGroup>

      <CustomButton
        loading={loading}
        onClick={() => onRegister()}
        title="Register"
      />

      <PrivacyPolicy
        open={checkbox.active === "privacy"}
        handleClose={() => handleChange("", "active")}
      />
      <TermsOfConditions
        open={checkbox.active === "terms"}
        handleClose={() => handleChange("", "active")}
      />
    </AuthWrapper>
  );
};

export default SignUpPage;
