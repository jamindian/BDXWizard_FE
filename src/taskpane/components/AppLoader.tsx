import React from "react";
import { Assets } from "../utilities/Assets";

export default function AppLoader() {
  return (
    <div className="loader app-preloader">
      <img alt="wizardlogo" src={Assets.logoFilled} width={90} height={90} />
    </div>
  );
}
