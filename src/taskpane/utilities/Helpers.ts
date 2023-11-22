import { toast } from "react-toastify";
import { AppColors, Strings } from "@taskpaneutilities/Constants";
import { AlphabetsEnumerator, ExcelLoadEnumerator } from "@taskpaneutilities/Enum";
import CommonMethods from "@taskpaneutilities/CommonMethods";
import { differenceWith, isEqual } from "lodash";
import { IColumnIdentify, IStagingAreaColumns } from "@taskpaneutilities/Interface";
import NetworkCalls from "@taskpane/services/ApiNetworkCalls";

/** Default helper for invoking an action and handling errors. */
export async function tryCatch(callback, setLoader: (f: boolean) => void) {
  try {
    setLoader(true);
    await callback;
    setLoader(false);
  } catch (error) {
    // Note: In a production add-in, you'd want to notify the user through your add-in's UI.
    console.error(error);
    setLoader(false);
  }
}

export async function formulaPasteUnPasteWhileChangeMappings(
  event: Excel.WorksheetChangedEventArgs
): Promise<void> {
  await Excel.run(async (context: Excel.RequestContext) => {
    const { worksheetStagingArea, worksheetTableName } = await CommonMethods.getActiveWorkSheetAndTableName();
    const sheet: Excel.Worksheet = context.workbook.worksheets.getItem(worksheetStagingArea);
    const table: Excel.Table = sheet.tables.getItem(worksheetTableName).load(ExcelLoadEnumerator.rows);
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

        if (row11.values.flat(1)[0] !== "" && row11.values.flat(1)[0] !== Strings.backfillMapped) {
          sheet.getRange(`${actual[0]}16:${actual[0]}${totalTableRows + 16 - 1}`).values = row13.values.flat(1)[0]
            ? countArray.map(() => [row13.values.flat(1)[0]])
            : countArray.map(() => [""]);
        }

        await context.sync();
        return;
      }

      // For set Source data sample column cells
      const formula1: string = `=IF(LEN(IFERROR(VLOOKUP($B5,TempdataTable[#All],IFERROR(HLOOKUP('Staging Area'!${actual[0]}$4,TempdataTable[#All],2,FALSE), ""),FALSE),""))=0,"",IFERROR(VLOOKUP($B5,TempdataTable[#All],IFERROR(HLOOKUP('Staging Area'!${actual[0]}$4,TempdataTable[#All],2,FALSE), ""),FALSE),""))`;
      const basicMainAddress: string = `${actual[0]}${parseInt(actual[1]) + 1}`;
      sheet.getRange(basicMainAddress).values = [[formula1]];
      sheet.getRange(`${actual[0]}6:${actual[0]}9`).copyFrom(basicMainAddress);

      // For set Staging Table column cells
      const formula2: string = `=IF(${actual[0]}$13="",IF(LEN(IFERROR(VLOOKUP($B16,TempdataTable[#All],IFERROR(HLOOKUP('Staging Area'!${actual[0]}$4,TempdataTable[#All],2,FALSE), ""),FALSE),""))=0,"",IFERROR(VLOOKUP($B16,TempdataTable[#All],IFERROR(HLOOKUP('Staging Area'!${actual[0]}$4,TempdataTable[#All],2,FALSE), ""),FALSE),"")),${actual[0]}$13)`;
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
              const formula2: string = `=IF(${startKey}$13="",IF(LEN(IFERROR(VLOOKUP($B16,TempdataTable[#All],IFERROR(HLOOKUP('Staging Area'!${startKey}$4,TempdataTable[#All],2,FALSE), ""),FALSE),""))=0,"",IFERROR(VLOOKUP($B16,TempdataTable[#All],IFERROR(HLOOKUP('Staging Area'!${startKey}$4,TempdataTable[#All],2,FALSE), ""),FALSE),"")),${startKey}$13)`;
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
          const formula2: string = `=IF(${actual[0]}$13="",IF(LEN(IFERROR(VLOOKUP($B16,TempdataTable[#All],IFERROR(HLOOKUP('Staging Area'!${actual[0]}$4,TempdataTable[#All],2,FALSE), ""),FALSE),""))=0,"",IFERROR(VLOOKUP($B16,TempdataTable[#All],IFERROR(HLOOKUP('Staging Area'!${actual[0]}$4,TempdataTable[#All],2,FALSE), ""),FALSE),"")),${actual[0]}$13)`;
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
  const { worksheetStagingArea } = await CommonMethods.getActiveWorkSheetAndTableName();
  await Excel.run(async (context: Excel.RequestContext) => {
    let sheet: Excel.Worksheet = context.workbook.worksheets.getItem(worksheetStagingArea);
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
  autoMappedRawColumns: string[] | undefined,
  autoMappedStagingColumns: string[] | undefined,
  hitPercentageFunction: boolean,
  changeAddress?: string
): Promise<void> {
  const { worksheetStagingArea, worksheetTableName, worksheetName } = await CommonMethods.getActiveWorkSheetAndTableName();
  await Excel.run(async (context: Excel.RequestContext) => {
    // get staging area sheet and sync the context
    const sheets: Excel.WorksheetCollection = context.workbook.worksheets;
    const sheet: Excel.Worksheet = sheets.getItem(worksheetStagingArea);
    const stagingTable: Excel.Table = sheet.tables.getItem(worksheetTableName);
    const stagingTableHeader = stagingTable.getHeaderRowRange().load(ExcelLoadEnumerator.values);
    await context.sync();

    const headerStaging: string[][] = stagingTableHeader.values;

    const result_list = CommonMethods.getLocalStorage("result_list");

    // get the last used cell in staging area sheet
    let staging_last_cell = sheet.getCell(1, result_list.length);
    staging_last_cell.load(ExcelLoadEnumerator.address);

    // get tempdata sheet and get last header cell and sync the context
    let temp_sheet = sheets.getItem(worksheetName + " Temp DataSheet");
    let last_header_cell = temp_sheet.getCell(
      0,
      parseInt(CommonMethods.getLocalStorage("column_count"))
    );
    last_header_cell.load(ExcelLoadEnumerator.address);
    await context.sync();

      // get tempdata header range and load values
      let raw_sov_columns_range = temp_sheet.getRange(
        "B1:" + last_header_cell.address
      );
      raw_sov_columns_range.load(ExcelLoadEnumerator.values).load(ExcelLoadEnumerator.address);

      // get source data header rage in staging area sheet and load values
      const range: Excel.Range = sheet
        .getRange(
          `C4:${CommonMethods.columnAddressSlice(
            staging_last_cell.address,
            3
          )}4`
        )
        .load(ExcelLoadEnumerator.values);
      await context.sync();

      // get mapped columns
      const raw_with_emty = range.values;
      const mappedColumn = raw_with_emty[0].filter((column) => column);
      const mappedStagingSheetColumns: string[] = headerStaging[0]
        .slice(2)
        .map((col: string, ind: number) =>
          raw_with_emty[0][ind] ? col : undefined
        )
        .filter((column) => column);
      // find unmapped columns by checking mapped columns in raw SOV columns list
      const unmappedRawSovColumns: string[] = differenceWith(
        raw_sov_columns_range.values[0],
        raw_with_emty[0],
        isEqual
      );

      // For Data Mapped/Quality/Completeness score when no onChange is called
      if (
        (!autoMappedRawColumns || !autoMappedRawColumns?.length) &&
        !onChange
      ) {
        CommonMethods.setLocalStorage(
          "autoMappedRawColumns",
          JSON.stringify(mappedColumn)
        );
        CommonMethods.setLocalStorage(
          "autoMappedStagingColumns",
          JSON.stringify(mappedStagingSheetColumns)
        );
      }

      // For Data Mapped/Quality/Completeness score when onChange is changed
      if (
        autoMappedRawColumns?.length &&
        autoMappedStagingColumns?.length &&
        onChange
      ) {
        
        if (hitPercentageFunction) {
          await deleteUnMappedColumnValues();
          await stagingAreaPercentagesSet(autoMappedRawColumns, changeAddress);
        }
      
      }

      await context.sync();
      if (Office.context.requirements.isSetSupported("ExcelApi", "1.2")) {
        sheet.getUsedRange().format.autofitColumns();
        sheet.getUsedRange().format.autofitRows();
      }    
  });
}

export async function deleteUnMappedColumnValues(): Promise<void> {
  const { worksheetStagingArea, worksheetTableName } = await CommonMethods.getActiveWorkSheetAndTableName();
  await Excel.run(async (context: Excel.RequestContext) => {
    // get staging area sheet and sync the context
    const sheets: Excel.WorksheetCollection = context.workbook.worksheets;
    const stagingSheet: Excel.Worksheet = sheets.getItem(worksheetStagingArea);
    const stagingTable: Excel.Table = stagingSheet.tables.getItem(worksheetTableName);
    stagingTable.load(ExcelLoadEnumerator.rows);
    await context.sync();

    const totalTableRows: number = stagingTable.rows.count;

    const countArray: number[] = [];
    for (let i = 1; i <= totalTableRows; i++) {
      countArray.push(i);
    }

    const result_list: any[] = JSON.parse(CommonMethods.getLocalStorage("result_list"));

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

export async function stagingAreaPercentagesSet(autoMappedRawColumns: string[], changeAddress: string): Promise<string[]> {
  const { worksheetName, worksheetStagingArea } = await CommonMethods.getActiveWorkSheetAndTableName();
  const manualMappedColumns: string[] = await Excel.run(async (context: Excel.RequestContext) => {
    // get staging area sheet and sync the context
    const sheets: Excel.WorksheetCollection = context.workbook.worksheets;
    const stagingSheet: Excel.Worksheet = sheets.getItem(worksheetStagingArea);
    await context.sync();

    // get TempData sheet and sync the context
    let temp_sheet = sheets.getItem(worksheetName + " Temp DataSheet");
    let last_header_cell = temp_sheet.getCell(
      0,
      parseInt(CommonMethods.getLocalStorage("column_count"))
    );
    last_header_cell.load(ExcelLoadEnumerator.address);
    await context.sync();

    let raw_sov_columns_range: Excel.Range = temp_sheet.getRange(
      "B1:" + last_header_cell.address
    );
    raw_sov_columns_range.load(ExcelLoadEnumerator.values).load(ExcelLoadEnumerator.address);

    let staging_last_cell = stagingSheet.getCell(
      1,
      JSON.parse(CommonMethods.getLocalStorage("result_list"))?.length
    );
    staging_last_cell.load(ExcelLoadEnumerator.address);
    await context.sync();

    const rangeRow4: Excel.Range = stagingSheet
      .getRange(
        `B4:${CommonMethods.columnAddressSlice(
          staging_last_cell.address,
          2
        )}4`
      )
      .load(ExcelLoadEnumerator.values);
    const halfTIconsRange: Excel.Range = stagingSheet
      .getRange(
        `B10:${CommonMethods.columnAddressSlice(
          staging_last_cell.address,
          2
        )}10`
      )
      .load(ExcelLoadEnumerator.values);
    let percRange: Excel.Range = stagingSheet
      .getRange(
        `B11:${CommonMethods.columnAddressSlice(
          staging_last_cell.address,
          2
        )}11`
      )
      .load(ExcelLoadEnumerator.values);
    const arrowIconsRange: Excel.Range = stagingSheet
      .getRange(
        `B12:${CommonMethods.columnAddressSlice(
          staging_last_cell.address,
          2
        )}12`
      )
      .load(ExcelLoadEnumerator.values);
    await context.sync();
      
    const arr: string[] = []; // Array of manually managed columns

    let initial1: string = AlphabetsEnumerator.B;
    const rangeElevenValues: any[] = percRange.values.flat(1);
    const match_percentage_list: (string | number)[] = rangeRow4.values
      .flat(1)
      .map((v: string, i) => {
        let val = "";
        if (v && autoMappedRawColumns.includes(v)) {
          val = rangeElevenValues[i];
        }
        if (v && !autoMappedRawColumns.includes(v)) {
          val = Strings.manuallyMapped;
        }
        if (changeAddress === `${initial1}4` && v) {
          val = Strings.manuallyMapped;
        }
        initial1 = CommonMethods.getNextKey(initial1);

        if (val === Strings.manuallyMapped) {
          arr.push(v);
        }

        if (!v && rangeElevenValues[i] === Strings.backfillMapped) {
          val = Strings.backfillMapped;
        }

        return val;
      });

    percRange.values = [match_percentage_list];
    arrowIconsRange.values = [rangeRow4.values.flat(1).map((v) => (v ? Strings.arrowDown : ""))];
    halfTIconsRange.values = [rangeRow4.values.flat(1).map((v) => (v ? Strings.halfT : ""))];
    await context.sync();

    const formats: string[] = await CommonMethods.stagingAreaPercentageFormatGet();

    const values: any[] = percRange.values.flat(1);
    let initial: string = AlphabetsEnumerator.B;

    values.forEach((val, ind: number) => {
      let rangeHalfT: Excel.Range = stagingSheet.getRange(`${initial}10`);
      let rangePercentage: Excel.Range = stagingSheet.getRange(`${initial}11`);
      let rangeArrow: Excel.Range = stagingSheet.getRange(`${initial}12`);
      const condition: boolean = formats[ind] !== AppColors.primacy_green;

      if (val !== "" && typeof val === "string") {
        if (condition) {
          rangePercentage.format.font.size = 14;
          rangePercentage.format.fill.color = AppColors.primacy_white;
          rangePercentage.format.font.color = AppColors.primacy_red;
          rangeHalfT.format.font.color = AppColors.primacy_red;
          rangeArrow.format.font.color = AppColors.primacy_red;
        }
      } else if (val !== "" && typeof val === "number") {
        if (condition) {
          const updatedColor = CommonMethods.getRangeColor(val * 100);
          rangePercentage.format.font.color = AppColors.primacy_black;
          rangePercentage.format.fill.color = updatedColor;
          rangeHalfT.format.font.color = updatedColor;
          rangeArrow.format.font.color = updatedColor;
        }
      } else {
        if (
          val !== "" &&
          typeof val === "string" &&
          formats[ind] === AppColors.primacy_green
        ) {
          rangePercentage.format.fill.color = formats[ind];
        } else {
          rangePercentage.format.fill.color = AppColors.primacy_white;
        }
      }

      initial = CommonMethods.getNextKey(initial);
    });

    await context.sync();

    if (Office.context.requirements.isSetSupported("ExcelApi", "1.2")) {
      stagingSheet.getUsedRange().format.autofitColumns();
      stagingSheet.getUsedRange().format.autofitRows();
    }
  
    return arr;
  });
  
  return manualMappedColumns;
}

export async function adjustColorGradients(color: string): Promise<void> {
  const { worksheetStagingArea, worksheetTableName } = await CommonMethods.getActiveWorkSheetAndTableName();
  await Excel.run(async (context: Excel.RequestContext) => {
    let sheet: Excel.Worksheet = context.workbook.worksheets.getItem(worksheetStagingArea);
    let stagingTable: Excel.Table = sheet.tables
      .getItem(worksheetTableName)
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

export async function setStagingAreaColorSchemes(): Promise<void> {
  const { worksheetStagingArea, worksheetTableName, worksheetName } = await CommonMethods.getActiveWorkSheetAndTableName();
  const columnsResponse = worksheetName.includes('CLAIMS') ? await NetworkCalls.getStagingAreaColumnsForClaims() : await NetworkCalls.getStagingAreaColumnsForPremium();
  const StagingColumns: IStagingAreaColumns = columnsResponse?.data;

  await Excel.run(async (context: Excel.RequestContext) => {
    // Format the staging header
    let sheet: Excel.Worksheet = context.workbook.worksheets.getItemOrNullObject(worksheetStagingArea);
    await context.sync();
    let stagingTable: Excel.Table = sheet.tables.getItem(worksheetTableName).load(ExcelLoadEnumerator.values);
    stagingTable.load(ExcelLoadEnumerator.columns);
    await context.sync();

    const _coverageABody = stagingTable.columns.getItem(StagingColumns.TOTAL_PAID_INCLUDING_FEES.displayName).getDataBodyRange().load(ExcelLoadEnumerator.address);
    const _tivBody = stagingTable.columns.getItem(StagingColumns.TOTAL_INDEMNITY_PAID.displayName).getDataBodyRange().load(ExcelLoadEnumerator.address);
    await context.sync();

    const id = stagingTable.columns.getItem(StagingColumns.ID.displayName).getDataBodyRange();
    const postalCode = stagingTable.columns.getItem(StagingColumns.PRODUCT.displayName).getDataBodyRange();
    const coverages = sheet.getRange(`${_coverageABody.address}:${_tivBody.address}`);
    await context.sync();
    id.numberFormat = [["#"]];
    postalCode.numberFormat = [["#00000"]];
    coverages.numberFormat = [["#,###,##0"]];

    for(const [key, value] of Object.entries(StagingColumns) as [string, IColumnIdentify][]) {
      const headerRange: Excel.Range = stagingTable.columns.getItem(value.displayName).getHeaderRowRange().load(ExcelLoadEnumerator.address);
      const bodyRange: Excel.Range = stagingTable.columns.getItem(value.displayName).getDataBodyRange().load(ExcelLoadEnumerator.address);
      await context.sync();

      if (value.headerColor) {
        headerRange.format.fill.color = value.headerColor;
        headerRange.format.font.bold = true;
        headerRange.format.font.color = AppColors.primacy_black;
        headerRange.format.rowHeight = 30;
        if (![StagingColumns.ID.displayName, StagingColumns.FLAG.displayName].includes(value.displayName)) {
          headerRange.format.columnWidth = 200;
        }
        headerRange.format.horizontalAlignment = Excel.HorizontalAlignment.center;
        headerRange.format.verticalAlignment = Excel.VerticalAlignment.center;
        CommonMethods.setRangeBorders(headerRange, AppColors.primary_blue, true);
  
        if (value.bodyColor) {
          bodyRange.format.fill.color = value.bodyColor;
        }
        CommonMethods.setRangeBorders(bodyRange, AppColors.primary_blue, true);
      }
    }

    await context.sync();
  });
}
