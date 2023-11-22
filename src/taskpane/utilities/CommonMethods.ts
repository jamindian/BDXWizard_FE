import moment from "moment";
import { AlphabetsEnumerator, ExcelLoadEnumerator } from "@taskpaneutilities/Enum";
import { AppColors } from "@taskpaneutilities/Constants";

class Methods {
  public validateEmail = (email: string): boolean => {
    // eslint-disable-next-line no-useless-escape
    const regularExpression =
      /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

    return regularExpression.test(email.toLowerCase());
  };

  public convertFromOADate = (oaDate: number) => {
    var date = new Date((oaDate - 25569) * 86400000);
    var tz = date.getTimezoneOffset();
    return new Date((oaDate - 25569 + tz / (60 * 24)) * 86400000);
  };

  public numberWithCommas = (x) => {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  public removeCommas = (x: string): string => {
    return x.split(",").join("");
  };

  public convertIntoDateFormat = (_air: boolean, date: string): string => {
    var d = moment(date).format("MM/DD/YYYY");
    return d;
  };

  public arrayValuesSum = (array): number => {
    let sum = 0;
    for (let i = 0; i < array.length; i++) {
      if (typeof array[i] === "number") {
        sum = sum + parseFloat(array[i]);
      } else {
        sum = sum + 0;
      }
    }

    return sum;
  };

  public getNextKey = (key: string): string => {
    if (key === AlphabetsEnumerator.Z || key === AlphabetsEnumerator.Z.toLowerCase()) {
      return String.fromCharCode(key.charCodeAt(0) - 25) + String.fromCharCode(key.charCodeAt(0) - 25); // AA or aa
    } else {
      var lastChar = key.slice(-1);
      var sub = key.slice(0, -1);
      if (lastChar === AlphabetsEnumerator.Z || lastChar === AlphabetsEnumerator.Z.toLowerCase()) {
        // If a string of length > 1 ends in Z/z,
        // increment the string (excluding the last Z/z) recursively,
        // and append A/a (depending on casing) to it
        return this.getNextKey(sub) + String.fromCharCode(lastChar.charCodeAt(0) - 25);
      } else {
        // (take till last char) append with (increment last char)
        return sub + String.fromCharCode(lastChar.charCodeAt(0) + 1);
      }
    }
  };

  public getAccessToken = (): string | undefined => {
    return localStorage.getItem("token")?.toString();
  };

  public setAccessToken = (token: string): void => {
    localStorage.setItem("token", token);
  };

  public getLocalStorage = (key: string): any => {
    const name: string = global.workbookName;
    return localStorage.getItem(`${key}_${name?.slice(0, 10)}`);
  };

  public setLocalStorage = (key: string, value: string): void => {
    const name: string = global.workbookName;
    localStorage.setItem(`${key}_${name?.slice(0, 10)}`, value);
  };

  public removeLocalStorage = (key: string): void => {
    const name: string = global.workbookName;
    localStorage.removeItem(`${key}_${name?.slice(0, 10)}`);
  };

  public async getWorkbookName(): Promise<string> {
    const name: string = await Excel.run(async (context: Excel.RequestContext) => {
      let workbook: Excel.Workbook = context.workbook;
      workbook.load(ExcelLoadEnumerator.name);
      await context.sync();
      return workbook.name;
    });
    global.workbookName = name?.split(".")[0];

    return name;
  }

  public async getActiveWorkSheetAndTableName(): Promise<{ worksheetName: string; worksheetTableName: string; worksheetStagingArea: string; }> {
    const name: string = await Excel.run(async (context: Excel.RequestContext) => {
      let sheets: Excel.WorksheetCollection = context.workbook.worksheets;
      let activeWorkSheet = sheets.getActiveWorksheet().load(ExcelLoadEnumerator.name);
      await context.sync();
      return activeWorkSheet.name;
    });

    global.worksheetName = name;

    // return { worksheetName: name, worksheetStagingArea: name.replace(/[^a-zA-Z0-9 ]/g, '') + " Staging Area", worksheetTableName: `${name.replace(/[^a-zA-Z0-9 ]/g, '').split(' ').join("")}StagingTable` };
    return { worksheetName: name, worksheetStagingArea: "Staging Area", worksheetTableName: `StagingTable` };
  }

  public nextChar = (str: string): string => {
    let _c = str.slice(0, str.length - 1);
    return _c + String.fromCharCode(str.charCodeAt(str.length - 1) + 1);
  };

  public columnAddressSlice = (address: string, sliceIndex: number): string => {
    return address?.split("!")[1]?.slice(0, sliceIndex);
  };

  public async stagingAreaPercentageFormatGet(): Promise<string[]> {
    const { worksheetName } = await this.getActiveWorkSheetAndTableName();
    const results: string[] = await Excel.run(async (context) => {
      const sheets = context.workbook.worksheets;
      const stagingSheet = sheets.getItem(worksheetName);
      await context.sync();

      if (!JSON.parse(this.getLocalStorage("result_list"))){
        return [];
      }

      let staging_last_cell = stagingSheet.getCell(
        1,
        JSON.parse(this.getLocalStorage("result_list")).length
      );
      staging_last_cell.load(ExcelLoadEnumerator.address);
      await context.sync();

      let percRange = stagingSheet
        .getRange(
          `B11:${CommonMethods.columnAddressSlice(
            staging_last_cell.address,
            2
          )}11`
        )
        .load(ExcelLoadEnumerator.values);
      await context.sync();

      const arr: string[] = [];
      const values: any[] = percRange.values.flat(1);
      let initial: string = AlphabetsEnumerator.B;

      for (let k = 0; k < values.length; k++) {
        let rangePercentage = stagingSheet
          .getRange(`${initial}11`)
          .load("format/fill/color");
        await context.sync();

        arr.push(rangePercentage.format.fill.color);
        initial = CommonMethods.getNextKey(initial);
      }

      return arr;
    });

    return results;
  }

  public getRangeColor = (percentage: number): string => {
    let color = AppColors.primacy_green;
    if (percentage > 0 && percentage < 21) {
      color = AppColors.primacy_red;
    } else if (percentage > 20 && percentage < 41) {
      color = AppColors.primacy_orange;
    } else if (percentage > 40 && percentage < 61) {
      color = "#FED8B1";
    } else if (percentage > 60 && percentage < 81) {
      color = AppColors.primacy_yellow;
    } else if (percentage > 80 && percentage < 91) {
      color = "#B4C836";
    } else {
      color = AppColors.primacy_green;
    }

    return color;
  };

  public setRangeBorders(range: Excel.Range | Excel.PresetCriteriaConditionalFormat | any, color: string, exChange?: boolean): void {
    if (exChange) {
      range.format.borders.getItem("InsideHorizontal").color = color;
      range.format.borders.getItem("InsideVertical").color = color;
      range.format.borders.getItem("EdgeBottom").color = color;
      range.format.borders.getItem("EdgeLeft").color = color;
      range.format.borders.getItem("EdgeRight").color = color;
    } else {
      range.format.borders.getItem("EdgeTop").color = color;
      range.format.borders.getItem("EdgeBottom").color = color;
      range.format.borders.getItem("EdgeLeft").color = color;
      range.format.borders.getItem("EdgeRight").color = color;
    }
  }

  public rawSOVRangeIntoObjectValues = (values: any[][]): { [key: string]: any[] } => {
    const keys: string[] = values[0];
    const obj = {};
    for (let i = 0; i < keys.length; i++) {
      obj[keys[i]] = values.slice(1).map(value => value[i]);
    }

    return obj;
  };
}

const CommonMethods = new Methods();

export default CommonMethods;
