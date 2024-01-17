import React from "react";

import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  List,
  ListItem,
  ListItemText, Accordion, AccordionSummary, AccordionDetails,
} from "@mui/material";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { ModalTypesEnumerator } from "@taskpaneutilities/Enum";
import { IUserProfile } from "@taskpaneutilities/Interface";
import { goToColumnRow4 } from "@taskpaneutilities/Helpers";

interface IDialogContainer {
  activeModal: string;
  toggleModal: (name: string) => void;
  userProfile: IUserProfile;
  rawSheetColumnCount: number;
  unMappedProfileColumns: { color: string; column: string; }[];
  mappedWLowConfidence: { lowConfidence: boolean; column: string; }[];
  unMappedRawColumns: string[];
}

const DialogContainer: React.FC<IDialogContainer> = (props) => {

  const toggleModal = (): void => {
    props.toggleModal("");
  };

  if (props.activeModal) {
    const { mappedWLowConfidence, unMappedProfileColumns, unMappedRawColumns } = props;
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
          onClose={toggleModal} fullWidth={true} maxWidth={"md"}
        >
          <Accordion>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="unmappedc-content"
              id="unmappedc-header" sx={{ width: '100%' }}
            >
              <DialogTitle sx={{ padding: 0 }}>Unmapped Destination Columns for <b>{props.userProfile?.profile_name}</b> Profile ({unMappedProfileColumns.length} of {props.userProfile?.poc_columns?.length})</DialogTitle>
            </AccordionSummary>
            <AccordionDetails sx={{ padding: 0, margin: 0 }}>
              <DialogContent style={{ overflowY: "visible" }}>
                {unMappedProfileColumns.length === 0 && <span>No columns found.</span>}
                <List>
                  {unMappedProfileColumns.map((item, index: number) => (
                    <ListItem key={index} style={{ cursor: "pointer" }} onClick={() => goToColumnRow4(item.column)}>
                      <ListItemText className="btn-hover" style={{ color: item.color }} primary={item.column}></ListItemText>
                    </ListItem>
                  ))}
                </List>
              </DialogContent>
            </AccordionDetails>
          </Accordion>

          <Accordion>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="lowconfidence-content"
              id="lowconfidence-header" sx={{ width: '100%' }}
            >
              <DialogTitle sx={{ padding: 0 }}>Mapped with low confidence ({mappedWLowConfidence.filter(f => f.lowConfidence).length} of {mappedWLowConfidence.length})</DialogTitle>
            </AccordionSummary>
            <AccordionDetails sx={{ padding: 0, margin: 0 }}>
              <DialogContent style={{ overflowY: "visible" }}>
                {mappedWLowConfidence.length === 0 && <span>No columns found.</span>}
                <List>
                  {mappedWLowConfidence.filter(f => f.lowConfidence).map((item, index: number) => (
                    <ListItem key={index} style={{ cursor: "pointer" }} onClick={() => goToColumnRow4(item.column)}>
                      <ListItemText className="btn-hover" primary={item.column}></ListItemText>
                    </ListItem>
                  ))}
                </List>
              </DialogContent>
            </AccordionDetails>
          </Accordion>

          <Accordion>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="unmappeds-content"
              id="unmappeds-header" sx={{ width: '100%' }}
            >
              <DialogTitle sx={{ padding: 0 }}>Unmapped Source Data Columns ({unMappedRawColumns.length} of {props.rawSheetColumnCount})</DialogTitle>
            </AccordionSummary>
            <AccordionDetails sx={{ padding: 0, margin: 0 }}>
              <DialogContent style={{ overflowY: "visible" }}>
                {unMappedRawColumns.length === 0 && <span>No columns found.</span>}
                <List>
                  {unMappedRawColumns.map((item, index: number) => (
                    <ListItem key={index}>                  
                      <ListItemText primary={item}></ListItemText>
                    </ListItem>
                  ))}
                </List>
              </DialogContent>
            </AccordionDetails>
          </Accordion>

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
