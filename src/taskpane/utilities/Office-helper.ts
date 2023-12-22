import { toast } from "react-toastify";
import CommonMethods from "@taskpaneutilities/CommonMethods";
import { AlphabetsEnumerator, ExcelLoadEnumerator } from "@taskpaneutilities/Enum";
import { adjustColorGradients, adjustPreferenceStagingConstants, formulaPasteUnPasteWhileChangeMappings, onConfirmData, stateCityColumnsValuesMap, tryCatch, unmappedcolumn } from "@taskpaneutilities/Helpers";
import _ from "lodash";
import { API_UNAUTHORISED, AlertsMsgs, AppColors, Strings } from "@taskpaneutilities/Constants";
import { IStagingAreaColumn } from "@taskpaneutilities/Interface";
import NetworkCalls from "@taskpane/services/ApiNetworkCalls";
import { store } from "@redux/Store";
import { setLoader, setManualMapped, setStopwatch } from "@redux/Actions/Auth";
import { setLatestUserProfile, setSelectedSheetData, setSheetChanged } from "@redux/Actions/Process";

export async function onCleanBordereaux(buttonName: string, sheetName: string, batches: number): Promise<void> {
  store.dispatch(setLoader(true));
  store.dispatch(setStopwatch("start"));

  const { activeTempWorksheet, activeTempWorksheetTableName } = CommonMethods.getActiveWorkSheetAndTableName(sheetName);

  await Excel.run(async (context: Excel.RequestContext) => {
    let workbook: Excel.Workbook = context.workbook;
    workbook.load(ExcelLoadEnumerator.name);
    workbook.load(ExcelLoadEnumerator.protection_protected);

    let sheets: Excel.WorksheetCollection = workbook.worksheets;
    sheets.load(ExcelLoadEnumerator.items_name);

    const raw_sov_range: Excel.Range = workbook.getSelectedRange().load(ExcelLoadEnumerator.values);
    raw_sov_range.load(ExcelLoadEnumerator.address);
    raw_sov_range.load(ExcelLoadEnumerator.columnCount);
    raw_sov_range.load(ExcelLoadEnumerator.rowCount);

    let sheet: Excel.Worksheet = sheets.getItemOrNullObject(activeTempWorksheet);
    await context.sync();

    if (raw_sov_range.rowCount < 2 || raw_sov_range.columnCount < 2) {
      toast.error("Please select the range first!");
      store.dispatch(setLoader(false));
      store.dispatch(setStopwatch("stop"));
      return;
    }

    if (workbook.protection.protected) {
      workbook.protection.unprotect("");
      await context.sync();
    }

    global.workbookName = workbook.name?.split(".")[0];

    if (!sheet.isNullObject) {
      sheet.delete();
      await context.sync();
    }

    sheet = sheets.add(activeTempWorksheet);
    await context.sync();

    // activate newly added tab
    sheet.activate();
    await context.sync();

    store.dispatch(setManualMapped(false));
    store.dispatch(setSelectedSheetData({
      [CommonMethods.getSelectedSheet("column_count")]: raw_sov_range.columnCount,
      [CommonMethods.getSelectedSheet("row_count")]: raw_sov_range.rowCount
    }));

    sheet.getRange("B2").copyFrom(raw_sov_range, Excel.RangeCopyType.values);
    sheet.getRange("A2").values = [["ID"]];
    let last_cell = sheet.getCell(1, raw_sov_range.columnCount).load(ExcelLoadEnumerator.address);
    let end_cell = sheet.getCell(raw_sov_range.rowCount, raw_sov_range.columnCount).load(ExcelLoadEnumerator.address);
    await context.sync();

    let sheet_header: Excel.Range = sheet.getRange("A2:" + last_cell.address).load(ExcelLoadEnumerator.values);
    sheet_header.load(ExcelLoadEnumerator.address);
    sheet_header.load(ExcelLoadEnumerator.rowCount);
    sheet_header.load(ExcelLoadEnumerator.columnCount);

    const first_row: Excel.Range = sheet
      .getRange(`A1:${last_cell.address.split("!")[1].match(/[a-zA-Z]+|[0-9]+/g)[0]}1`)
      .load(ExcelLoadEnumerator.values)
      .load(ExcelLoadEnumerator.address);
    await context.sync();

    first_row.values = [sheet_header.values[0]];

    const startRow = 3;
    const endRow = raw_sov_range.rowCount + 2;
    sheet.getRange(`A${startRow}:A${endRow}`).values = Array.from({ length: endRow - startRow + 1 }, (_, i) => [i + 1]);

    const list = Array.from({ length: (raw_sov_range.columnCount + 1) - 2 + 1 }, (_, i) => i + 2); // (raw_sov_range.columnCount + 1) - 2 + 1

    sheet.getRange("B2:" + last_cell.address).clear();
    sheet.getRange("B2:" + last_cell.address).values = [list];
    sheet.getRange("B2:" + last_cell.address).numberFormat = [["#"]];

    // Convert the range to a table.
    let tempTable: Excel.Table = sheet.tables.add("A1:" + end_cell.address, true);
    tempTable.name = activeTempWorksheetTableName;
    sheet.visibility = Excel.SheetVisibility.hidden;
    sheet.getUsedRange().format.autofitColumns();
    sheet.getUsedRange().format.autofitRows();
    await context.sync();

    const totalRows = raw_sov_range.rowCount - 1;         
    const chunks = CommonMethods.stagingAreaRowsDivideIntoChunks(totalRows, batches);

    await tryCatch(createStagingArea(buttonName, sheetName, raw_sov_range.values[0], chunks));
  });
}

// function to create statging area sheet and table
export async function createStagingArea(buttonName: string, sheetName: string, selectedRawColumns: string[], chunks): Promise<void> {
    const { activeWorksheetStagingArea, activeWorksheetStagingAreaTableName, activeTempWorksheet, activeTempWorksheetTableName } = CommonMethods.getActiveWorkSheetAndTableName(sheetName);
    try {
      await Excel.run(async (context: Excel.RequestContext) => {
        let sheets: Excel.WorksheetCollection = context.workbook.worksheets;

        // get staging area sheet and sync the context
        let sheet: Excel.Worksheet = sheets.getItemOrNullObject(activeWorksheetStagingArea);

        // get TempData sheet and sync the context
        const columnCount: number = store.getState().process.selectedSheetData[`${CommonMethods.getSelectedSheet("column_count")}`];
        let temp_sheet: Excel.Worksheet = sheets.getItem(activeTempWorksheet);
        let last_header_cell = temp_sheet.getCell(0, columnCount).load(ExcelLoadEnumerator.address);
        await context.sync();

        // if  there is already a old staging area sheet available, delete it
        if (!sheet.isNullObject) {
          sheet.delete();
        }
        sheet = sheets.add(activeWorksheetStagingArea);
        // activate newly added tab
        sheet = sheets.getItem(activeWorksheetStagingArea);
        sheet.activate();
        sheet.tabColor = "#0292CF";
        await context.sync();

        let raw_sov_columns_range: Excel.Range = temp_sheet
          .getRange("B1:" + last_header_cell.address)
          .load(ExcelLoadEnumerator.address);
        raw_sov_columns_range.load(ExcelLoadEnumerator.values);
        await context.sync();

        let result_list = [];
        let match_percentage_list = [];
        const columnsResponse = buttonName === "Claim" ? await NetworkCalls.getStagingAreaColumnsForClaims() : buttonName === "Premium" ? await NetworkCalls.getStagingAreaColumnsForPremium() : await NetworkCalls.getStagingAreaColumnsForPOC();
        const StagingColumns: IStagingAreaColumn[] = columnsResponse?.data ?? [];
        
        // get map percentage list
        await NetworkCalls.OnMapColumns({ source_columns: selectedRawColumns.map((c) => c.toString()), template_type: buttonName === "Claim" ? buttonName+"s" : buttonName })
          .then((response) => {
            if (response.status === API_UNAUTHORISED) {} else {
              result_list = response.data.result_list;
              match_percentage_list = response.data.match_percentage_list;
              match_percentage_list = match_percentage_list.map((item: any) =>
                item && typeof item !== "string" ? `${item / 100}` : item
              );
              store.dispatch(setSelectedSheetData({
                [CommonMethods.getSelectedSheet("result_list")]: result_list,
              }));
            }
          })
          .catch((err) => {
            console.log(err);
          });

        let staging_last_cell = sheet.getCell(1, result_list.length);
        staging_last_cell.load(ExcelLoadEnumerator.address);
        await context.sync();

        const lastCellAddress: string = CommonMethods.columnAddressSlice(staging_last_cell.address, 2);

        // to fill sheet with white
        sheet.getRange(`A1:${lastCellAddress}14`).format.fill.color = AppColors.primacy_white;

        // add the title 'SOURCE DATA SAMPLE' for the Location Table in cell B3
        let LocTableTitle: Excel.Range = sheet.getRange(`${AlphabetsEnumerator.B}3`);
        LocTableTitle.format.fill.color = "#4472C4";
        LocTableTitle.format.font.color = AppColors.primacy_white;
        LocTableTitle.format.font.size = 32;
        LocTableTitle.values = [["SOURCE DATA SAMPLE"]];

        //merge the Location Table Title across all columns
        let MgdLocTableTitle: Excel.Range = sheet.getRange(`${AlphabetsEnumerator.B}3:${lastCellAddress}3`);
        MgdLocTableTitle.merge(true);
        MgdLocTableTitle.format.fill.color = "#4472C4";
        MgdLocTableTitle.format.font.color = AppColors.primacy_white;
        MgdLocTableTitle.format.font.size = 32;

        // add an empty template for the Source Data Sample where 5 sample rows of the raw SOV data are to be displayed & name it
        let SourceDataSampleTable: Excel.Range = sheet.getRange(`${AlphabetsEnumerator.B}4:${lastCellAddress}9`);
        SourceDataSampleTable.format.fill.color = "#DDEBF7";
        SourceDataSampleTable.format.font.color = AppColors.primacy_black;
        SourceDataSampleTable.format.font.size = 12;

        //change formatting for the header row of the Source Data Sample Table B4
        const rangeRowB4: Excel.Range = sheet.getRange(`${AlphabetsEnumerator.B}4:${lastCellAddress}4`);
        rangeRowB4.format.fill.color = AppColors.primary_light_blue;
        rangeRowB4.format.font.color = AppColors.primacy_black;
        rangeRowB4.format.font.size = 14;
        rangeRowB4.format.font.bold = true;

        //add 'ID' as the header name in cell B4 and enter the first 5 IDs as 1 to 5
        sheet.getRange("B5:B9").values = [["1"], ["2"], ["3"], ["4"], ["5"]];
        sheet.getRange("B5:B9").numberFormat = [["#"]];

        // Percentages section
        let percRangeHalfTIcons: Excel.Range = sheet
          .getRange(`C10:${lastCellAddress}10`)
          .load(ExcelLoadEnumerator.values);
        let percRange: Excel.Range = sheet.getRange(`C11:${lastCellAddress}11`).load(ExcelLoadEnumerator.values);
        let percRangeArrowIcons: Excel.Range = sheet
          .getRange(`C12:${lastCellAddress}12`)
          .load(ExcelLoadEnumerator.values);
        const temprange: Excel.Range = sheet.getRange(`C11:${lastCellAddress}11`);
        temprange.format.font.bold = true;
        await context.sync();

        percRange.format.font.size = 14;
        percRange.format.font.bold = true;
        percRange.format.horizontalAlignment = Excel.HorizontalAlignment.center;
        percRange.numberFormat = [["#.0%"]];

        percRangeArrowIcons.format.horizontalAlignment = Excel.HorizontalAlignment.center;
        percRangeArrowIcons.format.font.size = 17;
        percRangeArrowIcons.format.font.name = "Arial";
        percRangeArrowIcons.format.rowHeight = 15;

        percRangeHalfTIcons.format.horizontalAlignment = Excel.HorizontalAlignment.center;
        percRangeHalfTIcons.format.font.size = 15;
        percRangeHalfTIcons.format.font.name = "Arial";
        percRangeHalfTIcons.format.rowHeight = 15;

        percRangeHalfTIcons.values = [match_percentage_list.slice(1).map((v) => (v ? Strings.halfT : ""))];
        percRange.values = [match_percentage_list.slice(1)];
        percRangeArrowIcons.values = [match_percentage_list.slice(1).map((v) => (v ? Strings.arrowDown : ""))];

        sheet.getRange(`${AlphabetsEnumerator.C}4:${lastCellAddress}4`).values = [result_list.slice(1)];
        //paste formulas in all other cells

        sheet.getRange("C5").values = [
          [
            `=IF(LEN(IFERROR(VLOOKUP($B5,${activeTempWorksheetTableName}[#All],IFERROR(HLOOKUP('${activeWorksheetStagingArea}'!C$4,${activeTempWorksheetTableName}[#All],2,FALSE), ""),FALSE),""))=0,"",IFERROR(VLOOKUP($B5,${activeTempWorksheetTableName}[#All],IFERROR(HLOOKUP('${activeWorksheetStagingArea}'!C$4,${activeTempWorksheetTableName}[#All],2,FALSE), ""),FALSE),""))`,
          ],
        ];
        sheet.getRange("C6:C9").copyFrom("C5");
        sheet.getRange(`D5:${lastCellAddress}9`).copyFrom("C5");
        sheet.getRange("A1").values = [["'"]];

        // C13 range for formulas
        let row13FormulaTable: Excel.Range = sheet.getRange(`B13:${lastCellAddress}13`);
        row13FormulaTable.format.fill.color = AppColors.primary_light_blue;
        row13FormulaTable.format.font.color = AppColors.primacy_black;
        row13FormulaTable.format.font.size = 12;
        row13FormulaTable.format.font.bold = true;

        //add the title 'STAGING AREA' for the Staging table in cell B14
        let StagingTitle: Excel.Range = sheet.getRange(`${AlphabetsEnumerator.B}14`);
        StagingTitle.format.fill.color = "#4472C4";
        StagingTitle.format.font.color = AppColors.primacy_white;
        StagingTitle.format.font.size = 32;
        StagingTitle.values = [["STAGING AREA"]];

        //merge the Staging Table Title across all columns
        let MgdStagingTitle: Excel.Range = sheet.getRange(`${AlphabetsEnumerator.B}14:${lastCellAddress}14`);
        MgdStagingTitle.merge(true);
        MgdStagingTitle.format.fill.color = "#4472C4";
        MgdStagingTitle.format.font.color = AppColors.primacy_white;
        MgdStagingTitle.format.font.size = 32;

        //add the Staging table & name it
        let StagingTable: Excel.Table = sheet.tables.add(
          `${AlphabetsEnumerator.A}15:${lastCellAddress}15`,
          false /*hasHeaders*/
        );
        StagingTable.name = activeWorksheetStagingAreaTableName;
        let StagingTableRange: Excel.Range = sheet.getRange(`${AlphabetsEnumerator.A}15:${lastCellAddress}15`);
        StagingTableRange.format.font.size = 14;

        // add column headers for the Staging table
        const tableColumns = ['Flag'].concat(StagingColumns?.map(column => column.display_name || column.column_name));
        StagingTable.getHeaderRowRange().values = [
          [...tableColumns],
        ];
        sheet.getRange("C16").values = [
          [
            `=IF(C$13="",IF(LEN(IFERROR(VLOOKUP($B16,${activeTempWorksheetTableName}[#All],IFERROR(HLOOKUP('${activeWorksheetStagingArea}'!C$4,${activeTempWorksheetTableName}[#All],2,FALSE), ""),FALSE),""))=0,"",IFERROR(VLOOKUP($B16,${activeTempWorksheetTableName}[#All],IFERROR(HLOOKUP('${activeWorksheetStagingArea}'!C$4,${activeTempWorksheetTableName}[#All],2,FALSE), ""),FALSE),"")),C$13)`,
          ],
        ];
        sheet.getRange(`D16:${staging_last_cell.address.split("!")[1].slice(0, 2)}16`).copyFrom("C16");

        // Formula paste logic divided into chunks
        const sliceAddress: string = staging_last_cell.address.split('!')[1];
        const actual: string[] = sliceAddress.match(/[a-zA-Z]+|[0-9]+/g);
        for (const rowsChunk of chunks) {
          const dynamicRange: string = `C${rowsChunk.start}:${actual[0]}${rowsChunk.end}`;
          const startRow: number = rowsChunk.start - 16;
          const endRow: number = rowsChunk.end - 15;

          sheet.getRange(`B${startRow + 15}:B${endRow + 15}`).values = Array.from({ length: endRow - startRow + 1 }, (_, i) => [i + startRow]);
          sheet.getRange(dynamicRange).copyFrom("C16");
          sheet.getRange(dynamicRange).copyFrom(sheet.getRange(dynamicRange), Excel.RangeCopyType.values);
        }
        // Formula paste logic divided into chunks END
        await context.sync();

        if (Office.context.requirements.isSetSupported("ExcelApi", "1.2")) {
          sheet.getUsedRange().format.autofitColumns();
          sheet.getUsedRange().format.autofitRows();
        }

        const stagingTable: Excel.Table = sheet.tables.getItem(activeWorksheetStagingAreaTableName);
        stagingTable.rows.load(ExcelLoadEnumerator.items);
        stagingTable.columns.load(ExcelLoadEnumerator.items);
        const sheets_name = sheets.load(ExcelLoadEnumerator.items_name);
        await context.sync();

        sheet.getRange(
          `C4:${lastCellAddress}4`
        ).dataValidation.rule = {
          list: {
            inCellDropDown: true,
            source: selectedRawColumns.map((c) => c.toString()).toString(),
          },
        };

        const conditionalFormatBorders: Excel.ConditionalFormat = temprange.conditionalFormats.add(
          Excel.ConditionalFormatType.presetCriteria
        );

        // Border every cell's that is not blank in the range.
        CommonMethods.setRangeBorders(conditionalFormatBorders.preset, AppColors.primacy_black);
        conditionalFormatBorders.preset.rule = {
          criterion: Excel.ConditionalFormatPresetCriterion.nonBlanks,
        };

        await adjustColorGradients(undefined, sheetName);        

        sheet.onChanged.add((e) => stagingAreaSheetOnChanged(e, sheetName));
        stagingTable.getDataBodyRange().getLastRow().delete(Excel.DeleteShiftDirection.up);

        await tryCatch(unmappedcolumn(false, false, sheetName, undefined));
        
        toast.success("Staging Area sheet has been successfully created.");
        store.dispatch(setLoader(false));
        store.dispatch(setStopwatch("stop"));

        await tryCatch(onConfirmData(false));
        store.dispatch(setSheetChanged());

        // Staging Table color scheme / date format added
        for(const column of StagingColumns) {
          const headerRange: Excel.Range = stagingTable.columns.getItem(column.display_name).getHeaderRowRange().load(ExcelLoadEnumerator.address);
          const bodyRange: Excel.Range = stagingTable.columns.getItem(column.display_name).getDataBodyRange().load(ExcelLoadEnumerator.address);
          await context.sync();
    
          if (column.display_name.includes("Date") || column.display_name.includes("Reporting Month")) {
            const sliceAddress: string = bodyRange.address.split('!')[1];
            const actual: string[] = sliceAddress.match(/[a-zA-Z]+|[0-9]+/g);
            bodyRange.numberFormat = [["[$-409]mm/dd/yyyy"]];
            sheet.getRange(`${actual[0]}5:${actual[0]}9`).numberFormat = [["[$-409]mm/dd/yyyy"]];
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
        
        tryCatch(stateCityColumnsValuesMap(sheetName));

        NetworkCalls.userActivityLog({
          row_count: stagingTable.rows.count - 1,
          column_count: stagingTable.columns.count - 1,
          sheet_name: activeWorksheetStagingArea,
          workbook_name: global.workbookName,
          sheets_name: sheets_name.items.map(c => c.name).toString()
        });

        const activePreference = await NetworkCalls.getActiveUserPreference();
        tryCatch(adjustPreferenceStagingConstants(activePreference?.data[0] ?? {}));
        store.dispatch(setLatestUserProfile(activePreference?.data[0]));
      });
    }
    catch (error) {
      store.dispatch(setLoader(false));
      store.dispatch(setStopwatch("stop"));
    }
}

var debouncedRender = _.debounce(async function (
  event: Excel.WorksheetChangedEventArgs,
  sheetName: string
) {
  const triggerSource: boolean = event.triggerSource !== "ThisLocalAddin";
  const actual: string[] = event.address.match(/[a-zA-Z]+|[0-9]+/g);

  if (triggerSource) {
    if ([4, 13].includes(parseInt(actual[1]))) {
      await formulaPasteUnPasteWhileChangeMappings(event, sheetName);
    }
    await unmappedcolumn(
      true,
      parseInt(actual[1]) === 4,
      sheetName,
      event
    );
    await stateCityColumnsValuesMap(sheetName);    
    await reCalculate(event, sheetName);
  }
},
200); // Adjust the debounce delay as needed

async function stagingAreaSheetOnChanged(
  event: Excel.WorksheetChangedEventArgs,
  sheetName: string,
): Promise<Excel.WorksheetChangedEventArgs> {  
  debouncedRender(event, sheetName);
  return event;
}

export async function reCalculate(eventArgs, sheetName: string): Promise<void> {
  store.dispatch(setSheetChanged());
  const { activeWorksheetStagingArea, activeWorksheetStagingAreaTableName } = CommonMethods.getActiveWorkSheetAndTableName(sheetName);
  await Excel.run(async (context: Excel.RequestContext) => {
    // get staging area sheet and staging table, and sync context
    let sheet: Excel.Worksheet = context.workbook.worksheets.getItem(activeWorksheetStagingArea);
    let table: Excel.Table = sheet.tables
      .getItem(activeWorksheetStagingAreaTableName)
      .load(ExcelLoadEnumerator.columns)
      .load(ExcelLoadEnumerator.columnCount)
      .load(ExcelLoadEnumerator.rows);
    await context.sync();

    // get total columns count and then get last column address
    let colLength: number = table.columns.count;
    const totalTableRows: number = table.rows.count;
    let staging_last_cell: Excel.Range = sheet.getCell(1, colLength).load(ExcelLoadEnumerator.address);
    await context.sync();

    let lastAddrs: string = CommonMethods.columnAddressSlice(staging_last_cell.address, 2);
    let mapped_columns_range: Excel.Range = sheet
      .getRange(`C4:${lastAddrs}4`)
      .load(ExcelLoadEnumerator.values)
      .load(ExcelLoadEnumerator.columnCount);
    await context.sync();

    const countArray: number[] = [];
    for (let i = 1; i <= totalTableRows; i++) {
      countArray.push(i);
    }

    // get mapped columns values
    const mappedValues = [...mapped_columns_range.values];

    let letter: string = AlphabetsEnumerator.B;
    // construct column addresses
    let mapped = [..._.range(mapped_columns_range.columnCount)].map((_) => {
      let lastTwo = letter.slice(-2);
      if (lastTwo.length > 1) {
        lastTwo[lastTwo.length - 1] === "Z";
        if (lastTwo[lastTwo.length - 1] === "Z") {
          let a = CommonMethods.nextChar(lastTwo[lastTwo.length - 2]);
          letter = `${a}@`;
        }
      } else {
        if (letter[letter.length - 1] === "Z") letter = "A@";
      }
      let _nextChar = CommonMethods.nextChar(letter);
      letter = `${_nextChar}`;
      return `${_nextChar}4`;
    });

    // get sheet data changes details and address of the changed location
    let details = eventArgs.details;
    let address = eventArgs.address;
    const idx: number = mapped.indexOf(`${address}`);

    let prevPercent;
    // if newly mapped column is already mapped in any other column then clear it

    if (details) {
      const newValues = mappedValues[0].map((item, index) => {
        if (item === details.valueAfter && index !== idx && idx !== -1) {
          prevPercent = `${mapped[index]}`.split(/[0-9]/g);
          return "";
        } else {
          return item;
        }
      });

      // move related match percentage details above newly mapped column
      if (JSON.stringify(newValues) !== JSON.stringify(mappedValues[0]) && prevPercent) {
        mapped_columns_range.values = [newValues];
        sheet.getRange(`${prevPercent[0]}5:${prevPercent[0]}9`).values = [[""], [""], [""], [""], [""]];
        sheet.getRange(`${prevPercent[0]}10:${prevPercent[0]}12`).values = [[""], [""], [""]];
        sheet.getRange(`${prevPercent[0]}10:${prevPercent[0]}12`).format.fill.color = AppColors.primacy_white;
        sheet.getRange(`${prevPercent[0]}16:${prevPercent[0]}${totalTableRows + 16 - 1}`).values = countArray.map(
          () => [""]
        );
      }
    }
  });
}

export async function onTrainAI(
  sheetName: string,
  template_type: string,
): Promise<void> {

  store.dispatch(setLoader(true));
  
  const { activeTempWorksheet, activeWorksheetStagingAreaTableName, activeWorksheetStagingArea } = CommonMethods.getActiveWorkSheetAndTableName(sheetName);

  try {
    await Excel.run(async (context: Excel.RequestContext) => {
      // get staging area sheet and staging table and sync the context
      let sheet: Excel.Worksheet = context.workbook.worksheets.getItem(activeWorksheetStagingArea).load(ExcelLoadEnumerator.name);
      let stagingTable: Excel.Table = sheet.tables
        .getItem(activeWorksheetStagingAreaTableName)
        .load(ExcelLoadEnumerator.columns)
        .load(ExcelLoadEnumerator.columnCount);
      await context.sync();

      // get TempData sheet and sync the context
      let temp_sheet: Excel.Worksheet = context.workbook.worksheets.getItem(activeTempWorksheet);
      let raw_sov_columns_range: Excel.Range = temp_sheet.getUsedRange().load(ExcelLoadEnumerator.values);
      await context.sync();

      // get the staging table coumn count to get last cell address
      let colLength: number = stagingTable.columns.count;
      let staging_last_cell = sheet.getCell(1, colLength);
      staging_last_cell.load(ExcelLoadEnumerator.address);
      await context.sync();
      
      // get mapped coloumns from sourcedata and staging table columns
      let mapped_columns_range: Excel.Range = sheet.getRange(
        `C4:${CommonMethods.columnAddressSlice(staging_last_cell.address, 2)}4`
      );
      mapped_columns_range.load(ExcelLoadEnumerator.values);
      let staging_columns_range: Excel.Range = sheet.getRange(
        `C15:${CommonMethods.columnAddressSlice(staging_last_cell.address, 2)}15`
      );
      staging_columns_range.load(ExcelLoadEnumerator.values);
      await context.sync();

      // store user's manuall mappings in the database by sending these mapped columns to the server
      await NetworkCalls.onTrainAI({
        mapped_columns: mapped_columns_range.values.flat(1),
        staging_columns: staging_columns_range.values.flat(1),
        all_source_column_range: raw_sov_columns_range.values[0].slice(1),
        template_type
      })
      .then((response) => {
        if (response.status === API_UNAUTHORISED) {
          store.dispatch(setLoader(false));
          store.dispatch(setManualMapped(false));
        } else {
          toast.success("Mappings learned.");
          store.dispatch(setLoader(false));
          store.dispatch(setManualMapped(true));
        }
      })
      .catch(() => {
        store.dispatch(setLoader(false));
        store.dispatch(setManualMapped(false));
      });

      await context.sync();

      tryCatch(adjustColorGradients(AppColors.primacy_green, sheetName));
    });
  }
  catch (err) {
    store.dispatch(setLoader(false));
    store.dispatch(setManualMapped(false));
  }
}

export async function exportCurrentSheetToCSV(): Promise<void> {
  store.dispatch(setLoader(true));
  
  try {
    const obj: {workbook_name: string, sheet_name: string, headers: string[], rows: any[][]} = await Excel.run(async (context: Excel.RequestContext) => {
      let workbook: Excel.Workbook = context.workbook;
      workbook.load(ExcelLoadEnumerator.name);

      const sheets: Excel.WorksheetCollection = workbook.worksheets;
      const activeSheet: Excel.Worksheet = sheets.getActiveWorksheet().load(ExcelLoadEnumerator.name);
      await context.sync();

      const activeWorksheetStagingAreaTableName: string = CommonMethods.getActiveSheetTableName(activeSheet.name);
      const stagingSheet: Excel.Worksheet = sheets.getItem(activeSheet.name);
      const stagingTable: Excel.Table = stagingSheet.tables.getItem(activeWorksheetStagingAreaTableName);
      await context.sync();

      const headers = stagingTable.getHeaderRowRange().load(ExcelLoadEnumerator.values);
      const body = stagingTable.getDataBodyRange().load(ExcelLoadEnumerator.values);
      await context.sync();

      const dateColumnIndexes: number[] = headers.values[0].map((h, ind) => h.includes("Date") ? ind : undefined).filter((f) => f);

      const result = {
        headers: headers.values[0],
        rows: CommonMethods.findDateColumnsAndModifyForExports(
          dateColumnIndexes,
          body.values
        ),
        sheet_name: activeSheet.name,
        workbook_name: workbook.name,
      };
    
      return result;
    });

    NetworkCalls.exportToCsv(obj).then((res) => {
      const finalUrl: string = process.env.REACT_APP_BASE_URL + res.data?.file_url;
      window.open(finalUrl);
      toast.success("Your requested file is successfully downloaded!");
      store.dispatch(setLoader(false));
    }).catch(() => {
      toast.error("Unable to download file.");
    });
  }
  catch (err) {
    store.dispatch(setLoader(false));
  }
  
}

export async function mergeStagingAreas(): Promise<void> {
  store.dispatch(setLoader(true));
  try {
    await Excel.run(async (context: Excel.RequestContext) => {
      // get staging area sheet and staging table and sync the context
      let sheets: Excel.WorksheetCollection = context.workbook.worksheets;
      sheets.load(ExcelLoadEnumerator.items_name);
      await context.sync();

      const finalStagingSheetName: string = global.selectedSheet + " Final Staging Area";
      const stagingSheetsNames: string[] = sheets.items.map(sheet => sheet.name).filter(f => f.includes("Staging Area"));

      const firstStagingAreaSheet = sheets.getItem(stagingSheetsNames[0]);
      let finalStagingSheet: Excel.Worksheet = sheets.getItemOrNullObject(finalStagingSheetName);
      await context.sync();

      const usedRangeFirstStagingAreaSheet: Excel.Range = firstStagingAreaSheet.getUsedRange().load(ExcelLoadEnumerator.address);

      if (!finalStagingSheet.isNullObject) {
        finalStagingSheet.delete();
      }
      finalStagingSheet = sheets.add(finalStagingSheetName);
      finalStagingSheet.activate();
      await context.sync();

      const destination = finalStagingSheet.getRange(usedRangeFirstStagingAreaSheet.address.split('!')[1]);
      await context.sync();

      destination.copyFrom(usedRangeFirstStagingAreaSheet, Excel.RangeCopyType.all);
      destination.format.autofitColumns();
      destination.format.autofitRows();
      await context.sync();

      let lastRowAddress: string = "";
      for (const name of stagingSheetsNames.slice(1).filter(f => f !== finalStagingSheetName)) {
        const loopSheet: Excel.Worksheet = sheets.getItem(name);
        const lastRowOfLoopSheet = loopSheet.getUsedRange().getLastRow().load(ExcelLoadEnumerator.address);
        await context.sync();

        const loopSheetUsedRange: Excel.Range = loopSheet.getRange(`A16:${lastRowOfLoopSheet.address.split(':')[1]}`)
        .load(ExcelLoadEnumerator.rowCount).load(ExcelLoadEnumerator.columnCount)
        .load(ExcelLoadEnumerator.address).load(ExcelLoadEnumerator.values);
        await context.sync();

        const targetRange = finalStagingSheet.getUsedRange().getRowsBelow(loopSheetUsedRange.rowCount).load(ExcelLoadEnumerator.address);
        targetRange.load(ExcelLoadEnumerator.values);
        await context.sync();

        targetRange.values = loopSheetUsedRange.values;
        lastRowAddress = targetRange.address;
        await context.sync();
      }

      const sliceAddress: string = lastRowAddress.split('!')[1];
      const actual: string[] = sliceAddress.match(/[a-zA-Z]+|[0-9]+/g);
      const getIdRange: Excel.Range = finalStagingSheet.getRange(`B16:B${actual[3]}`).load(ExcelLoadEnumerator.values);
      await context.sync();

      getIdRange.values = getIdRange.values.flat(1).map((_, i) => [i + 1]);
      destination.format.autofitColumns();
      destination.format.autofitRows();

      await context.sync();

      toast.success("Staging Area sheets merged successfully!");
      store.dispatch(setLoader(false));
      store.dispatch(setSheetChanged());
    });
  }
  catch (err) {
    store.dispatch(setLoader(false));
  }
}
