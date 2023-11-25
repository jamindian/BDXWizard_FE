import React, { useState, FC } from "react";

import MergeIcon from "@mui/icons-material/Merge";
import PaletteOutlinedIcon from "@mui/icons-material/PaletteOutlined";
import HealingIcon from "@mui/icons-material/Healing";
import AutoGraphIcon from "@mui/icons-material/AutoGraph";
import { onCleanSOV, onTrainAI } from "@taskpaneutilities/Office-helper";
import { tryCatch } from "@taskpaneutilities/Helpers";
import CommonMethods from "@taskpaneutilities/CommonMethods";
import { useDispatch } from "react-redux";
import { setStopwatch } from "@redux/Actions/Auth";
import TextField from '@mui/material/TextField';

const DashboardButtons: FC<{}> = () => {
  const dispatch = useDispatch();
  const [batches, setBatches] = React.useState<number>(0);

  const [activeBtn, setActiveBtn] = useState<
    | "clean_claim_bdx"
    | "append_claim_bdx"
    | "merge_claim_bdx"
    | "clean_premium_bdx"
    | "append_premium_bdx"
    | "merge_premium_bdx"
    | "train_AI"
  >("clean_claim_bdx");

  const onSetActiveBtn = (
    active:
      | "clean_claim_bdx"
      | "append_claim_bdx"
      | "merge_claim_bdx"
      | "clean_premium_bdx"
      | "append_premium_bdx"
      | "merge_premium_bdx"
      | "train_AI"
  ): void => {
    setActiveBtn(active);
  };

  async function onCleanCurrentActiveSheet(isClaim: boolean): Promise<void> {
    dispatch(setStopwatch("reset"));
    const sheetName: string = await CommonMethods.getActiveWorksheetName();
    global.selectedSheet = sheetName;
    tryCatch(onCleanSOV(isClaim, sheetName, batches > 0 ? batches : 5));
  }

  async function trainAIOnCurrentSheet(): Promise<void> {
    tryCatch(onTrainAI(global.selectedSheet));
  }

  const buttons = [
    {
      id: 1,
      condition: true,
      disabled: false,
      label: "Clean Claim BDX",
      icon: <PaletteOutlinedIcon />,
      hover: "clean_claim_bdx",
      onClick: () => onCleanCurrentActiveSheet(true),
    },
    {
      id: 2,
      condition: false,
      disabled: false,
      label: "Append Claim BDX",
      icon: <HealingIcon />,
      hover: "append_claim_bdx",
      onClick: () => console.log(),
    },
    {
      id: 3,
      condition: false,
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
      onClick: () => onCleanCurrentActiveSheet(false),
    },
    {
      id: 5,
      condition: false,
      disabled: false,
      label: "Append Premium BDX",
      icon: <HealingIcon />,
      hover: "append_premium_bdx",
      onClick: () => console.log(),
    },
    {
      id: 6,
      condition: false,
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
      onClick: () => trainAIOnCurrentSheet(),
    },
  ];

  return (
    <>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", flexWrap: "wrap", padding: 20 }}>
        {buttons
          .filter((btn) => btn.condition)
          .map(({ disabled, hover, icon, id, label, onClick }) => (
            <button
              className={`custom-btn active ${hover}`}
              onClick={() => onClick()} key={id}
              onMouseOver={() => onSetActiveBtn(activeBtn === hover ? "" : (hover as any))}
              disabled={disabled}
            >
              <span className="btn-icon">{icon}</span>
              <span className="btn-text">{label}</span>
            </button>
          ))}        
      </div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
        <TextField
          id="batch-size" label="Number of Batches" size="small"
          value={batches} type="number" style={{ margin: '0px auto' }}
          onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
            setBatches(parseInt(event.target.value));
          }}
        />
      </div>
    </>
  );
};

export default DashboardButtons;
