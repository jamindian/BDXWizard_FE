import React, { useCallback, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import { TextField } from "@mui/material";
import FormGroup from "@mui/material/FormGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import { toast } from "react-toastify";
import { signUpFormFields } from "@taskpaneutilities/Constants";
import { AuthWrapper } from "@hoc/AuthWrapper";
import CustomButton from "@components/CustomButton/CustomButton";

interface IAccount {
  first_name: string;
  email: string;
  password: string;
  last_name: string;
  company_key: string;
}

const SignUpPage = () => {
  const dispatch = useDispatch();
  const [account, setAccount] = useState<IAccount>({
    first_name: "",
    email: "",
    password: "",
    last_name: "",
    company_key: "",
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
      !account.first_name ||
      !account.last_name ||
      !account.company_key ||
      !account.email ||
      !account.password
    ) {
      let err = {};
      Object.keys(account).forEach((key) => {
        if (!account[key]) {
          err = { ...err, [key]: ["This field may not be blank."] };
        } else {
          err = { ...err, [key]: "" };
        }
      });

    } else {
      if (!checkbox.flag) {
        toast.error("Please agree to all the terms and conditions");
      } else {
        setLoading(true);

        setTimeout(() => {
          setLoading(false);
        }, 6000);
      }
    }
  };

  const onInputChange = useCallback(
    (e: any) => {
      const { name, value } = e.target;
      setAccount({ ...account, [name]: value });
    },
    [account]
  );

  const handleChange = useCallback(
    (value: any, key: string) => {
      setCheckbox({ ...checkbox, [key]: value });
    },
    [checkbox]
  );

  return (
    <AuthWrapper message="Do you have an account ? Sign in.">
      {signUpFormFields.map((field, index) => (
        <div className="control-wrapper" key={index}>
          <div className="w-100">
            <TextField
              error={error?.[field.key] ? true : false}
              label={field.label}
              name={field.key}
              required
              type={field.type}
              value={account[field.key]}
              onChange={onInputChange}
              variant="outlined"
            />
          </div>
          {error?.[field.key] && (
            <p className="error-text">{error?.[field.key][0]}</p>
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
            <p style={{ fontSize: 13 }}>
              I agree to <b>SOV Wizard</b>
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
    </AuthWrapper>
  );
};

export default SignUpPage;
