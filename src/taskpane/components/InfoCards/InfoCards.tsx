import React, { useState } from "react";
import { useSelector } from "react-redux";

import { Card, CardContent, Typography } from "@mui/material";
import { ModalTypesEnumerator } from "@taskpaneutilities/Enum";
import DialogContainer from "./DialogContainer";
import { isSheetPoliciesSelector, isUnMappedColumnsSelector } from "@redux/Actions/Process";

interface IInfoCards {}

const InfoCards: React.FC<IInfoCards> = () => {
  const [activeModal, setActiveModal] = useState<string>("");

  const totalPolicies: number = useSelector(isSheetPoliciesSelector);
  const unMappedColumns: string[] = useSelector(isUnMappedColumnsSelector);

  const toggleModal = (name: string): void => {
    setActiveModal(name);
  };

  return React.useMemo(() => {
    return (
      <div className="d-flex-row-center" style={{ flexWrap: 'wrap' }}>
        <div>
          <Card
            className="card-root"
            onClick={() => toggleModal(ModalTypesEnumerator.POLICIES)}
          >
            <CardContent className="d-flex-column-center">
              <Typography className="card-pos" color="textSecondary" component='div'>
                {totalPolicies ? totalPolicies : 0}
              </Typography>
              <Typography
                className="card-root-title"
                color="textSecondary"
                gutterBottom
                component='div'
              >
                Policies
              </Typography>
            </CardContent>
          </Card>
        </div>
        <div>
          <Card
            className="card-root"
            onClick={() => toggleModal(ModalTypesEnumerator.GROSS_WRITTEN_PREMIUM)}
          >
            <CardContent className="d-flex-column-center">
              <Typography className="card-pos" color="textSecondary" component='div'>
                {unMappedColumns.length}
              </Typography>
              <Typography
                className="card-root-title"
                color="textSecondary"
                gutterBottom
                component='div'
              >
                Gross Written Premium
              </Typography>
            </CardContent>
          </Card>
        </div>
        <div>
          <Card
            className="card-root"
            onClick={() => toggleModal(ModalTypesEnumerator.GROSS_EARNED_PREMIUM)}
          >
            <CardContent className="d-flex-column-center">
              <Typography className="card-pos" color="textSecondary" component='div'>
                {unMappedColumns.length}
              </Typography>
              <Typography
                className="card-root-title"
                color="textSecondary"
                gutterBottom
                component='div'
              >
                Gross Earned Premium
              </Typography>
            </CardContent>
          </Card>
        </div>        
        <div>
          <Card
            className="card-root"
            onClick={() => toggleModal(ModalTypesEnumerator.UNMAPPED_COLUMNS)}
          >
            <CardContent className="d-flex-column-center">
              <Typography className="card-pos" color="textSecondary" component='div'>
                {unMappedColumns.length}
              </Typography>
              <Typography
                className="card-root-title"
                color="textSecondary"
                gutterBottom
                component='div'
              >
                Unmapped
              </Typography>
            </CardContent>
          </Card>
        </div>

        <DialogContainer
          activeModal={activeModal}
          toggleModal={toggleModal}
          totalPolicies={totalPolicies}
          unMappedColumns={unMappedColumns}
        />
      </div>
    );
  }, [
    activeModal,
    totalPolicies,
    unMappedColumns,
  ]);
};

export default InfoCards;
