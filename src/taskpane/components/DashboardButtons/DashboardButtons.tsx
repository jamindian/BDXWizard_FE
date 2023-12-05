import React, { FC } from "react";

import MergeIcon from "@mui/icons-material/Merge";
import PaletteOutlinedIcon from "@mui/icons-material/PaletteOutlined";
import HealingIcon from "@mui/icons-material/Healing";
import AutoGraphIcon from "@mui/icons-material/AutoGraph";
import { mergeStagingAreas, onCleanBordereaux, onTrainAI } from "@taskpaneutilities/Office-helper";
import { tryCatch } from "@taskpaneutilities/Helpers";
import CommonMethods from "@taskpaneutilities/CommonMethods";
import { useDispatch } from "react-redux";
import { setStopwatch } from "@redux/Actions/Auth";
import TextField from '@mui/material/TextField';

interface IProps {
  buttonName: string;
}

const DashboardButtons: FC<IProps> = ({ buttonName }) => {
  const dispatch = useDispatch();
  const [batches, setBatches] = React.useState<number>(1);

  async function onCleanCurrentActiveSheet(buttonName: string): Promise<void> {
    dispatch(setStopwatch("reset"));
    const sheetName: string = await CommonMethods.getActiveWorksheetName();
    global.selectedSheet = sheetName;
    tryCatch(onCleanBordereaux(buttonName, sheetName, batches > 0 ? batches : 5));
  }

  async function trainAIOnCurrentSheet(template_type: string): Promise<void> {
    const activeSheetName: string = await CommonMethods.getActiveWorksheetName();
    tryCatch(onTrainAI(activeSheetName.split(" Staging Area")[0], template_type));
  }

  const buttons = [
    {
      id: 1,
      condition: true,
      disabled: false,
      label: "Clean BDX",
      icon: <PaletteOutlinedIcon />,
      hover: `clean_${buttonName}_bdx`,
      onClick: () => onCleanCurrentActiveSheet(buttonName),
    },
    {
      id: 2,
      condition: false,
      disabled: false,
      label: "Append BDX",
      icon: <HealingIcon />,
      hover: `append_${buttonName}_bdx`,
      onClick: () => console.log(),
    },
    {
      id: 3,
      condition: buttonName === "POC",
      disabled: false,
      label: "Merge BDX",
      icon: <MergeIcon />,
      hover: `merge_${buttonName}_bdx`,
      onClick: () => mergeStagingAreas(),
    },    
    {
      id: 7,
      condition: true,
      disabled: false,
      label: "Train AI",
      icon: <AutoGraphIcon />,
      hover: "train_AI",
      onClick: () => trainAIOnCurrentSheet(buttonName === "Claim" ? buttonName+"s" : buttonName),
    },
  ];

  return (
    <>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-start", flexWrap: "wrap", padding: 20 }}>
        {buttons
          .filter((btn) => btn.condition)
          .map(({ disabled, hover, icon, id, label, onClick }) => (
            <button
              className={`custom-btn active ${hover}`}
              onClick={() => onClick()} key={id}
              onMouseOver={() => console.log()}
              disabled={disabled}
            >
              <span className="btn-icon">{icon}</span>
              <span className="btn-text">{label}</span>
            </button>
          ))}
      </div>
      { buttonName !== "POC" && (      
        <div className="d-flex-row-center">
          <TextField
            id="batch-size" label="Number of Batches" size="small"
            value={batches} type="number" style={{ margin: '0px auto' }}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
              setBatches(parseInt(event.target.value) > 0 ? parseInt(event.target.value) : 1);
            }}
          />
        </div>
      )}
    </>
  );
};

export default DashboardButtons;
