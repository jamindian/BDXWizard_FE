import { toast } from "react-toastify";
import CommonMethods from "@taskpaneutilities/CommonMethods";
import { AlphabetsEnumerator, ExcelLoadEnumerator } from "@taskpaneutilities/Enum";
import { adjustColorGradients, formulaPasteUnPasteWhileChangeMappings, onConfirmData, setStagingAreaColorSchemes, tryCatch, unmappedcolumn } from "@taskpaneutilities/Helpers";
import _ from "lodash";
import { API_UNAUTHORISED, AppColors, Strings } from "@taskpaneutilities/Constants";
import { IStagingAreaColumn } from "@taskpaneutilities/Interface";
import NetworkCalls from "../services/ApiNetworkCalls";
import { store } from "@redux/Store";
import { setLoader, setManualMapped, setStopwatch } from "@redux/Actions/Auth";

export async function onCleanSOV(isClaimActive: boolean, sheetName: string, batchSize: number): Promise<void> {
  store.dispatch(setLoader(true));
  store.dispatch(setStopwatch("start"));

  const { activeTempWorksheet, activeTempWorksheetTableName } = CommonMethods.getActiveWorkSheetAndTableName(sheetName);
  await Excel.run(async (context: Excel.RequestContext) => {
    let workbook: Excel.Workbook = context.workbook;
    workbook.load(ExcelLoadEnumerator.name);
    workbook.load(ExcelLoadEnumerator.protection_protected);

    let sheets: Excel.WorksheetCollection = workbook.worksheets;
    sheets.load(ExcelLoadEnumerator.items_name);
    await context.sync();

    if (workbook.protection.protected) {
      workbook.protection.unprotect("");
    }

    const raw_sov_range: Excel.Range = workbook.getSelectedRange().load(ExcelLoadEnumerator.values);
    raw_sov_range.load(ExcelLoadEnumerator.address);
    raw_sov_range.load(ExcelLoadEnumerator.columnCount);
    raw_sov_range.load(ExcelLoadEnumerator.rowCount);
    await context.sync();

    // add new tab called TempData
    let sheet: Excel.Worksheet = workbook.worksheets.getItemOrNullObject(
      activeTempWorksheet
    );
    await context.sync();

    global.workbookName = workbook.name?.split(".")[0];

    if (!sheet.isNullObject) {
      sheet.delete();
    }
    sheet = sheets.add(activeTempWorksheet);

    // activate newly added tab
    sheet = context.workbook.worksheets.getItem(activeTempWorksheet);
    sheet.activate();
    await context.sync();

    store.dispatch(setManualMapped(false));

    CommonMethods.removeLocalStorage("lengthdele");
    CommonMethods.setLocalStorage("column_count", raw_sov_range.columnCount.toString());
    CommonMethods.setLocalStorage("row_count", raw_sov_range.rowCount.toString());
    await context.sync();

    sheet.getRange("B2").copyFrom(raw_sov_range, Excel.RangeCopyType.values);
    sheet.getRange("A2").values = [["ID"]];
    let last_cell = sheet.getCell(1, raw_sov_range.columnCount).load(ExcelLoadEnumerator.address);
    let end_cell = sheet.getCell(raw_sov_range.rowCount, raw_sov_range.columnCount).load(ExcelLoadEnumerator.address);
    await context.sync();

    let sheet_header: Excel.Range = sheet.getRange("A2:" + last_cell.address).load(ExcelLoadEnumerator.values);
    sheet_header.load(ExcelLoadEnumerator.address);
    sheet_header.load(ExcelLoadEnumerator.rowCount);
    sheet_header.load(ExcelLoadEnumerator.columnCount);
    await context.sync();

    const first_row: Excel.Range = sheet
      .getRange(`A1:${last_cell.address.split("!")[1].match(/[a-zA-Z]+|[0-9]+/g)[0]}1`)
      .load(ExcelLoadEnumerator.values)
      .load(ExcelLoadEnumerator.address);
    await context.sync();
    first_row.values = [sheet_header.values[0]];

    for (let i = 3; i < raw_sov_range.rowCount + 2; i++) {
      sheet.getRange(AlphabetsEnumerator.A + i.toString()).values = [[i - 2]];
      sheet.getRange(AlphabetsEnumerator.A + i.toString()).numberFormat = [["#"]];
    }

    var list = [];
    for (var i = 2; i <= raw_sov_range.columnCount + 1; i++) {
      list.push(i);
    }

    sheet.getRange("B2:" + last_cell.address).clear();
    sheet.getRange("B2:" + last_cell.address).values = [list];
    sheet.getRange("B2:" + last_cell.address).numberFormat = [["#"]];
    sheet.getRange("B2:" + last_cell.address).load(ExcelLoadEnumerator.values);
    sheet.getRange("B2:" + last_cell.address).load(ExcelLoadEnumerator.address);
    sheet.getRange("B2:" + last_cell.address).load(ExcelLoadEnumerator.rowCount);

    // Convert the range to a table.
    let tempTable: Excel.Table = sheet.tables.add("A1:" + end_cell.address, true);
    tempTable.name = activeTempWorksheetTableName;
    sheet.visibility = Excel.SheetVisibility.hidden;
    sheet.getUsedRange().format.autofitColumns();
    sheet.getUsedRange().format.autofitRows();
    await context.sync();

    const slice: { start: number; end: number }[] = [];
    const loopTermision: number = raw_sov_range.rowCount > (batchSize+1) ? Math.ceil(raw_sov_range.rowCount / batchSize) : raw_sov_range.rowCount;
    for (let i = 0; i < loopTermision; i++) {
      if (i === 0) {
        slice.push({ start: i + 1, end: batchSize });
      } else {
        slice.push({
          start: slice[i - 1].end + 1,
          end: (slice[i - 1].end + batchSize) < raw_sov_range.rowCount ? (slice[i - 1].end + batchSize) : raw_sov_range.rowCount,
        });
      }
    }

    await tryCatch(createStagingArea(isClaimActive, sheetName, raw_sov_range.values[0]));
  });
}

// function to create statging area sheet and table
export async function createStagingArea(isClaimActive: boolean, sheetName: string, selectedRawColumns: string[]): Promise<void> {
    const { activeWorksheetStagingArea, activeWorksheetStagingAreaTableName, activeTempWorksheet, activeTempWorksheetTableName } = CommonMethods.getActiveWorkSheetAndTableName(sheetName);
    try {
      await Excel.run(async (context: Excel.RequestContext) => {
        let sheets: Excel.WorksheetCollection = context.workbook.worksheets;

        // get staging area sheet and sync the context
        let sheet: Excel.Worksheet = sheets.getItemOrNullObject(activeWorksheetStagingArea);
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

        // get TempData sheet and sync the context
        let temp_sheet: Excel.Worksheet = sheets.getItem(activeTempWorksheet);
        let last_header_cell = temp_sheet
          .getCell(0, parseInt(CommonMethods.getLocalStorage("column_count")))
          .load(ExcelLoadEnumerator.address);
        await context.sync();

        let raw_sov_columns_range: Excel.Range = temp_sheet
          .getRange("B1:" + last_header_cell.address)
          .load(ExcelLoadEnumerator.address);
        raw_sov_columns_range.load(ExcelLoadEnumerator.values);
        await context.sync();

        let result_list = [];
        let match_percentage_list = [];
        const columnsResponse = isClaimActive ? await NetworkCalls.getStagingAreaColumnsForClaims() : await NetworkCalls.getStagingAreaColumnsForPremium();
        const StagingColumns: IStagingAreaColumn[] = columnsResponse?.data ?? [];
        
        // get map percentage list
        await NetworkCalls.OnMapColumns({ source_columns: selectedRawColumns.map((c) => c.toString()), category: isClaimActive ? "Claims" : "Premium" })
          .then((response) => {
            if (response.status === API_UNAUTHORISED) {} else {
              result_list = response.data.result_list;
              match_percentage_list = response.data.match_percentage_list;
              match_percentage_list = match_percentage_list.map((item: any) =>
                item && typeof item !== "string" ? `${item / 100}` : item
              );
              CommonMethods.setLocalStorage("result_list", JSON.stringify(result_list));
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
        sheet.getRange(`${AlphabetsEnumerator.B}4:${lastCellAddress}4`).format.fill.color = AppColors.primary_light_blue;
        sheet.getRange(`${AlphabetsEnumerator.B}4:${lastCellAddress}4`).format.font.color = AppColors.primacy_black;
        sheet.getRange(`${AlphabetsEnumerator.B}4:${lastCellAddress}4`).format.font.size = 14;
        sheet.getRange(`${AlphabetsEnumerator.B}4:${lastCellAddress}4`).format.font.bold = true;

        //add 'ID' as the header name in cell B4 and enter the first 5 IDs as 1 to 5
        sheet.getRange("B5").values = [["1"]];
        sheet.getRange("B6").values = [["=B5 + 1"]];
        sheet.getRange("B7").values = [["=B6 + 1"]];
        sheet.getRange("B8").values = [["=B7 + 1"]];
        sheet.getRange("B9").values = [["=B8 + 1"]];

        sheet.getRange("B5").numberFormat = [["#"]];
        sheet.getRange("B6").numberFormat = [["#"]];
        sheet.getRange("B7").numberFormat = [["#"]];
        sheet.getRange("B8").numberFormat = [["#"]];
        sheet.getRange("B9").numberFormat = [["#"]];

        // Percentages section
        let percRangeHalfTIcons: Excel.Range = sheet
          .getRange(`C10:${lastCellAddress}10`)
          .load(ExcelLoadEnumerator.values);
        let percRange: Excel.Range = sheet.getRange(`C11:${lastCellAddress}11`).load(ExcelLoadEnumerator.values);
        let percRangeArrowIcons: Excel.Range = sheet
          .getRange(`C12:${lastCellAddress}12`)
          .load(ExcelLoadEnumerator.values);
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
        let raw_sov_row_count = CommonMethods.getLocalStorage("row_count");
        let rawdel = CommonMethods.getLocalStorage("lengthdele");
        let finalrows = rawdel ? rawdel : raw_sov_row_count;

        sheet.getRange("C16").values = [
          [
            `=IF(C$13="",IF(LEN(IFERROR(VLOOKUP($B16,${activeTempWorksheetTableName}[#All],IFERROR(HLOOKUP('${activeWorksheetStagingArea}'!C$4,${activeTempWorksheetTableName}[#All],2,FALSE), ""),FALSE),""))=0,"",IFERROR(VLOOKUP($B16,${activeTempWorksheetTableName}[#All],IFERROR(HLOOKUP('${activeWorksheetStagingArea}'!C$4,${activeTempWorksheetTableName}[#All],2,FALSE), ""),FALSE),"")),C$13)`,
          ],
        ];

        for (let i = 1; i < parseInt(finalrows); i++) {
          sheet.getRange("B" + (i + 15).toString()).values = [[i]];
          sheet.getRange("B" + (i + 15).toString()).numberFormat = [["#"]];
        }

        sheet.getRange(`C17:C${(parseInt(raw_sov_row_count) + 14).toString()}`).copyFrom("C16");
        sheet
          .getRange(
            `D16:${staging_last_cell.address.split("!")[1].slice(0, 2)}` + (parseInt(raw_sov_row_count) + 14).toString()
          )
          .copyFrom("C16");
        await context.sync();

        if (Office.context.requirements.isSetSupported("ExcelApi", "1.2")) {
          sheet.getUsedRange().format.autofitColumns();
          sheet.getUsedRange().format.autofitRows();
        }

        const updatearray = raw_sov_columns_range.values[0];
        const finalupdate = [...updatearray];
        const length: number = finalupdate.length;
        finalupdate.map((item, index) => (temp_sheet.getRange("PP" + (index + 2).toString()).values = [[item]]));
        const stagingTable: Excel.Table = sheet.tables.getItem(activeWorksheetStagingAreaTableName);
        let visibleRange = stagingTable.getDataBodyRange().getVisibleView();
        await context.sync();

        const raw_with_emty: Excel.Range = temp_sheet.getRange("PP1:PP" + (length + 1).toString());

        sheet.load(ExcelLoadEnumerator.rows);
        sheet.load(ExcelLoadEnumerator.rowCount);
        visibleRange.load(ExcelLoadEnumerator.values);
        visibleRange.load(ExcelLoadEnumerator.address);
        visibleRange.load(ExcelLoadEnumerator.rowCount);
        visibleRange.load(ExcelLoadEnumerator.columnCount);
        visibleRange.load(ExcelLoadEnumerator.columns);
        sheet.activate();
        await context.sync();

        sheet.getRange(
          `C4:${lastCellAddress}4`
        ).dataValidation.rule = {
          list: {
            inCellDropDown: true,
            source: raw_with_emty,
          },
        };

        // fetch row 11 range
        const temprange: Excel.Range = sheet.getRange(`C11:${lastCellAddress}11`);
        await context.sync();
        temprange.format.font.bold = true;

        const conditionalFormatBorders: Excel.ConditionalFormat = temprange.conditionalFormats.add(
          Excel.ConditionalFormatType.presetCriteria
        );

        // Border every cell's that is not blank in the range.
        CommonMethods.setRangeBorders(conditionalFormatBorders.preset, AppColors.primacy_black);
        conditionalFormatBorders.preset.rule = {
          criterion: Excel.ConditionalFormatPresetCriterion.nonBlanks,
        };

        await adjustColorGradients(undefined, sheetName);

        sheet.onChanged.add((e) => stagingAreaSheetOnChanged(e, false, sheetName));
        stagingTable.onChanged.add((e: Excel.TableChangedEventArgs) => stagingTableOnChange(e, sheetName));

        await setStagingAreaColorSchemes(isClaimActive);

        let tablerows: Excel.TableRowCollection = stagingTable.rows;
        tablerows.load(ExcelLoadEnumerator.items);
        await context.sync();

        for (let i = 0; i < tablerows.items.length; i++) {
          const find: any[] = tablerows.items[i].values[0];
          if (!find.length || !find[1]) {
            const row = tablerows.getItemAt(i);
            row.delete();
          }
        }

        await tryCatch(unmappedcolumn(false, undefined, undefined, false, sheetName));
        
        toast.success("Staging Area sheet has been successfully created.");
        store.dispatch(setLoader(false));

        if (Office.context.requirements.isSetSupported("ExcelApi", "1.2")) {
          sheet.getUsedRange().format.autofitColumns();
          sheet.getUsedRange().format.autofitRows();
        }

        await onConfirmData(false, sheetName);
        store.dispatch(setStopwatch("stop"));
      });
    }
    catch (error) {
      store.dispatch(setLoader(false));
      store.dispatch(setStopwatch("stop"));
    }
}

var debouncedRender = _.debounce(function (
  event: Excel.WorksheetChangedEventArgs,
  unMappedViaAddRisk: boolean,
  sheetName: string
) {
  const triggerSource: boolean = event.triggerSource !== "ThisLocalAddin";

  Excel.run(async (context: Excel.RequestContext) => {
    if (triggerSource && !unMappedViaAddRisk) {
      await formulaPasteUnPasteWhileChangeMappings(event, sheetName);
      const actual: string[] = event.address.match(/[a-zA-Z]+|[0-9]+/g);
      const containsM: boolean = parseInt(actual[1]) === 4 && event.details?.valueBefore !== event.details.valueAfter;      
      await unmappedcolumn(
        true,
        JSON.parse(CommonMethods.getLocalStorage("autoMappedRawColumns")),
        JSON.parse(CommonMethods.getLocalStorage("autoMappedStagingColumns")),
        parseInt(actual[1]) === 4,
        sheetName,
        containsM ? event.address : ""
      );
    }

    // await reCalculate(event, sheetName);

    return context.sync();
  }).catch(function () {
    store.dispatch(setLoader(false));
  });
},
750); // Adjust the debounce delay as needed

async function stagingAreaSheetOnChanged(
  event: Excel.WorksheetChangedEventArgs,
  unMappedViaAddRisk: boolean,
  sheetName: string
): Promise<Excel.WorksheetChangedEventArgs> {
  debouncedRender(event, unMappedViaAddRisk, sheetName);
  return event;
}

export async function stagingTableOnChange(e, sheetName: string) {
  await Excel.run(async () => {
    if (e.changeType === "RowDeleted" || e.changeType === "RowInserted") {
      reCalculate(e, sheetName);
    }
  });
}

export async function reCalculate(eventArgs, sheetName: string) {
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
        sheet.getRange(`${prevPercent[0]}16:${prevPercent[0]}${totalTableRows + 16 - 1}`).values = countArray.map(
          () => [""]
        );
      }
    }
  });
}

export async function onTrainAI(
  sheetName: string
) {

  store.dispatch(setLoader(true));
  
  const { activeTempWorksheet, activeWorksheetStagingAreaTableName } = CommonMethods.getActiveWorkSheetAndTableName(sheetName);
  try {
    await Excel.run(async (context: Excel.RequestContext) => {
      // get staging area sheet and staging table and sync the context
      let sheet: Excel.Worksheet = context.workbook.worksheets.getActiveWorksheet().load(ExcelLoadEnumerator.name);
      let stagingTable: Excel.Table = sheet.tables
        .getItem(activeWorksheetStagingAreaTableName)
        .load(ExcelLoadEnumerator.columns)
        .load(ExcelLoadEnumerator.columnCount);
      await context.sync();

      // get TempData sheet and sync the context
      let temp_sheet: Excel.Worksheet = context.workbook.worksheets.getItem(activeTempWorksheet);
      let last_header_cell = temp_sheet.getCell(0, parseInt(CommonMethods.getLocalStorage("column_count")));
      last_header_cell.load(ExcelLoadEnumerator.address);
      await context.sync();

      let raw_sov_columns_range: Excel.Range = temp_sheet.getRange("B1:" + last_header_cell.address);
      raw_sov_columns_range.load(ExcelLoadEnumerator.values).load(ExcelLoadEnumerator.address);
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
      let staging_columns_range: Excel.Range = sheet.getRange(
        `C15:${CommonMethods.columnAddressSlice(staging_last_cell.address, 2)}15`
      );
      await context.sync();

      mapped_columns_range.load(ExcelLoadEnumerator.values);
      staging_columns_range.load(ExcelLoadEnumerator.values);
      await context.sync();

      // store user's manuall mappings in the database by sending these mapped columns to the server
      await NetworkCalls.onTrainAI({
        mapped_columns: JSON.stringify(mapped_columns_range.values),
        staging_columns: JSON.stringify(staging_columns_range.values),
        all_source_column_range: JSON.stringify(raw_sov_columns_range.values),
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
