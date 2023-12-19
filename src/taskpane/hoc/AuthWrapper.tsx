import React, { FC } from "react";
import { Assets } from "@taskpaneutilities/Assets";

interface IAuthWrapper{
  message: string;
  button: string;
  children : any;
  onClick: () => void;
}

export const AuthWrapper:FC<IAuthWrapper> = ({ message, children, onClick, button }) => {
 return (
      <div className="auth-form-container d-flex flex-column justify-content-center">
        <div className="d-flex justify-content-center">
          <img width="80" height="80" src={Assets.logoFilled} alt={'Brand logo'} />
        </div>
        <div className="d-flex justify-content-center align-items-center">
          <h3>
            { message }
          </h3>
          <h3 className="btn-hover cursor-pointer" onClick={onClick}> {button} </h3>
        </div>
        <hr />
        <form noValidate autoComplete="off">
          { children }
        </form>
      </div>
  );
};