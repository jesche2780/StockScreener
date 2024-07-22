
let companyList = []

//Input into the website on the browser the top five companies of each industry. 

function renderCompanyList() {
  companiesContainer.innerHTML = ""
  for (let i = 0; i < companyList.length; i++) {
      const deleteCompany = async (id) => {
          await fetch("http://localhost:3000/companies/" + id, {
              method: "DELETE"
          })
          const index = companyList.findIndex(company => company.id === id);
          companyList.splice(index, 1)
          renderCompanyList()
      }
      const div = document.createElement("div")
      div.className = "border bg-light p-3 m-3"
      div.innerHTML = `
          <h3>${companyList[i].company}</h3>
          <p>${companyList[i].symbol}</p>
          <button class="btn btn-danger">Delete</button>
          <hr class="hr" />
          <p>Income before Taxes Ratio is higher than 20%</p>
          <button class="btn btn-secondary incomeBeforeTaxesBtn">Processing...</button>
          <br>
          <br>
          <p>Current Assets over Total Liabilities is higher than 1</p>
          <button class="btn btn-secondary assetsOverLiabBtn">Processing...</button>
          <br>
          <br>
          <p>Positive average revenue growth over the last 5 years<p>
          <button class="btn btn-secondary revenueGrowthBtn">Processing...</button>
          <br>
      `
      div.querySelector(".btn-danger").addEventListener("click", () => deleteCompany(companyList[i].id))
      companiesContainer.append(div)
  }
  fetchIncomeBeforeTaxesRatio(companyList)
  fetchCurrentAssetOverLiab(companyList)
  revenueGrowthOverFiveYears(companyList)
}

async function fetchCompanyList() {
  const response = await fetch("http://localhost:3000/companies")
  const fetchedCompanies = await response.json()
  companyList = fetchedCompanies
  renderCompanyList()
}
fetchCompanyList()

async function fetchIncomeBeforeTaxesRatio(companyList) {
  for (let i = 0; i < companyList.length; i++) {
    const response = await fetch(`https://financialmodelingprep.com/api/v3/income-statement/${companyList[i].symbol}?period=annual&apikey=${API_KEY}`)
    const data = await response.json()
    const incomeBeforeTaxRatio = (data[0].incomeBeforeTaxRatio)
    const buttons = document.getElementsByClassName("incomeBeforeTaxesBtn");
      if(incomeBeforeTaxRatio >= .20) {
      buttons[i].className = "btn btn-success incomeBeforeTaxesBtn";
      buttons[i].innerHTML = "Pass"
      } else {
      buttons[i].className = "btn btn-danger incomeBeforeTaxesBtn";
      buttons[i].innerHTML = "Fail"
        }
  }
}

async function fetchCurrentAssetOverLiab(companyList) {
  for (let i = 0; i < companyList.length; i++) {
    const response = await fetch (`https://financialmodelingprep.com/api/v3/balance-sheet-statement/${companyList[i].symbol}?period=annual&apikey=${API_KEY}`)
    const data = await response.json()
    const totalCurrentAssets = (data[0].totalCurrentAssets)
    const totalLiabilities = (data[0].totalLiabilities)
    const buttons = document.getElementsByClassName("assetsOverLiabBtn");
      if((totalCurrentAssets/totalLiabilities) > 1) {
        buttons[i].className = "btn btn-success assetsOverLiabBtn";
        buttons[i].innerHTML = "Pass"
        } else {
        buttons[i].className = "btn btn-danger assetsOverLiabBtn";
        buttons[i].innerHTML = "Fail"
      }    
  }
}

async function revenueGrowthOverFiveYears(companyList) {
  for (let i = 0; i < companyList.length; i++) {
    const response = await fetch (`https://financialmodelingprep.com/api/v3/income-statement/${companyList[i].symbol}?period=annual&apikey=${API_KEY}`)
    const data = await response.json()
    let growthRates = [];
    for (let i = 0; i < data.length - 1; i++) {
      let growthRate = (data[i].revenue - data[i + 1].revenue) / data[i + 1].revenue;
      growthRates.push(growthRate);
    }
    let totalGrowthRate = growthRates.reduce((a, b) => a + b, 0);
    let averageGrowthRate = totalGrowthRate / growthRates.length;
    const buttons = document.getElementsByClassName("revenueGrowthBtn")
      if(averageGrowthRate > 0) {
        buttons[i].className = "btn btn-success revenueGrowthBtn";
        buttons[i].innerHTML = "Pass"
        } else {
        buttons[i].className = "btn btn-danger revenueGrowthBtn";
        buttons[i].innerHTML = "Fail"
      }
  }
}


const companiesContainer = document.getElementById("companies-container")
const companyInput = document.getElementById("company-input")
const symbolInput = document.getElementById("symbol-input")
   
async function createCompany(event) {
    event.preventDefault()
    const newCompanyData = {
        company: companyInput.value,
        symbol: symbolInput.value
    }
    companyInput.value = ""
    symbolInput.value = ""
    const response = await fetch("http://localhost:3000/companies", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(newCompanyData)
    })
    const createdCompanyWithId = await response.json()
    companyList.push(createdCompanyWithId)

    renderCompanyList()
}

/*

const incomeStatement=`https://financialmodelingprep.com/api/v3/income-statement/${symbol}?period=annual&apikey=${API_KEY}`;
const companyProfile=`https://financialmodelingprep.com/api/v3/profile/${symbol}?apikey=${API_KEY}`;
const cashFlowStatement=`https://financialmodelingprep.com/api/v3/cash-flow-statement/${symbol}?period=annual&apikey=${API_KEY}`;
const executivesDetails = `https://financialmodelingprep.com/api/v3/key-executives/${symbol}?apikey=${API_KEY}`
const dividendPayout = `https://financialmodelingprep.com/api/v3/historical-price-full/stock_dividend/${symbol}?apikey=${API_KEY}`
const balanceSheet = `https://financialmodelingprep.com/api/v3/balance-sheet-statement/${symbol}?period=annual&apikey=${API_KEY}`

fetch(companyProfile)
  .then((response) => response.json())
  .then((data) => {
    const ipoTimestamp = Date.parse(data[0].ipoDate);
    const nowTimestamp = Date.now();
    const twentyfiveYearsAgoTimestamp = new Date();
    twentyfiveYearsAgoTimestamp.setFullYear(twentyfiveYearsAgoTimestamp.getFullYear() - 25);
    const differenceIPO = nowTimestamp - ipoTimestamp;
    const differenceTwentyfiveYears = nowTimestamp - twentyfiveYearsAgoTimestamp.getTime();
    console.log(`Company is at least 25 years old: ${differenceIPO > differenceTwentyfiveYears}`);
    const companyCountry = data[0].country
    console.log(`Company is domestic: ${companyCountry === "US"}`)
  })

  fetch(cashFlowStatement)
  .then((response) => response.json())
  .then((data) => {
    let growthRates = [];

    for (let i = 0; i < Math.min(data.length - 1, 4); i++) {
      let growthRate = (data[i].freeCashFlow - data[i + 1].freeCashFlow) / data[i + 1].freeCashFlow;
      growthRates.push(growthRate);
    }

    let totalGrowthRate = growthRates.reduce((a, b) => a + b, 0);
    let averageGrowthRate = totalGrowthRate / growthRates.length;

    console.log(`Average free cash flow growth over the last five years has been greater than 5%: ${averageGrowthRate > .05}`);
  })

  fetch(executivesDetails)
    .then((response) => response.json())
    .then((data) => {
      const execTimestamp = Date.parse(data[0].titleSince);
      const tenYearsAgoTimestamp = new Date();
      tenYearsAgoTimestamp.setFullYear(tenYearsAgoTimestamp.getFullYear() - 10);
      const differenceExec = nowTimestamp - execTimestamp;
      const differenceTenYears = nowTimestamp - tenYearsAgoTimestamp.getTime();
      console.log(`CEO has been in position for at least 10 years: ${differenceExec >= differenceTenYears}`)
    })

  fetch(dividendPayout)
    .then((response) => response.json())
    .then((data) => {
      const dividendPay = data.historical[0].dividend;
      console.log(`Company has a positive dividend payout: ${dividendPay > '0'}`)
    })


/* 

----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

Plan for this screener:
  1. Domestic Stock
  2. Positive dividend payout
  XXXX Before taxes profit margin is over .20
  XXXX Current assets/total liabilities are over or equal to 1
  5 Average free cashflow growth rate over last 5 years is over .05 by calculating as such:
    - Averaging the growth rate for each year over a 5 year period.
  6. Current Price/Safe intrinsic value is under 70 AND Safe intrinsic value greater than 0.
    ~ Safe Intrinsic value calculated by (1 - Margin of safety(50%)) multiplied by Intrinsic value per share 
      * Intrinsic value per share calculated by total intrinsic value/Total shares outstanding
        ^ Intrinsic value is calculated by adding terminal value to the total calculated 10 year projected growth value of free cash flow result.
          _ Terminal value is calculated by taking the tenth year Free cash flow and multiplying it by (1 + Terminal growth number (1%)) and dividing that product by (Terminal growth subtracted from Discount Rate (current treasury note yield)) and dividing that result by tenth year (1+r)
          _ Total calculated 10 year projected growth value of free cash flow result is calculated by adding all ten year intrinsic value growth results together.
            + Each individual intrinsic value growth result year is calculated by taking the current free cash flow and adding it to (itself multiplied by a growth rate) and dividing it by the first
            (1+r (1.03)) for the first year, then for each year afterward, taking the prior year's free cash flow and adding it by (itself multiplied by the growth rate) and dividing it by the next calculated (1+r (taking the prior year's 1+r and multiplying it by the discount rate))
            (making sure to change any starting negatives for free cashflow to positive free cashflow once growth starts).
              - Growth rate is calculated by taking the last 20 years' free cash flow growth between each year and conducting an average that removes the 33% outliers from the dataset
            - current free cash flow is calculated by using the most recent free cash flow reported amount
  7. IPO > 25 years
  8. CEO > 10 years
  XXXX Positive average revenue growth - 5 years


  Not part of screener:
  Use other screener to find top 5 in an industry
  Value line- Industry to last a long time (high rated in Value Line analysis)
  Other research - Management that focuses on owners

*/