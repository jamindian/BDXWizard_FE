import React, { useState } from "react";
import { useSelector } from "react-redux";

import { Card, CardContent, Typography } from "@mui/material";
import { ExcelLoadEnumerator, ModalTypesEnumerator } from "@taskpaneutilities/Enum";
import DialogContainer from "./DialogContainer";
import { isSheetChangedSelector, isUnMappedColumnsSelector } from "@redux/Actions/Process";
import CommonMethods from "@taskpaneutilities/CommonMethods";

interface IInfoCards {
  tabValue: number;
}

const InfoCards: React.FC<IInfoCards> = ({ tabValue }) => {
  const [activeModal, setActiveModal] = useState<string>("");
  const [data, setData] = React.useState<{ policies: number; GWP: number; GEP: number; }>({ policies: 0, GEP: 0, GWP: 0 });

  const sheetChanged: number = useSelector(isSheetChangedSelector);
  const unMappedColumns: string[] = useSelector(isUnMappedColumnsSelector);

  React.useEffect(() => {
    if (sheetChanged !== 0) {
      getExcelColumnsResults();
    }
  }, [sheetChanged]);

  React.useEffect(() => {
    setData({ policies: 0, GEP: 0, GWP: 0 });
  }, [tabValue]);

  async function getExcelColumnsResults(): Promise<void> {
    const { activeWorksheetStagingArea, activeWorksheetStagingAreaTableName } = CommonMethods.getActiveWorkSheetAndTableName(global.selectedSheet);
    const results = await Excel.run(async (context: Excel.RequestContext) => {
      // get staging area sheet and sync the context
      const sheets: Excel.WorksheetCollection = context.workbook.worksheets;
      const stagingSheet: Excel.Worksheet = sheets.getItem(activeWorksheetStagingArea);
      await context.sync();

      const stagingTable: Excel.Table = stagingSheet.tables.getItem(activeWorksheetStagingAreaTableName);
      await context.sync();

      const id: Excel.Range = stagingTable.columns.getItem("ID").getDataBodyRange().load(ExcelLoadEnumerator.values);
      let gwp: Excel.Range, gep: Excel.Range;

      if (tabValue === 0) {
        gwp = stagingTable.columns.getItem("Premium").getDataBodyRange().load(ExcelLoadEnumerator.values);
        gep = stagingTable.columns.getItem("Total Gross Premium including Terrorism").getDataBodyRange().load(ExcelLoadEnumerator.values);
      }

      if (tabValue === 1) {
        gwp = stagingTable.columns.getItem("Total Recovery Reserves").getDataBodyRange().load(ExcelLoadEnumerator.values);
        gep = stagingTable.columns.getItem("Total Reserves Indemnity").getDataBodyRange().load(ExcelLoadEnumerator.values);
      }

      if (tabValue === 2) {
        gwp = stagingTable.columns.getItem("Gross Written Premium").getDataBodyRange().load(ExcelLoadEnumerator.values);
        gep = stagingTable.columns.getItem("Gross Earned Premium").getDataBodyRange().load(ExcelLoadEnumerator.values);
      }

      await context.sync();

      return { policies: id.values.flat(1).length, GWP: CommonMethods.arrayValuesSum(gwp.values.flat(1)), GEP: CommonMethods.arrayValuesSum(gep.values.flat(1)) };
    });

    setData(results);
  }

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
                { data.policies > 1000 ? CommonMethods.numberFormatter(data.policies) : data.policies }
              </Typography>
              <Typography
                className="card-root-title"
                color="textSecondary"
                gutterBottom
                component='div'
              >
                Records
              </Typography>
            </CardContent>
          </Card>
        </div>
        <div>
          <Card
            className="card-root"
            onClick={() => toggleModal(ModalTypesEnumerator.GROSS_WRITTEN_PREMIUM)}
            title={`${data.GWP ? data.GWP + "$" : "0"}`}
          >
            <CardContent className="d-flex-column-center">
              <Typography className="card-pos" color="textSecondary" component='div'>
                { CommonMethods.numberFormatter(data.GWP) }
              </Typography>
              <Typography
                className="card-root-title"
                color="textSecondary"
                gutterBottom
                component='div'
              >
                { tabValue === 0 ? 'Premium' : tabValue === 1 ? 'Total Recovery Reserves' : 'Gross Written Premium' }
              </Typography>
            </CardContent>
          </Card>
        </div>
        <div>
          <Card
            className="card-root"
            onClick={() => toggleModal(ModalTypesEnumerator.GROSS_EARNED_PREMIUM)}
            title={`${data.GEP ? data.GEP + "$" : "0"}`}
          >
            <CardContent className="d-flex-column-center">
              <Typography className="card-pos" color="textSecondary" component='div'>
                { CommonMethods.numberFormatter(data.GEP) }
              </Typography>
              <Typography
                className="card-root-title"
                color="textSecondary"
                gutterBottom
                component='div'
              >
                { tabValue === 0 ? 'Total Gross Premium' : tabValue === 1 ? 'Total Reserves Indemnity' : 'Gross Earned Premium' }
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
          data={{ ...data, unMappedColumns }}
        />
      </div>
    );
  }, [
    activeModal,
    data,
    tabValue,
    unMappedColumns,
  ]);
};

export default InfoCards;
