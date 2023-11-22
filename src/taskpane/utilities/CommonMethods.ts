import moment from "moment";
import { AlphabetsEnumerator, ExcelLoadEnumerator } from "@taskpaneutilities/Enum";

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

  public async getWorkSheetAndTableName(): Promise<{ worksheetName: string; worksheetTableName: string; }> {
    const name: string = await Excel.run(async (context: Excel.RequestContext) => {
      let sheets: Excel.WorksheetCollection = context.workbook.worksheets;
      let activeWorkSheet = sheets.getActiveWorksheet().load(ExcelLoadEnumerator.name);
      await context.sync();
      return activeWorkSheet.name;
    });

    global.worksheetName = name;

    return { worksheetName: name, worksheetTableName: `${name.split(' ').join("")}Table` };
  }

  public nextChar = (str: string): string => {
    let _c = str.slice(0, str.length - 1);
    return _c + String.fromCharCode(str.charCodeAt(str.length - 1) + 1);
  };

  public columnAddressSlice = (address: string, sliceIndex: number): string => {
    return address?.split("!")[1]?.slice(0, sliceIndex);
  };
}

const CommonMethods = new Methods();

export default CommonMethods;
