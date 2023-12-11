import React, {useCallback, useEffect, useState} from "react";
import { useDispatch, useSelector } from "react-redux";

import { FormControlLabel, Checkbox, TextField } from '@mui/material';
import { AuthWrapper } from "@hoc/AuthWrapper";
import { toast } from 'react-toastify';
import CustomButton from "@components/CustomButton/CustomButton";
import { useCookies } from 'react-cookie';
import { PasswordField } from "@components/CustomField/PasswordField";
import CommonMethods from "@taskpaneutilities/CommonMethods";

const SignInPage: React.FC<{ setTabValue: (n: number) => void }> = ({ setTabValue }) => {

  const dispatch = useDispatch();
  const [cookies, setCookie, removeCookie] = useCookies(['credentials']);

  const [account, setAccount] = useState<{ email: string, password: string, otp?: string; }>({ email: "", password: "" });
  const [isReset, setIsReset] = useState<boolean>(false);
  const [isLoginError, setIsLoginError] = useState<boolean>(false);
  const [isOtpRequired, setIsOtpRequired] = useState<boolean>(false);
  const [confirmReset, setConfirmReset] = useState<boolean>(false);
  const [accountReset, setAccountReset] = useState<{ email: string, password: string, last_otp_secret: string }>({ email: '', password: '', last_otp_secret: '' });
  const [rememberMe, setRememberMe] = useState<boolean>(false);

  useEffect(() => {
    if(cookies && Object.keys(cookies)?.length > 0 && cookies?.credentials){
      setAccount({ email: cookies?.credentials?.email, password: CommonMethods.encryptDecryptPassword(cookies?.credentials?.password, false) });
      setRememberMe(true);
    }
  }, []);

  // useEffect(() => {
  //   toggleFormUi();
  // }, [isEmailSent, isConfirmedReset]);

  // const toggleFormUi = (): void => {
  //   if (isEmailSent) {
  //     setConfirmReset(true);
  //   }
  //   if (isConfirmedReset) {
  //     setConfirmReset(false);
  //     setIsReset(false);
  //   }
  // }

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

  // call Redux action for Login
  const onLogin = (): void => {
    if(!account.email || !account.password){
    //   toast.error(AlertsMsgs.requiredFields);
    }
    else if(!CommonMethods.validateEmail(account.email)){
      toast.error("Enter a valid email address.");
    } else {
    //   dispatch(setOnLoginStatus('loading'));
      
    //   if(isOtpRequired){
    //     if(!account?.otp){
    //       toast.error(AlertsMsgs.requiredFields);
    //       dispatch(setOnLoginStatus('idle'));
    //     } else {
    //       dispatch(onUserLoginViaOtp(account));
    //     }
    //   }

    //   if(!isOtpRequired){
    //     dispatch(onUserLogin(account));
    //   }

      setTimeout(() => {
        // dispatch(setOnLoginStatus('idle'));
      }, 2000);
    }
  };

  // Input value change and updated in state
  const onInputChange = useCallback((e: any) => {
    const { name, value } = e.target;
    setAccount({ ...account, [name]: value });
  }, [account]);

  //For reset password
  const onReset = (): void => {
    if (!account.email) {
      toast.error("Please provide your email.");
    } else {
      const email = account.email;
    //   dispatch(setOnLoginStatus('loading'));
    //   dispatch(onForgotPassword({ "email": email }));
    }
  };

  const onConfirmInputChange = useCallback((e: any) => {
    setAccountReset({ ...accountReset, [e.target.name]: e.target.value });
  }, [accountReset]);

  const onConfirmReset = (): void => {
    if (!accountReset.email || !accountReset.password || !accountReset.last_otp_secret) {
      toast.error("Fields with (*) are required.");
    } else {
    //   dispatch(setOnLoginStatus('loading'));
    //   dispatch(onConfirmResetPassword(accountReset));      
    }
  };

  return (
    
    <AuthWrapper message={confirmReset ? 'Confirm reset password' : 'Already have\'t an account ? Sign Up'} onClick={() => setTabValue(1)}>
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
              value={accountReset.password} onChange={onConfirmInputChange}
              pressEnter={() => console.log()}
            />
          </div>
        </div>
        <div className="control-wrapper">
          <div className="w-100">
            <TextField label="OTP secret" name="last_otp_secret" required type="text" value={accountReset.last_otp_secret} onChange={onConfirmInputChange} variant="outlined" />
          </div>
        </div>
        <CustomButton loading={status === 'loading'} onClick={() => onConfirmReset()} title="Confirm Reset" />
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
                pressEnter={() => !isReset ? onLogin() : onReset()}
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

        <CustomButton loading={status === 'loading'} onClick={() => !isReset ? onLogin() : onReset() } title={ !isReset ? 'Login' : 'Reset Password' } />

        <div className="d-flex justify-content-center">
          <div className="p-2 cursor-pointer">
            <p className="text-link" onClick={() => setIsReset((prevState) => !prevState)}>
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
