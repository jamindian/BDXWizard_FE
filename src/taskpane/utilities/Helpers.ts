import { toast } from "react-toastify";
import { AppColors, Strings } from "@taskpaneutilities/Constants";
import { AlphabetsEnumerator, ExcelLoadEnumerator } from "@taskpaneutilities/Enum";
import CommonMethods from "@taskpaneutilities/CommonMethods";
import { differenceWith, isEqual } from "lodash";
import { IStagingAreaColumn, IUserProfile } from "@taskpaneutilities/Interface";
import NetworkCalls from "@taskpane/services/ApiNetworkCalls";
import { store } from "@redux/Store";
import { setUnMappedColumns } from "@redux/Actions/Process";

/** Default helper for invoking an action and handling errors. */
export async function tryCatch(callback) {
  try {
    await callback;
  } catch (error) {
    // Note: In a production add-in, you'd want to notify the user through your add-in's UI.
    console.error(error);
  }
}

export async function formulaPasteUnPasteWhileChangeMappings(
  event: Excel.WorksheetChangedEventArgs,
  sheetName: string
): Promise<void> {
  await Excel.run(async (context: Excel.RequestContext) => {
    const { activeWorksheetStagingArea, activeWorksheetStagingAreaTableName, activeTempWorksheetTableName } = CommonMethods.getActiveWorkSheetAndTableName(sheetName);
    const sheet: Excel.Worksheet = context.workbook.worksheets.getItem(activeWorksheetStagingArea);
    const table: Excel.Table = sheet.tables.getItem(activeWorksheetStagingAreaTableName).load(ExcelLoadEnumerator.rows);
    await context.sync();

    const totalTableRows: number = table.rows.count;

    const countArray: number[] = [];
    for (let i = 1; i <= totalTableRows; i++) {
      countArray.push(i);
    }

    const sliceAddress: string = event.address;
    const actual: string[] = sliceAddress.match(/[a-zA-Z]+|[0-9]+/g);

    if (parseInt(actual[1]) === 4 && event.details) {
      if (!event.details.valueAfter) {
        const row11: Excel.Range = sheet.getRange(`${actual[0]}11`).load(ExcelLoadEnumerator.values);
        const row13: Excel.Range = sheet.getRange(`${actual[0]}13`).load(ExcelLoadEnumerator.values);
        await context.sync();

        sheet.getRange(`${actual[0]}5:${actual[0]}9`).values = [[""], [""], [""], [""], [""]];
        sheet.getRange(`${actual[0]}10:${actual[0]}12`).values = [[""], [""], [""]];

        if (row11.values.flat(1)[0] !== "" && row11.values.flat(1)[0] !== Strings.backfillMapped) {
          sheet.getRange(`${actual[0]}16:${actual[0]}${totalTableRows + 16 - 1}`).values = row13.values.flat(1)[0]
            ? countArray.map(() => [row13.values.flat(1)[0]])
            : countArray.map(() => [""]);
        }

        await context.sync();
        return;
      }

      // For set Source data sample column cells
      const formula1: string = `=IF(LEN(IFERROR(VLOOKUP($B5,${activeTempWorksheetTableName}[#All],IFERROR(HLOOKUP('${activeWorksheetStagingArea}'!${actual[0]}$4,${activeTempWorksheetTableName}[#All],2,FALSE), ""),FALSE),""))=0,"",IFERROR(VLOOKUP($B5,${activeTempWorksheetTableName}[#All],IFERROR(HLOOKUP('${activeWorksheetStagingArea}'!${actual[0]}$4,${activeTempWorksheetTableName}[#All],2,FALSE), ""),FALSE),""))`;
      const basicMainAddress: string = `${actual[0]}${parseInt(actual[1]) + 1}`;
      sheet.getRange(basicMainAddress).values = [[formula1]];
      sheet.getRange(`${actual[0]}6:${actual[0]}9`).copyFrom(basicMainAddress);

      // For set Staging Table column cells
      const formula2: string = `=IF(${actual[0]}$13="",IF(LEN(IFERROR(VLOOKUP($B16,${activeTempWorksheetTableName}[#All],IFERROR(HLOOKUP('${activeWorksheetStagingArea}'!${actual[0]}$4,${activeTempWorksheetTableName}[#All],2,FALSE), ""),FALSE),""))=0,"",IFERROR(VLOOKUP($B16,${activeTempWorksheetTableName}[#All],IFERROR(HLOOKUP('${activeWorksheetStagingArea}'!${actual[0]}$4,${activeTempWorksheetTableName}[#All],2,FALSE), ""),FALSE),"")),${actual[0]}$13)`;
      sheet.getRange(`${actual[0]}16`).values = [[formula2]];
      if (totalTableRows > 1) {
        sheet.getRange(`${actual[0]}17:${actual[0]}${totalTableRows + 17 - 2}`).copyFrom(`${actual[0]}16`);
      }
      await context.sync();

      onConfirmData(false);
    } else if (parseInt(actual[1]) === 13) {
      if (!event?.details?.valueAfter) {
        // Check row 4 against this specific column
        const row4: Excel.Range = sheet
          .getRange(actual.length > 2 ? `${actual[0]}4:${actual[2]}4` : `${actual[0]}4`)
          .load(ExcelLoadEnumerator.values);
        await context.sync();

        if (row4.values.flat(1)[0] === "" && actual.length === 2) {
          sheet.getRange(`${actual[0]}16:${actual[0]}${totalTableRows + 16 - 1}`).values = countArray.map(() => [""]);
          return;
        } else if (actual.length === 4) {
          let k = 0;
          let startKey: string = actual[0];
          do {
            if (row4.values.flat(1)[k]) {
              const formula2: string = `=IF(${startKey}$13="",IF(LEN(IFERROR(VLOOKUP($B16,${activeTempWorksheetTableName}[#All],IFERROR(HLOOKUP('${activeWorksheetStagingArea}'!${startKey}$4,${activeTempWorksheetTableName}[#All],2,FALSE), ""),FALSE),""))=0,"",IFERROR(VLOOKUP($B16,${activeTempWorksheetTableName}[#All],IFERROR(HLOOKUP('${activeWorksheetStagingArea}'!${startKey}$4,${activeTempWorksheetTableName}[#All],2,FALSE), ""),FALSE),"")),${startKey}$13)`;
              sheet.getRange(`${startKey}16`).values = [[formula2]];
              sheet.getRange(`${startKey}17:${startKey}${totalTableRows + 17 - 2}`).copyFrom(`${startKey}16`);
            } else {
              sheet.getRange(`${startKey}16:${startKey}${totalTableRows + 16 - 1}`).values = countArray.map(() => [""]);
            }
            startKey = CommonMethods.getNextKey(startKey);
            k++;
          } while (k < row4.values.flat(1).length);
          return;
        } else {
          const formula2: string = `=IF(${actual[0]}$13="",IF(LEN(IFERROR(VLOOKUP($B16,${activeTempWorksheetTableName}[#All],IFERROR(HLOOKUP('${activeWorksheetStagingArea}'!${actual[0]}$4,${activeTempWorksheetTableName}[#All],2,FALSE), ""),FALSE),""))=0,"",IFERROR(VLOOKUP($B16,${activeTempWorksheetTableName}[#All],IFERROR(HLOOKUP('${activeWorksheetStagingArea}'!${actual[0]}$4,${activeTempWorksheetTableName}[#All],2,FALSE), ""),FALSE),"")),${actual[0]}$13)`;
          sheet.getRange(`${actual[0]}16`).values = [[formula2]];
          sheet.getRange(`${actual[0]}17:${actual[0]}${totalTableRows + 17 - 2}`).copyFrom(`${actual[0]}16`);
          await context.sync();

          onConfirmData(false);
          return;
        }
      }

      if (event.details?.valueAfter) {
        sheet.getRange(`${actual[0]}16`).values = [[event.details.valueAfter]];
        if (totalTableRows > 1) {
          sheet.getRange(`${actual[0]}17:${actual[0]}${totalTableRows + 17 - 2}`).copyFrom(`${actual[0]}16`);
        }
      }
    }
  });
}

// function which reads staging area table data and converts formulas and other formats into normal values.
export async function onConfirmData(showToast: boolean): Promise<void> {
  await Excel.run(async (context: Excel.RequestContext) => {
    let sheet: Excel.Worksheet = context.workbook.worksheets.getActiveWorksheet();
    await context.sync();

    const usedRange: Excel.Range = sheet.getUsedRange();
    usedRange.copyFrom(usedRange, Excel.RangeCopyType.values);
    await context.sync();

    if (showToast) {
      toast.success("Data confirmed successfuly.");
    }
  });
}

// function finds the columns which are not mapped in staging area table and stores these columns in redux store
export async function unmappedcolumn(
  onChange: boolean,
  hitPercentageFunction: boolean,
  sheetName: string,
  worksheetEvent: Excel.WorksheetChangedEventArgs
): Promise<void> {
  const { activeWorksheetStagingArea, activeWorksheetStagingAreaTableName, activeTempWorksheet } = CommonMethods.getActiveWorkSheetAndTableName(sheetName);
  await Excel.run(async (context: Excel.RequestContext) => {
    // get staging area sheet and sync the context
    const sheets: Excel.WorksheetCollection = context.workbook.worksheets;
    const sheet: Excel.Worksheet = sheets.getItem(activeWorksheetStagingArea);
    const stagingTable: Excel.Table = sheet.tables.getItem(activeWorksheetStagingAreaTableName);
    await context.sync();

    const selectedSheetData = store.getState().process.selectedSheetData;
    const result_list = selectedSheetData[`${CommonMethods.getSelectedSheet("result_list")}`];

    // get the last used cell in staging area sheet
    let staging_last_cell = sheet.getCell(1, result_list.length);
    staging_last_cell.load(ExcelLoadEnumerator.address);

    // get tempdata sheet and get last header cell and sync the context
    const columnCount: number = selectedSheetData[`${CommonMethods.getSelectedSheet("column_count")}`];
    let temp_sheet = sheets.getItem(activeTempWorksheet);
    let last_header_cell = temp_sheet.getCell(0, columnCount);
    last_header_cell.load(ExcelLoadEnumerator.address);
    await context.sync();

    const latestUserProfile: IUserProfile = store.getState().process.latestUserProfile;
    console.log(latestUserProfile);

    // get tempdata header range and load values
    let raw_sov_columns_range = temp_sheet.getRange(
      "B1:" + last_header_cell.address
    );
    raw_sov_columns_range.load(ExcelLoadEnumerator.values).load(ExcelLoadEnumerator.address);

      // get source data header rage in staging area sheet and load values
      const range4: Excel.Range = sheet
        .getRange(
          `C4:${CommonMethods.columnAddressSlice(
            staging_last_cell.address,
            3
          )}4`
        )
        .load(ExcelLoadEnumerator.values);
      const range15: Excel.Range = sheet
        .getRange(
          `C4:${CommonMethods.columnAddressSlice(
            staging_last_cell.address,
            3
          )}4`
        )
        .load(ExcelLoadEnumerator.values);
      await context.sync();

      // find unmapped columns by checking mapped columns in raw SOV columns list
      const unmappedRawSovColumns: string[] = differenceWith(
        raw_sov_columns_range.values[0],
        range4.values[0],
        isEqual
      );

      const unMappedProfileColumns: string[] = differenceWith(
        latestUserProfile.poc_columns,
        range15.values[0],
        isEqual
      );

      if (onChange && hitPercentageFunction && worksheetEvent) {
        await deleteUnMappedColumnValues(sheetName);
        await stagingAreaPercentagesSet(sheetName, worksheetEvent);
      }
      
      await context.sync();
      if (Office.context.requirements.isSetSupported("ExcelApi", "1.2")) {
        sheet.getUsedRange().format.autofitColumns();
        sheet.getUsedRange().format.autofitRows();
      }    

      store.dispatch(setUnMappedColumns({ unMappedRawColumns: unmappedRawSovColumns, unMappedProfileColumns: unMappedProfileColumns }));
  });
}

export async function deleteUnMappedColumnValues(sheetName: string): Promise<void> {
  const selectedSheetData = store.getState().process.selectedSheetData;
  const { activeWorksheetStagingArea, activeWorksheetStagingAreaTableName } = CommonMethods.getActiveWorkSheetAndTableName(sheetName);
  
  await Excel.run(async (context: Excel.RequestContext) => {
    // get staging area sheet and sync the context
    const sheets: Excel.WorksheetCollection = context.workbook.worksheets;
    const stagingSheet: Excel.Worksheet = sheets.getItem(activeWorksheetStagingArea);
    const stagingTable: Excel.Table = stagingSheet.tables.getItem(activeWorksheetStagingAreaTableName);
    stagingTable.load(ExcelLoadEnumerator.rows);
    await context.sync();

    const totalTableRows: number = stagingTable.rows.count;

    const countArray: number[] = [];
    for (let i = 1; i <= totalTableRows; i++) {
      countArray.push(i);
    }


    const result_list: any[] = selectedSheetData[`${CommonMethods.getSelectedSheet("result_list")}`];

    let addressKey: string = AlphabetsEnumerator.C;
    for (let j = 0; j < result_list?.length - 1; j++) {
      const rangeRow4: Excel.Range = stagingSheet.getRange(`${addressKey}4`).load(ExcelLoadEnumerator.values);
      const rangeRow11: Excel.Range = stagingSheet.getRange(`${addressKey}11`).load(ExcelLoadEnumerator.values);
      const rangeRow5to9: Excel.Range = stagingSheet.getRange(`${addressKey}5:${addressKey}9`).load(ExcelLoadEnumerator.values);
      await context.sync();

      if (rangeRow4.values.flat(1)[0] === '' && rangeRow11.values.flat(1)[0] && rangeRow5to9.values.flat(1).filter(f => f).length > 0) {
        break;
      } else {
        addressKey = CommonMethods.getNextKey(addressKey);
      }
    }

    const row11: Excel.Range = stagingSheet.getRange(`${addressKey}11`).load(ExcelLoadEnumerator.values);
    await context.sync();

    stagingSheet.getRange(`${addressKey}5:${addressKey}9`).values = [[''], [''], [''], [''], ['']];
    
    if (row11.values.flat(1)[0] !== Strings.backfillMapped) {
      stagingSheet.getRange(`${addressKey}16:${addressKey}${(totalTableRows + 16) - 1}`).values = countArray.map(() => ['']);
    }

    await context.sync();
    return;
  });
}

export async function stagingAreaPercentagesSet(sheetName: string, worksheetEvent: Excel.WorksheetChangedEventArgs): Promise<void> {
  const { activeWorksheetStagingArea } = CommonMethods.getActiveWorkSheetAndTableName(sheetName);
  await Excel.run(async (context: Excel.RequestContext) => {
    // get staging area sheet and sync the context
    const sheets: Excel.WorksheetCollection = context.workbook.worksheets;
    const stagingSheet: Excel.Worksheet = sheets.getItem(activeWorksheetStagingArea);
    await context.sync();

    const address: string[] = worksheetEvent.address.match(/[a-zA-Z]+|[0-9]+/g);    
    const selectedRange = stagingSheet.getRange(`${address[0]}10:${address[0]}12`);

    if ((worksheetEvent.details && !worksheetEvent.details.valueAfter) || (worksheetEvent.triggerSource === "ThisLocalAddin" && !worksheetEvent.details)) {
      selectedRange.values = [[''], [''], ['']];
      selectedRange.format.fill.color = AppColors.primacy_white;
    } else if (worksheetEvent.details && worksheetEvent.details.valueAfter && worksheetEvent.details.valueAfter !== worksheetEvent.details.valueBefore) {
      selectedRange.values = [[Strings.halfT], [Strings.manuallyMapped], [Strings.arrowDown]];
      selectedRange.format.font.size = 14;
      selectedRange.format.fill.color = AppColors.primacy_white;
      selectedRange.format.font.color = AppColors.primacy_red;
    }
    await context.sync();

    if (Office.context.requirements.isSetSupported("ExcelApi", "1.2")) {
      stagingSheet.getUsedRange().format.autofitColumns();
      stagingSheet.getUsedRange().format.autofitRows();
    }
  });
}

export async function adjustColorGradients(color: string, sheetName: string): Promise<void> {
  const { activeWorksheetStagingArea, activeWorksheetStagingAreaTableName } = CommonMethods.getActiveWorkSheetAndTableName(sheetName);
  await Excel.run(async (context: Excel.RequestContext) => {
    let sheet: Excel.Worksheet = context.workbook.worksheets.getItem(activeWorksheetStagingArea);
    let stagingTable: Excel.Table = sheet.tables
      .getItem(activeWorksheetStagingAreaTableName)
      .load(ExcelLoadEnumerator.columns)
      .load(ExcelLoadEnumerator.columnCount);
    await context.sync();
    // get the staging table coumn count to get last cell address
    let colLength: number = stagingTable.columns.count;
    let staging_last_cell = sheet.getCell(1, colLength);
    staging_last_cell.load(ExcelLoadEnumerator.address);
    await context.sync();

    const range: Excel.Range = sheet
      .getRange(
        `C11:${CommonMethods.columnAddressSlice(
          staging_last_cell.address,
          2
        )}11`
      )
      .load(ExcelLoadEnumerator.values);
    await context.sync();

    const values: any[] = range.values.flat(1);
    let initial: string = AlphabetsEnumerator.C;

    values.forEach((val) => {
      if (
        (val !== "" &&
          val !== Strings.manuallyMapped &&
          typeof val === "number" &&
          !color) ||
        (color && val !== "")
      ) {
        let rangeHalfT: Excel.Range = sheet.getRange(`${initial}10`);
        let rangePercentage: Excel.Range = sheet.getRange(`${initial}11`);
        let rangeArrow: Excel.Range = sheet.getRange(`${initial}12`);
        const updatedColor: string = color
          ? color
          : CommonMethods.getRangeColor(val * 100);

        rangePercentage.format.font.color = AppColors.primacy_black;
        rangePercentage.format.fill.color = updatedColor;
        rangeHalfT.format.font.color = updatedColor;
        rangeArrow.format.font.color = updatedColor;
      }
      initial = CommonMethods.getNextKey(initial);
    });

    await context.sync();
  });
}

export async function setStagingAreaColorSchemes(stagingColumns: IStagingAreaColumn[], sheetName: string, tableName: string): Promise<void> {
  await Excel.run(async (context: Excel.RequestContext) => {
    // Format the staging header
    let stagingSheet: Excel.Worksheet = context.workbook.worksheets.getItemOrNullObject(sheetName);
    await context.sync();

    let stagingTable: Excel.Table = stagingSheet.tables.getItem(tableName).load(ExcelLoadEnumerator.address);
    await context.sync();

    for(const column of stagingColumns) {
      const headerRange: Excel.Range = stagingTable.columns.getItem(column.display_name).getHeaderRowRange().load(ExcelLoadEnumerator.address);
      const bodyRange: Excel.Range = stagingTable.columns.getItem(column.display_name).getDataBodyRange().load(ExcelLoadEnumerator.address);
      await context.sync();

      if (column.display_name.includes("Date") || column.display_name.includes("Reporting Month")) {
        bodyRange.numberFormat = [["[$-409]mm/dd/yyyy"]];
      }

      if (column.header_colour_code) {
        headerRange.format.fill.color = column.header_colour_code;
        headerRange.format.font.bold = true;
        headerRange.format.font.color = AppColors.primacy_black;
        headerRange.format.rowHeight = 22;
        headerRange.format.columnWidth = 200;

        headerRange.format.horizontalAlignment = Excel.HorizontalAlignment.center;
        headerRange.format.verticalAlignment = Excel.VerticalAlignment.center;
        CommonMethods.setRangeBorders(headerRange, AppColors.primary_blue, true);
  
        if (column.body_colour_code) {
          bodyRange.format.fill.color = column.body_colour_code;
        }
      
        CommonMethods.setRangeBorders(bodyRange, AppColors.primary_blue, true);

        headerRange.format.autofitColumns();
        headerRange.format.autofitRows();
      }
    }

    await context.sync();
  });
}

export async function stateCityColumnsValuesMap(sheetName: string): Promise<void> {
  const { activeWorksheetStagingArea, activeWorksheetStagingAreaTableName } = CommonMethods.getActiveWorkSheetAndTableName(sheetName);
  await Excel.run(async (context: Excel.RequestContext) => {
    const stagingSheet: Excel.Worksheet = context.workbook.worksheets.getItemOrNullObject(activeWorksheetStagingArea);
    const stagingTable: Excel.Table = stagingSheet.tables.getItem(activeWorksheetStagingAreaTableName).load(ExcelLoadEnumerator.address);
    await context.sync();

    const agentStateCity: Excel.Range = stagingTable.columns.getItemOrNullObject("Agent State-City").getDataBodyRange().load(ExcelLoadEnumerator.values);
    const insuredStateColumn: Excel.Range = stagingTable.columns.getItemOrNullObject("Insured State").getDataBodyRange().load(ExcelLoadEnumerator.values).load(ExcelLoadEnumerator.address);
    const insuredCityColumn: Excel.Range = stagingTable.columns.getItemOrNullObject("Insured City").getDataBodyRange().load(ExcelLoadEnumerator.values).load(ExcelLoadEnumerator.address);
    await context.sync();

    if (!agentStateCity.isNullObject && !insuredStateColumn.isNullObject && !insuredCityColumn.isNullObject) {
      const insuredCityAddress: string[] = insuredCityColumn.address.split('!')[1].match(/[a-zA-Z]+|[0-9]+/g);
      const insuredStateAddress: string[] = insuredStateColumn.address.split('!')[1].match(/[a-zA-Z]+|[0-9]+/g);

      const insuredCityRow4: Excel.Range = stagingSheet.getRange(`${insuredCityAddress[0]}4`).load(ExcelLoadEnumerator.values);
      const insuredStateRow4: Excel.Range = stagingSheet.getRange(`${insuredStateAddress[0]}4`).load(ExcelLoadEnumerator.values);
      await context.sync();

      if (!insuredStateRow4.values.flat(1)[0]) {
        insuredStateColumn.values = agentStateCity.values.flat(1).map((v: string) => [v.split('-')[0].split(' ').join('')]);
      }
      if (!insuredCityRow4.values.flat(1)[0]) {
        insuredCityColumn.values = agentStateCity.values.flat(1).map((v: string) => [v.split('-')[1]]);
      }
    }

    await context.sync();
  });
}
