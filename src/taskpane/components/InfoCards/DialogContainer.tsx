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

interface IDialogContainer {
  activeModal: string;
  toggleModal: (name: string) => void;
  unMappedColumns: string[];
  totalPolicies: number;
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
          onClose={toggleModal}
          fullWidth={true}
          maxWidth={"sm"}
        >
          <DialogTitle>Unmapped Columns</DialogTitle>
          <DialogContent>
            {props.unMappedColumns.length === 0 && <span>No columns found.</span>}
            <List>
              {props.unMappedColumns.map((item, index) => (
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
