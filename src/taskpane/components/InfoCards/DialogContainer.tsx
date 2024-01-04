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
import { getMappedWLowConfidenceColumns, getUnMappedProfileColumnsColors, goToColumnRow4 } from "@taskpaneutilities/Helpers";

interface IDialogContainer {
  activeModal: string;
  toggleModal: (name: string) => void;
  data: { unMappedRawColumns: string[]; unMappedProfileColumns: string[]; policies: number; GWP: number; GEP: number; };
  userProfile: IUserProfile;
  rawSheetColumnCount: number;
}

const DialogContainer: React.FC<IDialogContainer> = (props) => {

  const [unMappedProfileColumns, setUnMappedProfileColumns] = React.useState<{ color: string; column: string; }[]>([]);
  const [mappedWLowConfidence, setMappedWLowConfidence] = React.useState<{ lowConfidence: boolean; column: string; }[]>([]);

  React.useEffect(() => {   
    if (props.activeModal) {
      run();
    }
  }, [props.data.unMappedProfileColumns, props.activeModal]);

  async function run(): Promise<void> {
    const ml = await getMappedWLowConfidenceColumns(global.selectedSheet);
    const r = await getUnMappedProfileColumnsColors(props.data.unMappedProfileColumns, global.selectedSheet);
    setUnMappedProfileColumns(r);
    setMappedWLowConfidence(ml);
  }

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
          <DialogTitle>Unmapped Columns for <b>{props.userProfile.profile_name}</b> Profile ({props.data.unMappedProfileColumns.length} of {props.userProfile.poc_columns.length})</DialogTitle>
          <DialogContent style={{ overflowY: "visible" }}>
            {unMappedProfileColumns.length === 0 && <span>No columns found.</span>}
            <List>
              {unMappedProfileColumns.map((item, index: number) => (
                <ListItem key={index} style={{ cursor: "pointer" }} onClick={() => goToColumnRow4(item.column, global.selectedSheet)}>
                  <ListItemText className="btn-hover" style={{ color: item.color }} primary={item.column}></ListItemText>
                </ListItem>
              ))}
            </List>
          </DialogContent>

          <DialogTitle>Mapped with low confidence ({mappedWLowConfidence.filter(f => f.lowConfidence).length} of {mappedWLowConfidence.length})</DialogTitle>
          <DialogContent style={{ overflowY: "visible" }}>
            {mappedWLowConfidence.length === 0 && <span>No columns found.</span>}
            <List>
              {mappedWLowConfidence.filter(f => f.lowConfidence).map((item, index: number) => (
                <ListItem key={index} style={{ cursor: "pointer" }} onClick={() => goToColumnRow4(item.column, global.selectedSheet)}>
                  <ListItemText className="btn-hover" primary={item.column}></ListItemText>
                </ListItem>
              ))}
            </List>
          </DialogContent>

          <DialogTitle>Unmapped Source Data Columns ({props.data.unMappedRawColumns.length} of {props.rawSheetColumnCount})</DialogTitle>
          <DialogContent style={{ overflowY: "visible" }}>
            {props.data.unMappedRawColumns.length === 0 && <span>No columns found.</span>}
            <List>
              {props.data.unMappedRawColumns.map((item, index: number) => (
                <ListItem key={index}>                  
                  <ListItemText primary={item}></ListItemText>
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
