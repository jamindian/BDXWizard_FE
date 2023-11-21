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

    tryCatch(createStagingArea(JSON.stringify(raw_sov_range.values)));
  });
}
