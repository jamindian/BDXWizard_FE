import React from "react";

import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";
import { ModalTypesEnumerator } from "@taskpaneutilities/Enum";
import { IUserProfile } from "@taskpaneutilities/Interface";

interface IDialogContainer {
  activeModal: string;
  toggleModal: (name: string) => void;
  data: { unMappedRawColumns: string[]; unMappedProfileColumns: string[]; policies: number; GWP: number; GEP: number; };
  userProfile: IUserProfile;
}

const DialogContainer: React.FC<IDialogContainer> = (props) => {

  const toggleModal = (): void => {
    props.toggleModal("");
  };

  if (props.activeModal) {
    return (
      <>
        <Dialog
          open={props.activeModal === ModalTypesEnumerator.POLICIES}
          onClose={toggleModal}
          fullWidth={true}
          maxWidth={"xs"}
        >
        </Dialog>
        
        {/* unmappedColumns */}
        <Dialog
          open={props.activeModal === ModalTypesEnumerator.UNMAPPED_COLUMNS}
          onClose={toggleModal} fullWidth={true} maxWidth={"sm"}
        >
          <DialogTitle>Unmapped Columns for <b>{props.userProfile.profile_name}</b> Profile</DialogTitle>
          <DialogContent style={{ overflowY: "visible" }}>
            {props.data.unMappedProfileColumns.length === 0 && <span>No columns found.</span>}
            <List>
              {props.data.unMappedProfileColumns.map((item, index) => (
                <ListItem key={index}>
                  {" "}
                  <ListItemText primary={item}></ListItemText>{" "}
                </ListItem>
              ))}
            </List>
          </DialogContent>

          <DialogTitle>Unmapped Source Data Columns</DialogTitle>
          <DialogContent style={{ overflowY: "visible" }}>
            {props.data.unMappedRawColumns.length === 0 && <span>No columns found.</span>}
            <List>
              {props.data.unMappedRawColumns.map((item, index) => (
                <ListItem key={index}>
                  {" "}
                  <ListItemText primary={item}></ListItemText>{" "}
                </ListItem>
              ))}
            </List>
          </DialogContent>
          <DialogActions>
            <Button onClick={toggleModal} color="primary">
              Close
            </Button>
          </DialogActions>
        </Dialog>
      </>
    );
  }

  return null;
};

export default DialogContainer;
