import React, { FC } from "react";
import { Assets } from "@taskpaneutilities/Assets";

interface IAuthWrapper{
  message: string;
  children : any;
  onClick: () => void;
}

export const AuthWrapper:FC<IAuthWrapper> = ({ message, children, onClick }) => {
 return (
      <div className="auth-form-container d-flex flex-column justify-content-center">
        <div className="d-flex justify-content-center">
          <img width="80" height="80" src={Assets.logoFilled} alt={'Brand logo'} />
        </div>
        <h4 className="text-center" onClick={onClick}>
          { message }
        </h4>
        <hr />
        <form noValidate autoComplete="off">
          { children }
        </form>
      </div>
  );
};