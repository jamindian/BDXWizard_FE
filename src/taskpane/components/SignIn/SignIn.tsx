import React, {useCallback, useEffect, useState} from "react";
import { useDispatch } from "react-redux";

import { FormControlLabel, Checkbox, TextField } from '@mui/material';
import { AuthWrapper } from "@hoc/AuthWrapper";
import { toast } from 'react-toastify';
import CustomButton from "@components/CustomButton/CustomButton";
import { useCookies } from 'react-cookie';
import { PasswordField } from "@components/CustomField/PasswordField";
import CommonMethods from "@taskpaneutilities/CommonMethods";
import { AlertsMsgs } from "@taskpaneutilities/Constants";
import NetworkCalls from "@taskpane/services/ApiNetworkCalls";
import { setIsLoggedIn } from "@redux/Actions/Auth";

const SignInPage: React.FC<{ setTabValue: (n: number) => void }> = ({ setTabValue }) => {

  const dispatch = useDispatch();
  const [cookies, setCookie, removeCookie] = useCookies(['credentials']);

  const [account, setAccount] = useState<{ email: string, password: string, otp?: string; }>({ email: "", password: "" });
  const [isReset, setIsReset] = useState<boolean>(false);
  const [isLoginError, setIsLoginError] = useState<boolean>(false);
  const [isOtpRequired, setIsOtpRequired] = useState<boolean>(false);
  const [confirmReset, setConfirmReset] = useState<boolean>(false);
  const [accountReset, setAccountReset] = useState<{ email: string, new_password: string, otp: string }>({ email: '', new_password: '', otp: '' });
  const [rememberMe, setRememberMe] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if(cookies && Object.keys(cookies)?.length > 0 && cookies?.credentials){
      setAccount({ email: cookies?.credentials?.email, password: CommonMethods.encryptDecryptPassword(cookies?.credentials?.password, false) });
      setRememberMe(true);
    }
  }, []);

  const doRememberMe = async (flag: boolean) => {
    if((account.email || account.password) && flag){
      setCookie("credentials", 
        JSON.stringify({ email: account.email, password: CommonMethods.encryptDecryptPassword(account.password, true) }), 
        { secure: true, expires: CommonMethods.getTomorrowDate() }
      );
    } else {
      removeCookie("credentials");
    }

    setRememberMe(flag);
  };

  // Input value change and updated in state
  const onInputChange = useCallback((e: any) => {
    const { name, value } = e.target;
    setAccount({ ...account, [name]: value });
  }, [account]);

  const onConfirmInputChange = useCallback((e: any) => {
    setAccountReset({ ...accountReset, [e.target.name]: e.target.value });
  }, [accountReset]);

  const onLogin = (): void => {
    if(!account.email || !account.password){
      toast.error(AlertsMsgs.requiredFields);
    }
    else if(!CommonMethods.validateEmail(account.email)){
      toast.error("Enter a valid email address.");
    } else {
      setLoading(true);
      
      if(isOtpRequired){
        if(!account?.otp){
          toast.error(AlertsMsgs.requiredFields);
          setLoading(false);
        } else {
          onUserLogin(account);
        }
      }

      if(!isOtpRequired){
        onUserLogin(account);
      }
    }
  };

  async function onUserLogin(account: { email: string, password: string, otp?: string; }): Promise<void> {
    NetworkCalls.userSignIn(account).then((res) => {
      toast.success("Logged in successfully!");
      CommonMethods.setAccessToken(res.data.access);
      dispatch(setIsLoggedIn(true));
      setLoading(false);
      setIsLoginError(false);
    }).catch((e) => {
      setLoading(false);
      setIsLoginError(true);
      localStorage.removeItem("token");
      toast.error(e.response.data.detail || AlertsMsgs.somethingWentWrong);
    });
  }

  const onForgotPassword = (): void => {
    if (!account.email) {
      toast.error("Please provide your email.");
    } else {
      setLoading(true);
      NetworkCalls.forgotPassword({ email: account.email }).then(() => {
        toast.success("Reset information sent to your email!");
        setConfirmReset(true);
        setLoading(false);
        setIsOtpRequired(true);
      }).catch((e) => {
        setLoading(false);
        toast.error(e.response.data.error || AlertsMsgs.somethingWentWrong);
        setIsOtpRequired(false);
      });
    }
  };

  const onConfirmReset = (): void => {
    if (!accountReset.email || !accountReset.new_password || !accountReset.otp) {
      toast.error(AlertsMsgs.requiredFields);
    } else {
      setLoading(true);
      NetworkCalls.resetPassword(accountReset).then(() => {
        toast.success("Password has been reset. Please login.");
        setLoading(false);
        setConfirmReset(false);
        setIsReset(false);
        setIsOtpRequired(false);
      }).catch((e) => {
        setLoading(false);
        toast.error(e.response.data[0] || AlertsMsgs.somethingWentWrong);
      });
    }
  };

  return (
    
    <AuthWrapper button={confirmReset ? "" : " Sign up."} message={confirmReset ? 'Confirm reset password' : "Don't have an account ?"} onClick={() => setTabValue(1)}>
    {confirmReset ?
      <>
        <div className="control-wrapper">
          <div className="w-100">
            <TextField label="Email" name="email" required type="email" value={accountReset.email} onChange={onConfirmInputChange} variant="outlined" />
          </div>
        </div>
        <div className="control-wrapper">
          <div className="w-100">
            <PasswordField error={false} isRequired
              value={accountReset.new_password} onChange={onConfirmInputChange}
              pressEnter={() => console.log()} name="new_password"
            />
          </div>
        </div>
        <div className="control-wrapper">
          <div className="w-100">
            <TextField label="OTP secret" name="otp" required type="text" value={accountReset.otp} onChange={onConfirmInputChange} variant="outlined" />
          </div>
        </div>
        <CustomButton loading={loading} onClick={() => onConfirmReset()} title="Confirm Reset" />
        <div className="d-flex justify-content-center">
          <div className="p-2">
            <p className="text-link">Reset information sent to your email.</p>
          </div>
        </div>
      </>
      :
      <>
        {isLoginError && <p className="error-text">{isLoginError}</p>}

        <div className="control-wrapper">
          <div className="w-100">
            <TextField error={isLoginError} label="Email" name="email" required type="email" autoComplete="on" value={account.email} onChange={onInputChange} variant="outlined" />
          </div>
        </div>

        {!isReset &&
          <div className="control-wrapper">
            <div className="w-100">
              <PasswordField error={isLoginError} isRequired
                value={account.password} onChange={onInputChange}
                pressEnter={() => !isReset ? onLogin() : onForgotPassword()}
              />
            </div>
          </div>
        }

        {(!isReset && isOtpRequired) &&
          <div className="control-wrapper">
            <div className="w-100">
              <TextField error={isLoginError} label="OTP" name="otp" required type="text" autoComplete="on" value={account?.otp} onChange={onInputChange} variant="outlined" 
                onKeyPress={(e) => e.key === 'Enter' && onLogin()}
              />
            </div>
          </div>
        }

        { !isReset && (
          <FormControlLabel
            sx={{ fontSize: 13 }}
            control={
              <Checkbox 
                checked={rememberMe} onChange={(e) => doRememberMe(e.target.checked)} name="Remember me" 
                inputProps={{ 'aria-label': 'controlled' }} size="small"
              />
            }
            label="Remember me"
          />
        )}

        <CustomButton loading={loading} onClick={() => !isReset ? onLogin() : onForgotPassword() } title={ !isReset ? 'Login' : 'Reset Password' } />

        <div className="d-flex justify-content-center">
          <div className="p-2 cursor-pointer">
            <p className="text-link btn-hover" onClick={() => setIsReset((prevState) => !prevState)}>
              {isReset ? 'Remembered? Sign In' : 'Forgot Password? Reset here.'}
            </p>
          </div>
        </div>
      </>
    }
    </AuthWrapper>

  );
};

export default SignInPage;
