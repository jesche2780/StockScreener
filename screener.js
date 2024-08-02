// Plan: 
// - Use checkboxes to check the industries to analyze (use a limite of 5 at a time).
// - Find all the companies that are in those industries.
// - Find the revenue of those companies.
// - Organize the companies by the revenue.
// - Grab the top two companies.
// - Find the symbols of the top two companies.
// - Run the below analysis based on the symbols of those two companies.


let companyList = [];



function renderCompanyList() {
  companiesContainer.innerHTML = "";
  for (let i = 0; i < companyList.length; i++) {
    const deleteCompany = async (id) => {
      await fetch("http://localhost:3000/companies/" + id, {
        method: "DELETE",
      });
      const index = companyList.findIndex((company) => company.id === id);
      companyList.splice(index, 1);
      renderCompanyList();
    };
    const div = document.createElement("div");
    div.className = "border bg-light p-3 m-3";
    div.innerHTML = `
          <h3>${companyList[i].company}</h3>
          <p>${companyList[i].symbol}</p>
          <button class="btn btn-danger">Delete</button>
          <hr class="hr" />
          <p>Income before Taxes Ratio is higher than 20%:</p>
          <button class="btn btn-secondary incomeBeforeTaxesBtn">Processing...</button>
          <br>
          <br>
          <p>Current Assets over Total Liabilities is higher than 1:</p>
          <button class="btn btn-secondary assetsOverLiabBtn">Processing...</button>
          <br>
          <br>
          <p>Positive average revenue growth over the last 5 years:<p>
          <button class="btn btn-secondary revenueGrowthBtn">Processing...</button>
          <br>
          <br>
          <p>Company is older than 25 years:<p>
          <button class="btn btn-secondary companyAgeBtn">Processing...</button>
          <br>
          <br>
          <p>Company originates from the US:<p>
          <button class="btn btn-secondary companyOriginBtn">Processing...</button>
          <br>
          <br>
          <p>Average free cash flow growth over the last five years has been greater than 5%:<p>
          <button class="btn btn-secondary growthRateFiveYearBtn">Processing...</button>
          <br>
          <br>
          <p>Company has a positive dividend payout:<p>
          <button class="btn btn-secondary positiveDividendPayoutBtn">Processing...</button>
          <br>
          <br>
          <p>Company has a current price to safe intrinsic value ratio of under 70:<p>
          <button class="btn btn-secondary intrinsicValueUnderSeventyBtn">Processing...</button>
          <br>
      `;
    div
      .querySelector(".btn-danger")
      .addEventListener("click", () => deleteCompany(companyList[i].id));
    companiesContainer.append(div);
  }
  fetchIncomeBeforeTaxesRatioAndGrowthOverFiveYears(companyList);
  fetchCurrentAssetOverLiab(companyList);
  companyAgeAndOrigin(companyList);
  averageGrowthRateFiveYears(companyList);
  //ceoOverNineYears(companyList)
  positiveDividendPayout(companyList);
  intrinsicValueUnderSeventy(companyList);
}

async function getDiscountRate() {
  const discountData = await response.json();
  const discountRate = Number(discountData[0].year10) * 0.01;
  return discountRate;
}

async function fetchCompanyList() {
  const response = await fetch("http://localhost:3000/companies");
  const fetchedCompanies = await response.json();
  companyList = fetchedCompanies;
  renderCompanyList();
}
fetchCompanyList();

async function fetchIncomeBeforeTaxesRatioAndGrowthOverFiveYears(companyList) {
  for (let i = 0; i < companyList.length; i++) {
    const response = await fetch(
      `https://financialmodelingprep.com/api/v3/income-statement/${companyList[i].symbol}?period=annual&apikey=${API_KEY}`
    );
    const data = await response.json();
    const incomeBeforeTaxRatio = data[0].incomeBeforeTaxRatio;
    const buttons1 = document.getElementsByClassName("incomeBeforeTaxesBtn");
    if (incomeBeforeTaxRatio >= 0.2) {
      buttons1[i].className = "btn btn-success incomeBeforeTaxesBtn";
      buttons1[i].innerHTML = "Pass";
    } else {
      buttons1[i].className = "btn btn-danger incomeBeforeTaxesBtn";
      buttons1[i].innerHTML = "Fail";
    }
    let growthRates = [];
    for (let i = 0; i < data.length - 1; i++) {
      let growthRate =
        (data[i].revenue - data[i + 1].revenue) / data[i + 1].revenue;
      growthRates.push(growthRate);
    }
    let totalGrowthRate = growthRates.reduce((a, b) => a + b, 0);
    let averageGrowthRate = totalGrowthRate / growthRates.length;
    const buttons2 = document.getElementsByClassName("revenueGrowthBtn");
    if (averageGrowthRate > 0) {
      buttons2[i].className = "btn btn-success revenueGrowthBtn";
      buttons2[i].innerHTML = "Pass";
    } else {
      buttons2[i].className = "btn btn-danger revenueGrowthBtn";
      buttons2[i].innerHTML = "Fail";
    }
  }
}

async function fetchCurrentAssetOverLiab(companyList) {
  for (let i = 0; i < companyList.length; i++) {
    const response = await fetch(
      `https://financialmodelingprep.com/api/v3/balance-sheet-statement/${companyList[i].symbol}?period=annual&apikey=${API_KEY}`
    );
    const data = await response.json();
    const totalCurrentAssets = data[0].totalCurrentAssets;
    const totalLiabilities = data[0].totalLiabilities;
    const buttons = document.getElementsByClassName("assetsOverLiabBtn");
    if (totalCurrentAssets / totalLiabilities > 1) {
      buttons[i].className = "btn btn-success assetsOverLiabBtn";
      buttons[i].innerHTML = "Pass";
    } else {
      buttons[i].className = "btn btn-danger assetsOverLiabBtn";
      buttons[i].innerHTML = "Fail";
    }
  }
}

async function companyAgeAndOrigin(companyList) {
  for (let i = 0; i < companyList.length; i++) {
    const response = await fetch(
      `https://financialmodelingprep.com/api/v3/profile/${companyList[i].symbol}?apikey=${API_KEY}`
    );
    const data = await response.json();
    const ipoTimestamp = Date.parse(data[0].ipoDate);
    const nowTimestamp = Date.now();
    const twentyfiveYearsAgoTimestamp = new Date();
    twentyfiveYearsAgoTimestamp.setFullYear(
      twentyfiveYearsAgoTimestamp.getFullYear() - 25
    );
    const differenceIPO = nowTimestamp - ipoTimestamp;
    const differenceTwentyfiveYears =
      nowTimestamp - twentyfiveYearsAgoTimestamp.getTime();
    const buttons1 = document.getElementsByClassName("companyAgeBtn");
    if (differenceIPO > differenceTwentyfiveYears) {
      buttons1[i].className = "btn btn-success companyAgeBtn";
      buttons1[i].innerHTML = "Pass";
    } else {
      buttons1[i].className = "btn btn-danger companyAgeBtn";
      buttons1[i].innerHTML = "Fail";
    }
    const companyCountry = data[0].country;
    const buttons2 = document.getElementsByClassName("companyOriginBtn");
    if (companyCountry === "US") {
      buttons2[i].className = "btn btn-success companyOriginBtn";
      buttons2[i].innerHTML = "Pass";
    } else {
      buttons2[i].className = "btn btn-danger companyOriginBtn";
      buttons2[i].innerHTML = "Fail";
    }
  }
}

async function averageGrowthRateFiveYears(companyList) {
  for (let i = 0; i < companyList.length; i++) {
    const response = await fetch(
      `https://financialmodelingprep.com/api/v3/cash-flow-statement/${companyList[i].symbol}?period=annual&apikey=${API_KEY}`
    );
    const data = await response.json();
    let growthRates = [];
    for (let i = 0; i < Math.min(data.length - 1, 4); i++) {
      let growthRate =
        (data[i].freeCashFlow - data[i + 1].freeCashFlow) /
        data[i + 1].freeCashFlow;
      growthRates.push(growthRate);
    }
    let totalGrowthRate = growthRates.reduce((a, b) => a + b, 0);
    let averageGrowthRate = totalGrowthRate / growthRates.length;
    const button = document.getElementsByClassName("growthRateFiveYearBtn");
    if (averageGrowthRate > 0.05) {
      button[i].className = "btn btn-success growthRateFiveYearBtn";
      button[i].innerHTML = "Pass";
    } else {
      button[i].className = "btn btn-danger growthRateFiveYearBtn";
      button[i].innerHTML = "Fail";
    }
  }
}
/*
async function ceoOverNineYears(companyList) {
  for (let i = 0; i < companyList.length; i++) {
    const response = await fetch(`https://financialmodelingprep.com/api/v3/key-executives/${companyList[i].symbol}?apikey=${API_KEY}`)
    const data = await response.json()
    const execTimestamp = Date.parse(data[0].titleSince);
    const tenYearsAgoTimestamp = new Date();
    tenYearsAgoTimestamp.setFullYear(tenYearsAgoTimestamp.getFullYear() - 10);
    const nowTimestamp = Date.now();    
    const differenceExec = nowTimestamp - execTimestamp;
    const differenceTenYears = nowTimestamp - tenYearsAgoTimestamp.getTime();
    const button = document.getElementsByClassName("ceoOverNineYearsBtn")
      if(differenceExec >= differenceTenYears) {
        button[i].className = "btn btn-success ceoOverNineYearsBtn"
        button[i].innerHTML = "Pass"
      } else {
        button[i].className = "btn btn-danger ceoOverNineYearsBtn"
        button[i].innerHTML = "Fail"
      }
  }
}
*/

async function positiveDividendPayout(companyList) {
  for (let i = 0; i < companyList.length; i++) {
    const response = await fetch(
      `https://financialmodelingprep.com/api/v3/historical-price-full/stock_dividend/${companyList[i].symbol}?apikey=${API_KEY}`
    );
    const data = await response.json();
    const dividendPay =
      data.historical && data.historical[0]
        ? data.historical[0].dividend
        : undefined;
    const button = document.getElementsByClassName("positiveDividendPayoutBtn");
    if (dividendPay > "0") {
      button[i].className = "btn btn-success positiveDividendPayoutBtn";
      button[i].innerHTML = "Pass";
    } else {
      button[i].className = "btn btn-danger positiveDividendPayoutBtn";
      button[i].innerHTML = "Fail";
    }
  }
}

async function intrinsicValueUnderSeventy(companyList) {
  for (let i = 0; i < companyList.length; i++) {
    const response = await fetch(
      `https://financialmodelingprep.com/api/v3/cash-flow-statement/${companyList[i].symbol}?period=annual&apikey=${API_KEY}`
    );
    const response1 = await fetch(
      `https://financialmodelingprep.com/api/v3/profile/${companyList[i].symbol}?apikey=${API_KEY}`
    );
    const response2 = await fetch(
      `https://financialmodelingprep.com/api/v3/quote/${companyList[i].symbol}?apikey=${API_KEY}`
    );
    const response3 = await fetch(
      `https://financialmodelingprep.com/api/v4/treasury?apikey=${API_KEY}`
    );
    const data = await response.json();
    const data1 = await response1.json();
    const data2 = await response2.json();
    const data3 = await response3.json();
    const discountRate = data3[0].year10 * 0.01;
    const currentFreeCashFlow = data[0].freeCashFlow;
    const currentPrice = data1[0].price;
    const totalSharesOutstanding = data2[0].sharesOutstanding;
    const constantTerminalGrowth = 0.01;
    const oneR = 1.03;
    const twoR = oneR + oneR * discountRate;
    const threeR = twoR + twoR * discountRate;
    const fourR = threeR + threeR * discountRate;
    const fiveR = fourR + fourR * discountRate;
    const sixR = fiveR + fiveR * discountRate;
    const sevenR = sixR + sixR * discountRate;
    const eightR = sevenR + sevenR * discountRate;
    const nineR = eightR + eightR * discountRate;
    const tenR = nineR + nineR * discountRate;
    let growthRates = [];
    for (let i = 0; i < Math.min(data.length - 1, 19); i++) {
      let growthRate =
        (data[i].freeCashFlow - data[i + 1].freeCashFlow) /
        Math.abs(data[i + 1].freeCashFlow);
      growthRates.push(growthRate);
    }
    const percent = 0.33;
    growthRates.sort((a, b) => a - b);
    const excludeCount = Math.floor((growthRates.length * percent) / 2);
    const trimmedGrowthRates = growthRates.slice(
      excludeCount,
      growthRates.length - excludeCount
    );
    const sum = trimmedGrowthRates.reduce((acc, val) => acc + val, 0);
    const meanTrimmedGrowthRates = sum / trimmedGrowthRates.length;
    const firstIntrinsicValue =
      currentFreeCashFlow + currentFreeCashFlow * meanTrimmedGrowthRates;
    const finishedFirstIntValue = firstIntrinsicValue / oneR;
    const intrinsicValueOne =
      firstIntrinsicValue + firstIntrinsicValue * meanTrimmedGrowthRates;
    const intrinsicValueTwo =
      intrinsicValueOne + intrinsicValueOne * meanTrimmedGrowthRates;
    const intrinsicValueThree =
      intrinsicValueTwo + intrinsicValueTwo * meanTrimmedGrowthRates;
    const intrinsicValueFour =
      intrinsicValueThree + intrinsicValueThree * meanTrimmedGrowthRates;
    const intrinsicValueFive =
      intrinsicValueFour + intrinsicValueFour * meanTrimmedGrowthRates;
    const intrinsicValueSix =
      intrinsicValueFive + intrinsicValueFive * meanTrimmedGrowthRates;
    const intrinsicValueSeven =
      intrinsicValueSix + intrinsicValueSix * meanTrimmedGrowthRates;
    const intrinsicValueEight =
      intrinsicValueSeven + intrinsicValueSeven * meanTrimmedGrowthRates;
    const intrinsicValueNine =
      intrinsicValueEight + intrinsicValueEight * meanTrimmedGrowthRates;
    let finishedIntrinsicValueOne = intrinsicValueOne / twoR;
    let finishedIntrinsicValueTwo = intrinsicValueTwo / threeR;
    let finishedIntrinsicValueThree = intrinsicValueThree / fourR;
    let finishedIntrinsicValueFour = intrinsicValueFour / fiveR;
    let finishedIntrinsicValueFive = intrinsicValueFive / sixR;
    let finishedIntrinsicValueSix = intrinsicValueSix / sevenR;
    let finishedIntrinsicValueSeven = intrinsicValueSeven / eightR;
    let finishedIntrinsicValueEight = intrinsicValueEight / nineR;
    let finishedIntrinsicValueNine = intrinsicValueNine / tenR;
    const totalPreTermIntrValue =
      finishedFirstIntValue +
      finishedIntrinsicValueOne +
      finishedIntrinsicValueTwo +
      finishedIntrinsicValueThree +
      finishedIntrinsicValueFour +
      finishedIntrinsicValueFive +
      finishedIntrinsicValueSix +
      finishedIntrinsicValueSeven +
      finishedIntrinsicValueEight +
      finishedIntrinsicValueNine;
    const terminalValue = (((intrinsicValueNine*(1+constantTerminalGrowth))/(discountRate-constantTerminalGrowth))/tenR)
    const totalIntrinsicValue = (terminalValue + totalPreTermIntrValue)
    const intrinsicValuePerShare = (totalIntrinsicValue/totalSharesOutstanding)
    const safeIntrinsicValue = (intrinsicValuePerShare*.50)
    const button = document.getElementsByClassName(
      "intrinsicValueUnderSeventyBtn"
    );
    if (currentPrice / safeIntrinsicValue < 0.7 && safeIntrinsicValue > 0) {
      button[i].className = "btn btn-success intrinsicValueUnderSeventyBtn";
      button[i].innerHTML = "Pass";
    } else {
      button[i].className = "btn btn-danger intrinsicValueUnderSeventyBtn";
      button[i].innerHTML = "Fail";
    }
  }
}

const companiesContainer = document.getElementById("companies-container");
const companyInput = document.getElementById("company-input");
const symbolInput = document.getElementById("symbol-input");
async function createCompany(event) {
  event.preventDefault();
  const newCompanyData = {
    company: companyInput.value,
    symbol: symbolInput.value,
  };
  companyInput.value = "";
  symbolInput.value = "";
  const response = await fetch("http://localhost:3000/companies", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(newCompanyData),
  });
  const createdCompanyWithId = await response.json();
  companyList.push(createdCompanyWithId);

  renderCompanyList();
}

/*
----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

Plan for this screener:
  XXXX Domestic Stock
  XXXX Positive dividend payout
  XXXX Before taxes profit margin is over .20
  XXXX Current assets/total liabilities are over or equal to 1
  XXXX Average free cashflow growth rate over last 5 years is over .05 by calculating as such:
    XXXX Averaging the growth rate for each year over a 5 year period.
  XXXX Current Price/Safe intrinsic value is under 70 AND Safe intrinsic value greater than 0.
    XXXX Safe Intrinsic value calculated by (1 - Margin of safety(50%)) multiplied by Intrinsic value per share 
      XXXX Intrinsic value per share calculated by total intrinsic value/Total shares outstanding
        XXXX Total intrinsic value is calculated by adding terminal value to the total calculated 10 year projected growth value of free cash flow result.
          XXXX Terminal value is calculated by taking the tenth year Free cash flow and multiplying it by (1 + Terminal growth number (1%)) and dividing that product by (Terminal growth subtracted from Discount Rate (current treasury note yield)) and dividing that result by tenth year (1+r)
          XXXX Total calculated 10 year projected growth value of free cash flow result is calculated by adding all ten year intrinsic value growth results together.
            XXXX Each individual intrinsic value growth result year is calculated by taking the current free cash flow and adding it to (itself multiplied by a growth rate) and dividing it by the first
            (1+r (1.03)) for the first year, then for each year afterward, taking the prior year's free cash flow and adding it by (itself multiplied by the growth rate) and dividing it by the next calculated (1+r (taking the prior year's 1+r and multiplying it by the discount rate))
            (making sure to change any starting negatives for free cashflow to positive free cashflow once growth starts).
              XXXX Growth rate is calculated by taking the last 20 years' free cash flow growth between each year and conducting an average that removes the 33% outliers from the dataset
            XXXX current free cash flow is calculated by using the most recent free cash flow reported amount
  XXXX IPO > 25 years
  XXXX Positive average revenue growth - 5 years


  Not part of screener:
  Find top 5 companies in an industry
  Value line- Industry to last a long time (high rated in Value Line analysis)
  Management that focuses on owners and CEO that has been in position for over 10 years

*/
