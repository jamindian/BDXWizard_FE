import React, { useState, FC } from "react";

import MergeIcon from "@mui/icons-material/Merge";
import PaletteOutlinedIcon from "@mui/icons-material/PaletteOutlined";
import HealingIcon from "@mui/icons-material/Healing";
import AutoGraphIcon from "@mui/icons-material/AutoGraph";
import AuthContext from "@context/AuthContext";
import { onCleanSOV } from "@taskpaneutilities/Office-helper";
import { tryCatch } from "@taskpaneutilities/Helpers";

const DashboardButtons: FC<{}> = () => {
  const { setLoader } = React.useContext(AuthContext);

  const [activeBtn, setActiveBtn] = useState<
    | "clean_claim_bdx"
    | "append_claim_bdx"
    | "merge_claim_bdx"
    | "clean_premium_bdx"
    | "append_premium_bdx"
    | "merge_premium_bdx"
  >("clean_claim_bdx");

  const onSetActiveBtn = (
    active:
      | "clean_claim_bdx"
      | "append_claim_bdx"
      | "merge_claim_bdx"
      | "clean_premium_bdx"
      | "append_premium_bdx"
      | "merge_premium_bdx"
  ): void => {
    setActiveBtn(active);
  };

  const buttons = [
    {
      id: 1,
      condition: true,
      disabled: false,
      label: "Clean Claim BDX",
      icon: <PaletteOutlinedIcon />,
      hover: "clean_claim_bdx",
      onClick: () => tryCatch(onCleanSOV(setLoader), setLoader),
    },
    {
      id: 2,
      condition: true,
      disabled: false,
      label: "Append Claim BDX",
      icon: <HealingIcon />,
      hover: "append_claim_bdx",
      onClick: () => console.log(),
    },
    {
      id: 3,
      condition: true,
      disabled: false,
      label: "Merge Claim BDX",
      icon: <MergeIcon />,
      hover: "merge_claim_bdx",
      onClick: () => console.log(),
    },
    {
      id: 4,
      condition: true,
      disabled: false,
      label: "Clean Premium BDX",
      icon: <PaletteOutlinedIcon />,
      hover: "clean_premium_bdx",
      onClick: () => tryCatch(onCleanSOV(setLoader), setLoader),
    },
    {
      id: 5,
      condition: true,
      disabled: false,
      label: "Append Premium BDX",
      icon: <HealingIcon />,
      hover: "append_premium_bdx",
      onClick: () => console.log(),
    },
    {
      id: 6,
      condition: true,
      disabled: false,
      label: "Merge Premium BDX",
      icon: <MergeIcon />,
      hover: "merge_premium_bdx",
      onClick: () => console.log(),
    },
    {
      id: 7,
      condition: true,
      disabled: false,
      label: "Train AI",
      icon: <AutoGraphIcon />,
      hover: "train_AI",
      onClick: () => console.log(),
    },
  ];

  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", flexWrap: "wrap", padding: 20 }}>
      {buttons
        .filter((btn) => btn.condition)
        .map(({ disabled, hover, icon, id, label, onClick }) => (
          <button
            className={`custom-btn ${hover} ${activeBtn === hover ? "active" : ""}`}
            onClick={() => onClick()}
            key={id}
            onMouseOver={() => onSetActiveBtn(activeBtn === hover ? "" : (hover as any))}
            disabled={disabled}
          >
            <span className="btn-icon">{icon}</span>
            <span className="btn-text">{label}</span>
          </button>
        ))}
    </div>
  );
};

export default DashboardButtons;
