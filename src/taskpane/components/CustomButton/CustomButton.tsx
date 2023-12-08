import * as React from "react";
import { Button, CircularProgress } from "@mui/material";

interface ICustomButton {
  onClick: () => void;
  title: string;
  loading: boolean;
  className?: string;
}

const CustomButton: React.FC<ICustomButton> = ({
  onClick,
  title,
  loading,
  className,
}) => {
  return (
    <div className={`d-flex justify-content-center pt-2 ${className}`}>
      <div className="p-2">
        <Button
          onClick={onClick}
          variant="contained"
          color="primary"
          disabled={loading}
        >
          {loading ? (
            <CircularProgress
              style={{ color: "#fff" }}
              size={16}
            />
          ) : (
            title
          )}
        </Button>
      </div>
    </div>
  );
};

export const MainButton: React.FC<{
  activeBtn: string | any; onSetActiveBtn: (f: string) => void; onClick: () => void; btnHover: string;
  icon: any; disabled: boolean; btnTitle: string;
}> = ({ activeBtn, onSetActiveBtn, onClick, btnHover, icon, disabled, btnTitle }) => {
  return (
    <button
      className={`custom-btn ${btnHover} ${
        activeBtn === btnHover ? "active" : ""
      }`}
      onClick={() => onClick()}
      onMouseOver={() => onSetActiveBtn(btnHover)}
      disabled={disabled}
    >
      <span className="btn-icon">
        { icon }
      </span>
      <span className="btn-text">{btnTitle}</span>
    </button>
  )
}

export default CustomButton;
