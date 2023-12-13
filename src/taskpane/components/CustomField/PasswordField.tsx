import * as React from "react";

import IconButton from "@mui/material/IconButton";
import OutlinedInput from "@mui/material/OutlinedInput";
import InputLabel from "@mui/material/InputLabel";
import InputAdornment from "@mui/material/InputAdornment";
import FormControl from "@mui/material/FormControl";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";

interface IPasswordField {
  value: string;
  onChange: (e) => void;
  pressEnter: () => void;
  error?: boolean;
  isRequired?: boolean;
  name?: string;
}

export const PasswordField: React.FC<IPasswordField> = ({
  value,
  onChange,
  pressEnter,
  error,
  isRequired,
  name
}) => {
  const [showPassword, setShowPassword] = React.useState(false);

  const handleClickShowPassword = () => setShowPassword((show) => !show);

  const handleMouseDownPassword = (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    event.preventDefault();
  };

  return (
    <FormControl
      sx={{ width: "100%" }}
      variant="outlined"
      className="password-field"
    >
      <InputLabel htmlFor="outlined-adornment-password">Password {isRequired ? '*' : ''}</InputLabel>
      <OutlinedInput
        id="outlined-adornment-password"
        type={showPassword ? "text" : "password"}
        value={value}
        onChange={(e) => onChange(e)}
        onKeyPress={(e) => e.key === "Enter" && pressEnter()}
        error={error}
        label={`Password ${isRequired ? ' *' : ''}`}
        name={name ? name : "password"}
        autoComplete="on"
        required
        endAdornment={
          <InputAdornment position="end">
            <IconButton
              aria-label="toggle password visibility"
              onClick={handleClickShowPassword}
              onMouseDown={handleMouseDownPassword}
              edge="end"
            >
              {!showPassword ? <VisibilityOff /> : <Visibility />}
            </IconButton>
          </InputAdornment>
        }
      />
    </FormControl>
  );
};
