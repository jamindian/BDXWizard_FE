import * as React from "react";

import { Image } from "@fluentui/react-components";
import CloseIcon from "@mui/icons-material/Close";
import IconButton from "@mui/material/IconButton";
import { TransitionProps } from "@mui/material/transitions";
import {
  AppBar,
  Dialog,
  Slide,
  Toolbar, Button,
  Typography
} from "@mui/material";
import { toast } from "react-toastify";
import { useDispatch } from "react-redux";
import { setIsLoggedOut } from "../redux/Actions/Auth";
import { APP_TITLE } from "@taskpaneutilities/Constants";
import NetworkCalls from "@taskpane/services/ApiNetworkCalls";

export interface HeaderProps {
  title: string;
  logo: string;
}

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement;
  },
  ref: React.Ref<unknown>
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const Header: React.FC<HeaderProps> = (props: HeaderProps) => {

  const dispatch = useDispatch();
  const { title, logo } = props;

  const [open, setOpen] = React.useState<boolean>(false);
  const [open1, setOpen1] = React.useState<boolean>(false);
  const [currentUser, setCurrentUser] = React.useState<{ email: string; username: string; company: string; }>({
    company: "", username: "", email: ""
  });

  React.useEffect(() => {
    async function run(): Promise<void> {
      const u = await NetworkCalls.getCurrentActiveUser();
      setCurrentUser({ company: u.data?.company_name, email: u.data?.email, username: u.data?.username });
    }

    if (open){
      run();
    }
  }, [open]);

  const handleClickOpen = (): void => {
    setOpen(true);
  };

  const handleClose = (): void => {
    setOpen(false);
  };

  //call the redux action for logout
  async function signOut(): Promise<void> {
    localStorage.clear();
    dispatch(setIsLoggedOut());
    toast.success("User logged out successfully.");
  };

  return (
    <div>
      <section className="addin-header d-flex-row-center">
        <Image width="90" height="90" src={logo} alt={title} onClick={handleClickOpen} />
      </section>
      <Dialog
        fullScreen
        open={open}
        onClose={handleClose}
        TransitionComponent={Transition}
      >
        
        <AppBar position="fixed">
          <Toolbar>
            <IconButton
              edge="start"
              color="inherit"
              onClick={handleClose}
              aria-label="close"
            >
              <CloseIcon />
            </IconButton>
            <Typography sx={{ ml: 2, flex: 1 }} variant="h6" component="div">
              Close
            </Typography>
          </Toolbar>
        </AppBar>

        <div
          className={`box-shadow-white auth-logout ${
            open1 ? "mt-70px m-auto" : "m-auto"
          } border-bottom-0 bg-light`}
        >
          <div style={{ width: 400 }} className="p-3 rounded-3">
            <div className="d-flex align-items-center justify-content-center mb-2">
              <img
                width="60px"
                height="60px"
                src={logo} alt={APP_TITLE}
              />
            </div>
            <div>
              <p>
                <strong className="cc-width65px">Name : </strong>{" "}
                {currentUser?.username}
              </p>
              <p>
                <strong className="cc-width65px">Email : </strong>{" "}
                {currentUser?.email}
              </p>
              <p>
                <strong className="cc-width65px">Company : </strong>{" "}
                {currentUser?.company}
              </p>
            </div>
            <div className="d-flex align-items-center justify-content-center">
              <Button
                variant="outlined"
                onClick={() => signOut()}
                style={{ margin: "5px" }}
              >
                {" "}
                Logout
              </Button>
            </div>
          </div>

        </div>

      </Dialog>
    </div>
  );
};

export default Header;
