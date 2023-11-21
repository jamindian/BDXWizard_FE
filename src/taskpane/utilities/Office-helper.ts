import CommonMethods from "./CommonMethods";
import { AlphabetsEnumerator, ExcelLoadEnumerator } from "./Enum";

/** Default helper for invoking an action and handling errors. */
export async function tryCatch(callback) {
  try {
    await callback;
  } catch (error) {
    // Note: In a production add-in, you'd want to notify the user through your add-in's UI.
    console.error(error);
  }
}

export async function onLoadData(): Promise<void> {
  await Excel.run(async (context: Excel.RequestContext) => {
    let workbook: Excel.Workbook = context.workbook;
    workbook.load(ExcelLoadEnumerator.name);
    workbook.load(ExcelLoadEnumerator.protection_protected);
    await context.sync();

    if (workbook.protection.protected) {
      workbook.protection.unprotect("");
    }

    const raw_sov_range: Excel.Range = workbook.getSelectedRange();

    raw_sov_range.load(ExcelLoadEnumerator.values);
    raw_sov_range.load(ExcelLoadEnumerator.address);
    raw_sov_range.load(ExcelLoadEnumerator.columnCount);
    raw_sov_range.load(ExcelLoadEnumerator.rowCount);
    await context.sync();

    let sheets: Excel.WorksheetCollection = workbook.worksheets;
    sheets.load(ExcelLoadEnumerator.items_name);
    let activeWorkSheet = sheets.getActiveWorksheet().load(ExcelLoadEnumerator.name);

    // add new tab called TempData
    let sheet: Excel.Worksheet = workbook.worksheets.getItemOrNullObject(
      activeWorkSheet.name.split(" ").join("") + "TempData"
    );
    await context.sync();

    global.workbookName = workbook.name?.split(".")[0];

    if (!sheet.isNullObject) {
      sheet.delete();
    }
    sheet = sheets.add(activeWorkSheet.name.split(" ").join("") + "TempData");

    // activate newly added tab
    sheet = context.workbook.worksheets.getItem(activeWorkSheet.name.split(" ").join("") + "TempData");
    sheet.activate();

    CommonMethods.removeLocalStorage("lengthdele");
    CommonMethods.setLocalStorage("column_count", raw_sov_range.columnCount.toString());
    CommonMethods.setLocalStorage("row_count", raw_sov_range.rowCount.toString());
    await context.sync();

    sheet.getRange("B2").copyFrom(raw_sov_range, Excel.RangeCopyType.values);
    sheet.getRange("A2").values = [["ID"]];
    let last_cell = sheet.getCell(1, raw_sov_range.columnCount);
    last_cell.load(ExcelLoadEnumerator.address);
    let end_cell = sheet.getCell(raw_sov_range.rowCount, raw_sov_range.columnCount);
    end_cell.load(ExcelLoadEnumerator.address);
    await context.sync();

    let sheet_header: Excel.Range = sheet.getRange("A2:" + last_cell.address);
    sheet_header.load(ExcelLoadEnumerator.values);
    sheet_header.load(ExcelLoadEnumerator.address);
    sheet_header.load(ExcelLoadEnumerator.rowCount);
    sheet_header.load(ExcelLoadEnumerator.columnCount);
    await context.sync();

    const first_row: Excel.Range = sheet
      .getRange(`A1:${last_cell.address.split("!")[1].match(/[a-zA-Z]+|[0-9]+/g)[0]}1`)
      .load(ExcelLoadEnumerator.values);
    await context.sync();
    first_row.values = [sheet_header.values[0].map((h) => h?.slice(0, 250))];

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

    if (Office.context.requirements.isSetSupported("ExcelApi", "1.2")) {
      sheet.getUsedRange().format.autofitColumns();
      sheet.getUsedRange().format.autofitRows();
    }

    sheet.activate();

    // Convert the range to a table.
    let tempTable: Excel.Table = sheet.tables.add("A1:" + end_cell.address, true);
    tempTable.name = activeWorkSheet.name.split(" ").join("") + "TempTable";
    sheet.visibility = Excel.SheetVisibility.hidden;

    await context.sync();

    // tryCatch(createStagingArea(JSON.stringify(raw_sov_range.values)));
  });
}

// // function to create statging area sheet and table 
// export async function createStagingArea(raw_sov_data: string) {
//   try {
//     await Excel.run(async (context: Excel.RequestContext) => {
//         let sheets: Excel.WorksheetCollection = context.workbook.worksheets;

//         // get staging area sheet and sync the context
//         let sheet: Excel.Worksheet = sheets.getItemOrNullObject(STAGING_AREA_SHEET);
//         await context.sync();
        
//         // if  there is already a old staging area sheet available, delete it
//         if (!sheet.isNullObject) {
//             sheet.delete();
//         }
//         sheet = sheets.add(STAGING_AREA_SHEET);
//         // activate newly added tab
//         sheet = sheets.getItem(STAGING_AREA_SHEET);
//         sheet.activate();
//         sheet.tabColor = "#0292CF";

//         // get TempData sheet and sync the context
//         let temp_sheet: Excel.Worksheet = sheets.getItem(TEMP_DATA_SHEET);
//         let last_header_cell = temp_sheet.getCell(0, parseInt(CommonMethods.getLocalStorage("column_count")));
//         last_header_cell.load(ExcelLoadEnumerator.address);
//         await context.sync();

//         let raw_sov_columns_range: Excel.Range = temp_sheet.getRange("B1:" + last_header_cell.address);
//         raw_sov_columns_range.load(ExcelLoadEnumerator.values).load(ExcelLoadEnumerator.address);
//         await context.sync();

//         let result_list = [];
//         let match_percentage_list = [];
//         const _store: any = store.getState();
//         const StagingColumns: IStagingAreaColumns = _store.metadata.columns;

//         let argments: any = CommonMethods.rawSOVRangeIntoObjectValues(JSON.parse(raw_sov_data));
//         if (!withML) {
//             argments = {
//                 source_columns: JSON.stringify(raw_sov_columns_range.values),
//                 staging_columns: JSON.stringify(Object.values(StagingColumns).map((v: IColumnIdentify) => v.displayName).slice(1)),
//             }
//         }
          
//         // get map percentage list 
//         await OnMapColumns(argments, withML).then((response) => {
//             if (response.status === API_UNAUTHORISED) {
//                 store.dispatch(logout());
//             } else {
//                 result_list = response.data.result_list;
//                 match_percentage_list = response.data.match_percentage_list;
//                 match_percentage_list = match_percentage_list.map((item: any) => (item && typeof item !== 'string') ? `${item/100}` : item);
//                 CommonMethods.setLocalStorage("result_list", JSON.stringify(result_list));
//                 store.dispatch(setUserHitLoadData(Math.random()));
//             }
//         }).catch((err) => {
//             console.log(err);
//         });

//         let staging_last_cell = sheet.getCell(1, (result_list.length));
//         staging_last_cell.load(ExcelLoadEnumerator.address);
//         await context.sync();

//         const lastCellAddress: string = CommonMethods.columnAddressSlice(staging_last_cell.address, 2);

//         // to fill sheet with white
//         sheet.getRange(`A1:${lastCellAddress}14`).format.fill.color = AppColors.primacy_white;

//         // add the title 'SOURCE DATA SAMPLE' for the Location Table in cell B3
//         let LocTableTitle: Excel.Range = sheet.getRange(`${AlphabetsEnumerator.B}3`);
//         LocTableTitle.format.fill.color = "#4472C4";
//         LocTableTitle.format.font.color = AppColors.primacy_white;
//         LocTableTitle.format.font.size = 32;
//         LocTableTitle.values = [["SOURCE DATA SAMPLE"]];
        
//         //merge the Location Table Title across all columns
//         let MgdLocTableTitle: Excel.Range = sheet.getRange(`${AlphabetsEnumerator.B}3:${lastCellAddress}3`);
//         MgdLocTableTitle.merge(true);
//         MgdLocTableTitle.format.fill.color = "#4472C4";
//         MgdLocTableTitle.format.font.color = AppColors.primacy_white;
//         MgdLocTableTitle.format.font.size = 32;

//         // add an empty template for the Source Data Sample where 5 sample rows of the raw SOV data are to be displayed & name it
//         let SourceDataSampleTable: Excel.Range = sheet.getRange(`${AlphabetsEnumerator.B}4:${lastCellAddress}9`);
//         SourceDataSampleTable.format.fill.color = "#DDEBF7";
//         SourceDataSampleTable.format.font.color = AppColors.primacy_black;
//         SourceDataSampleTable.format.font.size = 12;            

//         //change formatting for the header row of the Source Data Sample Table B4
//         sheet.getRange(`${AlphabetsEnumerator.B}4:${lastCellAddress}4`).format.fill.color = AppColors.primary_light_blue;
//         sheet.getRange(`${AlphabetsEnumerator.B}4:${lastCellAddress}4`).format.font.color = AppColors.primacy_black;
//         sheet.getRange(`${AlphabetsEnumerator.B}4:${lastCellAddress}4`).format.font.size = 14;
//         sheet.getRange(`${AlphabetsEnumerator.B}4:${lastCellAddress}4`).format.font.bold = true;

//         //add 'ID' as the header name in cell B4 and enter the first 5 IDs as 1 to 5
//         sheet.getRange("B4").values = [["ID"]];
//         sheet.getRange("B5").values = [["1"]];
//         sheet.getRange("B6").values = [["=B5 + 1"]];
//         sheet.getRange("B7").values = [["=B6 + 1"]];
//         sheet.getRange("B8").values = [["=B7 + 1"]];
//         sheet.getRange("B9").values = [["=B8 + 1"]];

//         // TODO: SOV (SOV-Texcan Ventures $110 per sq ft) received from Palomar creating an issue. Random date is writing in this column.
//         sheet.getRange("B4").numberFormat = [["#"]];
//         sheet.getRange("B5").numberFormat = [["#"]];
//         sheet.getRange("B6").numberFormat = [["#"]];
//         sheet.getRange("B7").numberFormat = [["#"]];
//         sheet.getRange("B8").numberFormat = [["#"]];
//         sheet.getRange("B9").numberFormat = [["#"]];

//         // Percentages section
//         let percRangeHalfTIcons: Excel.Range = sheet.getRange(`B10:${lastCellAddress}10`).load(ExcelLoadEnumerator.values);
//         let percRange: Excel.Range = sheet.getRange(`B11:${lastCellAddress}11`).load(ExcelLoadEnumerator.values);
//         let percRangeArrowIcons: Excel.Range = sheet.getRange(`B12:${lastCellAddress}12`).load(ExcelLoadEnumerator.values);
//         await context.sync();

//         percRange.format.font.size = 14;
//         percRange.format.font.bold = true;
//         percRange.format.horizontalAlignment = Excel.HorizontalAlignment.center;
//         percRange.numberFormat = [["#.0%"]];

//         percRangeArrowIcons.format.horizontalAlignment = Excel.HorizontalAlignment.center;
//         percRangeArrowIcons.format.font.size = 17;
//         percRangeArrowIcons.format.font.name = "Arial";
//         percRangeArrowIcons.format.rowHeight = 15;
        
//         percRangeHalfTIcons.format.horizontalAlignment = Excel.HorizontalAlignment.center;
//         percRangeHalfTIcons.format.font.size = 15;
//         percRangeHalfTIcons.format.font.name = "Arial";
//         percRangeHalfTIcons.format.rowHeight = 15;

//         percRangeHalfTIcons.values = [match_percentage_list.map(v => v ? Strings.halfT : '')];
//         percRange.values = [match_percentage_list];
//         percRangeArrowIcons.values = [match_percentage_list.map(v => v ? Strings.arrowDown : '')];

//         sheet.getRange(`${AlphabetsEnumerator.B}4:${lastCellAddress}4`).values = [result_list];
//         //paste formulas in all other cells

//         sheet.getRange("C5").values = [
//             [
//                 `=IF(LEN(IFERROR(VLOOKUP($B5,TempdataTable[#All],IFERROR(HLOOKUP('Staging Area'!C$4,TempdataTable[#All],2,FALSE), ""),FALSE),""))=0,"",IFERROR(VLOOKUP($B5,TempdataTable[#All],IFERROR(HLOOKUP('Staging Area'!C$4,TempdataTable[#All],2,FALSE), ""),FALSE),""))`
//             ],
//         ];
//         sheet.getRange("C6:C9").copyFrom("C5");
//         sheet.getRange(`D5:${lastCellAddress}9`).copyFrom("C5");
//         sheet.getRange("A1").values = [["'"]];

//         // C13 range for formulas
//         let row13FormulaTable: Excel.Range = sheet.getRange(`B13:${lastCellAddress}13`);
//         row13FormulaTable.format.fill.color = AppColors.primary_light_blue;
//         row13FormulaTable.format.font.color = AppColors.primacy_black;
//         row13FormulaTable.format.font.size = 12;
//         row13FormulaTable.format.font.bold = true;

//         //add the title 'STAGING AREA' for the Staging table in cell B14
//         let StagingTitle: Excel.Range = sheet.getRange(`${AlphabetsEnumerator.B}14`);
//         StagingTitle.format.fill.color = "#4472C4";
//         StagingTitle.format.font.color = AppColors.primacy_white;
//         StagingTitle.format.font.size = 32;
//         StagingTitle.values = [["STAGING AREA"]];

//         //merge the Staging Table Title across all columns
//         let MgdStagingTitle: Excel.Range = sheet.getRange(`${AlphabetsEnumerator.B}14:${lastCellAddress}14`);
//         MgdStagingTitle.merge(true);
//         MgdStagingTitle.format.fill.color = "#4472C4";
//         MgdStagingTitle.format.font.color = AppColors.primacy_white;
//         MgdStagingTitle.format.font.size = 32;

//         //add the Staging table & name it
//         let StagingTable: Excel.Table = sheet.tables.add(`${AlphabetsEnumerator.A}15:${lastCellAddress}15`, false /*hasHeaders*/);
//         StagingTable.name = STAGING_TABLE;
//         let StagingTableRange: Excel.Range = sheet.getRange(`${AlphabetsEnumerator.A}15:${lastCellAddress}15`);
//         StagingTableRange.format.font.size = 14;

//         // add column headers for the Staging table
//         StagingTable.getHeaderRowRange().values = [[...Object.values(StagingColumns).map((v: IColumnIdentify) => v.displayName)]];
//         let raw_sov_row_count = CommonMethods.getLocalStorage("row_count");
//         let rawdel = CommonMethods.getLocalStorage("lengthdele");
//         let finalrows = rawdel ? rawdel : raw_sov_row_count;

//         sheet.getRange("C16").values = [
//             [
//                 `=IF(C$13="",IF(LEN(IFERROR(VLOOKUP($B16,TempdataTable[#All],IFERROR(HLOOKUP('Staging Area'!C$4,TempdataTable[#All],2,FALSE), ""),FALSE),""))=0,"",IFERROR(VLOOKUP($B16,TempdataTable[#All],IFERROR(HLOOKUP('Staging Area'!C$4,TempdataTable[#All],2,FALSE), ""),FALSE),"")),C$13)`
//             ],
//         ];
        
//         for (let i = 1; i < parseInt(finalrows); i++) {
//             sheet.getRange("B" + (i + 15).toString()).values = [[i]];
//             sheet.getRange("B" + (i + 15).toString()).numberFormat = [["#"]];
//         }

//         sheet.getRange(`C17:C${(parseInt(raw_sov_row_count) + 14).toString()}`).copyFrom("C16");
//         sheet.getRange(`D16:${(staging_last_cell.address).split('!')[1].slice(0, 2)}` + (parseInt(raw_sov_row_count) + 14).toString()).copyFrom("C16");
//         await context.sync();

//         if (Office.context.requirements.isSetSupported("ExcelApi", "1.2")) {
//             sheet.getUsedRange().format.autofitColumns();
//             sheet.getUsedRange().format.autofitRows();
//         }

//         const updatearray = raw_sov_columns_range.values[0];
//         store.dispatch(setSovColumns(raw_sov_columns_range.values));
//         const finalupdate = [...updatearray];
//         const length: number = finalupdate.length;
//         finalupdate.map(
//             (item, index) => (temp_sheet.getRange("PP" + (index + 2).toString()).values = [[item]])
//         );
//         const stagingTable: Excel.Table = sheet.tables.getItem(STAGING_TABLE);
//         let visibleRange = stagingTable.getDataBodyRange().getVisibleView();
//         await context.sync();

//         const raw_with_emty: Excel.Range = temp_sheet.getRange("PP1:PP" + (length + 1).toString());

//         sheet.load(ExcelLoadEnumerator.rows);
//         sheet.load(ExcelLoadEnumerator.rowCount);
//         visibleRange.load(ExcelLoadEnumerator.values);
//         visibleRange.load(ExcelLoadEnumerator.address);
//         visibleRange.load(ExcelLoadEnumerator.rowCount);
//         visibleRange.load(ExcelLoadEnumerator.columnCount);
//         visibleRange.load(ExcelLoadEnumerator.columns);
//         sheet.activate();
//         await context.sync();
        
//         const bv2 = stagingTable.columns.getItem(StagingColumns.BUILDING_VALUE_2.displayName).getDataBodyRange().load(ExcelLoadEnumerator.address);
//         const locPerils = stagingTable.columns.getItem(StagingColumns.LOCPERILS.displayName).getDataBodyRange().load(ExcelLoadEnumerator.address);
//         const tov = stagingTable.columns.getItem(StagingColumns.TOTAL_OTHER_VALUE.displayName).getDataBodyRange().load(ExcelLoadEnumerator.address);
//         const cv5 = stagingTable.columns.getItem(StagingColumns.CONTENTS_VALUE_5.displayName).getDataBodyRange().load(ExcelLoadEnumerator.address);
//         await context.sync();

//         function sliceAdd(add: string): string {
//             return add.split('!')[1].slice(0, 2);
//         }
        
//         sheet.getRanges(`C4:${sliceAdd(bv2.address)}4, ${sliceAdd(tov.address)}4:${sliceAdd(cv5.address)}4, AK4:AL4, ${sliceAdd(locPerils.address)}4:${lastCellAddress}4`).dataValidation.rule = {
//             list: {
//                 inCellDropDown: true,
//                 source: raw_with_emty,
//             },
//         };
        
//         // fetch row 11 range
//         const temprange: Excel.Range = sheet.getRange(`C11:${lastCellAddress}11`);
//         await context.sync();
//         temprange.format.font.bold = true;

//         const conditionalFormatBorders: Excel.ConditionalFormat = temprange.conditionalFormats.add(
//             Excel.ConditionalFormatType.presetCriteria
//         );
        
//         // Border every cell's that is not blank in the range.
//         CommonMethods.setRangeBorders(conditionalFormatBorders.preset, AppColors.primacy_black);
//         conditionalFormatBorders.preset.rule = {
//             criterion: Excel.ConditionalFormatPresetCriterion.nonBlanks
//         };

//         await tryCatch(adjustColorGradients(undefined));

//         const construction = stagingTable.columns.getItem(StagingColumns.CONSTRUCTION_CODE.displayName).getDataBodyRange();
//         const occupancy = stagingTable.columns.getItem(StagingColumns.OCCUPANCY_CODE.displayName).getDataBodyRange();
//         construction.load(ExcelLoadEnumerator.values);
//         occupancy.load(ExcelLoadEnumerator.values);
//         await context.sync();

//         sheet.onChanged.add((e) => stagingAreaSheetOnChanged(e, false));
//         stagingTable.onChanged.add((e: Excel.TableChangedEventArgs) => stagingTableOnChange(e));

//         const _const = construction.values.map(val => [`${val[0]}`.trim()]);
//         const _occu = occupancy.values.map(val => [`${val[0]}`.trim()]);
//         const uniqueconstrunction = uniqWith(_const, isEqual);
//         const uniqueoccupancyy = uniqWith(_occu, isEqual);

//         store.dispatch(setNumOfConstructionType(uniqueconstrunction.flat(1).length));
//         store.dispatch(setNumOfOccupancyType(uniqueoccupancyy.flat(1).length));

//         await tryCatch(setStagingAreaColorSchemes());

//         let tablerows: Excel.TableRowCollection = stagingTable.rows;
//         tablerows.load(ExcelLoadEnumerator.items);
//         await context.sync();

//         for (let i = 0; i < tablerows.items.length; i++) {
//             const find: any[] = tablerows.items[i].values[0];
//             if(!find.length || !find[1]){
//                 const row = tablerows.getItemAt(i);
//                 row.delete();
//             }
//         }

//         await tryCatch(additionalCoveragesCopies(true));
//         await tryCatch(updateLocationCounts(false));
//         await tryCatch(getTotalCoverages());
//         await tryCatch(getConstructionsAndOccupancies());
//         await tryCatch(unmappedcolumn(false, undefined, undefined, false));

//         if(autoGeoCode && geoCodesPreference?.length){
//             await tryCatch(clickGetCoordinates(geoCodesPreference, true, false));
//         }

//         if(!autoGeoCode){
//             await tryCatch(onLoadMap(false, false));
//         }

//         const tiv = stagingTable.columns.getItem(StagingColumns.TOTAL_INSURED_VALUES.displayName).getDataBodyRange().load(ExcelLoadEnumerator.values);
//         tablerows = stagingTable.rows.load(ExcelLoadEnumerator.items);
//         await context.sync();

//         let unique_construction_count = _store.metadata.numOfConstructionType;
//         let unique_occupancy_count = _store.metadata.numOfOccupancyType;
//         const meta = _store.utility.summaryMeta;
//         const reqObj = {
//             workbook_name: meta.workbook_name,
//             name_insured: global.workbookName,
//             all_work_sheets: meta.all_work_sheets,
//             active_worksheet: meta.active_worksheet,
//             selected_range: meta.selected_range,
//             column_count: meta.total_columns,
//             row_count: meta.total_rows,
//             selected_column_count: meta.selected_columns,
//             selected_row_count: meta.selected_rows,
//             location_count: tablerows.count,
//             hazardhub_location_count: meta.hazardhub_locations,
//             mapped_column_count: meta.no_of_columns_mapped,
//             tiv: CommonMethods.arrayValuesSum(tiv.values.flat(1)),
//             construction_count: unique_construction_count,
//             occupancy_count: unique_occupancy_count,
//             raw_sov_data: raw_sov_data
//         }
        
//         await processWorkbook(reqObj).then(response => {
//             if (response.status === API_UNAUTHORISED) {
//                 store.dispatch(logout());
//             } else {
//                 store.dispatch(setProcessId(response.data.id));
//             }
//         });

//         toast.success(AlertsMsgs.stagingAreaSheetCreation);

//         if (Office.context.requirements.isSetSupported("ExcelApi", "1.2")) {
//             sheet.getUsedRange().format.autofitColumns();
//             sheet.getUsedRange().format.autofitRows();
//         }
        
//         tryCatch(onConfirmData(false));
//     });
//   } catch (error) {
//     store.dispatch(setShowMap(false));
//     store.dispatch(setloader(false));
//   }
// }

// var debouncedRender = _.debounce(function(event: Excel.WorksheetChangedEventArgs, unMappedViaAddRisk: boolean) {
//     const triggerSource: boolean = event.triggerSource !== "ThisLocalAddin";

//     Excel.run(async (context: Excel.RequestContext) => {
//         const _store: any = store.getState();
//         const StagingColumns: IStagingAreaColumns = _store.metadata.columns;

//         if(triggerSource && _store.actionLogs.rawSovExist) {
//             await formulaPasteUnPasteWhileChangeMappings(event);
//         }

//         const first: string[] = await CommonMethods.getColumnsAddresses(1, StagingColumns);
//         const third: string[] = await CommonMethods.getColumnsAddresses(3, StagingColumns);
//         const fourth: string[] = await CommonMethods.getColumnsAddresses(4, StagingColumns);
//         const fifth: string[] = await CommonMethods.getColumnsAddresses(5, StagingColumns);
//         const sixth: string[] = await CommonMethods.getColumnsAddresses(6, StagingColumns);

//         if(first.includes(event.address.slice(0, 2)) && triggerSource){
//             tryCatch(getRMSColumns(_store.policyform.selectedPerilsList, Object.values(_store.metadata.occupancyMappings).filter(f => Object.keys(f).length > 0).map((v: any) => v?.id)));
//         }
//         if(third.includes(event.address.slice(0, 1))){ // For ITV refresh state updation to get updated data from staing area columns
//             store.dispatch(setRefreshItv(Math.random()));
//         }
//         if(fourth.includes(event.address.slice(0, 2))){
//             tryCatch(additionalCoveragesCopies(true));
//         }
//         if(fifth.includes(event.address.slice(0, 1))){
//             tryCatch(checkUnmappedCunstructionList([1]));
//         }
//         if(sixth.includes(event.address.slice(0, 1))){
//             tryCatch(checkUnmappedCunstructionList([2]));
//         }

//         if(triggerSource){
//             if(!unMappedViaAddRisk){
//                 const actual: string[] = event.address.match(/[a-zA-Z]+|[0-9]+/g);
//                 const containsM: boolean = parseInt(actual[1]) === 4 && (event.details?.valueBefore !== event.details.valueAfter);
//                 tryCatch(unmappedcolumn(true, JSON.parse(CommonMethods.getLocalStorage("autoMappedRawColumns")), JSON.parse(CommonMethods.getLocalStorage("autoMappedStagingColumns")), parseInt(actual[1]) === 4, containsM ? event.address : ''));   
//             }
//             if(unMappedViaAddRisk){
//                 store.dispatch(setUnmappedColumns([]));
//                 tryCatch(onChangeForDataCompletenessSet());
//                 tryCatch(onChangeForDataQualitySet());
//             }
//         }
    
//         await tryCatch(getTotalCoverages());
//         await reCalculate(event);

//         return context.sync();
//     }).catch(function(error) {
//         console.log(error);
//     });
// }, 750); // Adjust the debounce delay as needed

// async function stagingAreaSheetOnChanged(event: Excel.WorksheetChangedEventArgs, unMappedViaAddRisk: boolean): Promise<Excel.WorksheetChangedEventArgs> {
//     debouncedRender(event, unMappedViaAddRisk);
//     return event;
// };

// export async function stagingTableOnChange(e){
//     await Excel.run(async () => {
//         if(e.changeType === "RowDeleted" || e.changeType === "RowInserted" ){
//             tryCatch(checkUnmappedCunstructionList([1, 2]));
//             tryCatch(unmappedcolumn(true, JSON.parse(CommonMethods.getLocalStorage("autoMappedRawColumns")), JSON.parse(CommonMethods.getLocalStorage("autoMappedStagingColumns")), false, ''));
//             reCalculate(e);
//         }        
//     });
// };

// // function to recalculate and dynamically addin matrix counts when user changes something on the sheet and record the changes log in actionlogs sheet.
// export async function reCalculate(eventArgs) {
//     /**
//      * same columns should not be mapped for two or multiple columns in staging table columns.
//      * if user mapps column which is already mapped to another column then old mapping should be removed.
//      * along with that match percentage details should move to above newly mapped column  
//      * this function is intended to handle this task.
//     */

//     store.dispatch(setSheetChanged());
//     await Excel.run(async (context: Excel.RequestContext) => {
//         const _store: any = store.getState();
//         const StagingColumns: IStagingAreaColumns = _store.metadata.columns;
        
//         // get staging area sheet and staging table, and sync context
//         let sheet: Excel.Worksheet = context.workbook.worksheets.getItem(STAGING_AREA_SHEET);
//         let stagingTable: Excel.Table = sheet.tables.getItem(STAGING_TABLE).load(ExcelLoadEnumerator.columns).load(ExcelLoadEnumerator.columnCount).load(ExcelLoadEnumerator.rows);
//         await context.sync();

//         // get total columns count and then get last column address
//         let colLength: number = stagingTable.columns.count;
//         const totalTableRows: number = stagingTable.rows.count;
//         let staging_last_cell: Excel.Range = sheet.getCell(1, colLength);
//         staging_last_cell.load(ExcelLoadEnumerator.address);
//         await context.sync();

//         let lastAddrs: string = CommonMethods.columnAddressSlice(staging_last_cell.address, 2);
//         let mapped_columns_range: Excel.Range = sheet.getRange(`C4:${lastAddrs}4`).load(ExcelLoadEnumerator.values).load(ExcelLoadEnumerator.columnCount);
//         await context.sync();

//         const countArray: number[] = [];
//         for (let i = 1; i <= totalTableRows; i++) {
//             countArray.push(i);
//         }

//         // get mapped columns values 
//         const mappedValues = [...mapped_columns_range.values];

//         let letter: string = AlphabetsEnumerator.B;
//         // construct column addresses 
//         let mapped = [..._.range(mapped_columns_range.columnCount)].map((_) => {
//             let lastTwo = letter.slice(-2);
//             if (lastTwo.length > 1) {
//                 lastTwo[lastTwo.length - 1] === 'Z'
//                 if (lastTwo[lastTwo.length - 1] === 'Z') {
//                     let a = CommonMethods.nextChar(lastTwo[lastTwo.length - 2]);
//                     letter = `${a}@`;
//                 }
//             } else {
//                 if (letter[letter.length - 1] === 'Z') letter = 'A@';
//             }
//             let _nextChar = CommonMethods.nextChar(letter);
//             letter = `${_nextChar}`;
//             return `${_nextChar}4`
//         });

//         // get sheet data changes details and address of the changed location 
//         let details = eventArgs.details;
//         let address = eventArgs.address;
//         const idx: number = mapped.indexOf(`${address}`);
//         const col: string[] = `${address}`.split(/[0-9]/g);

//         let prevPercent;
//         // if newly mapped column is already mapped in any other column then clear it 
        
//         if (details) {

//             const newValues = mappedValues[0].map((item, index) => {
//                 if (item === details.valueAfter && index !== idx && idx !== -1) {
//                     prevPercent = `${mapped[index]}`.split(/[0-9]/g);
//                     return ""
//                 } else {
//                     return item;
//                 }
//             });

//             let row11: Excel.Range = sheet.getRange(`${prevPercent[0]}11`).load(ExcelLoadEnumerator.values);
//             await context.sync();

//             // move related match percentage details above newly mapped column 
//             if (JSON.stringify(newValues) !== JSON.stringify(mappedValues[0])) {
//                 mapped_columns_range.values = [newValues];
//                 sheet.getRange(`${prevPercent[0]}5:${prevPercent[0]}9`).values = [[''], [''], [''], [''], ['']];
//                 if (row11.values[0][0] !== Strings.backfillMapped) {
//                     sheet.getRange(`${prevPercent[0]}16:${prevPercent[0]}${(totalTableRows + 16) - 1}`).values = countArray.map(() => ['']);
//                 }
//             };

//             // recalculate coverages values for google map afer changes on sheet 
//             let _buildingValue = stagingTable.columns.getItem(StagingColumns.TOTAL_BUILDING_VALUE.displayName).getDataBodyRange().load(ExcelLoadEnumerator.address).load(ExcelLoadEnumerator.values);
//             let _otherValue = stagingTable.columns.getItem(StagingColumns.TOTAL_OTHER_VALUE.displayName).getDataBodyRange().load(ExcelLoadEnumerator.address).load(ExcelLoadEnumerator.values);
//             let _contentsValue = stagingTable.columns.getItem(StagingColumns.TOTAL_CONTENTS_VALUE.displayName).getDataBodyRange().load(ExcelLoadEnumerator.address).load(ExcelLoadEnumerator.values);
//             let _biValue = stagingTable.columns.getItem(StagingColumns.TOTAL_BI_VALUE.displayName).getDataBodyRange().load(ExcelLoadEnumerator.address).load(ExcelLoadEnumerator.values);
//             await context.sync();

//             let _coverages: any[][] = _buildingValue.values.flat(1).map((v, i) => [v, _otherValue.values.flat(1)[i], _contentsValue.values.flat(1)[i], _biValue.values.flat(1)[i]]);

//             const prevState = _store.utility.markers;
//             const newData = prevState.map((value, indx) => {
//                 return { ...value, coverages: _coverages[indx] }
//             });

//             store.dispatch(setMarkers(newData));
            
//             if (details.valueBefore !== "" && details.valueAfter !== 0) {
//                 store.dispatch(setUserAction(`Change at ${address}: was ${details.valueBefore},` + ` now is ${details.valueAfter}`));
//             }
//         }        
//     });
// }
