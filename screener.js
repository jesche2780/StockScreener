const API_KEY = 'D6h5NxSkHrccYbhOa7m6ZuXDgltfNZuJ';

let symbol = prompt(`Input Symbol:`)
let rate = prompt('Current 10-year Treasury Note Rate: ')
//Input into a table on the browser the top five companies of each industry. 
//Change those companies to "symbol" to be input into the script.


const incomeStatement=`https://financialmodelingprep.com/api/v3/income-statement/${symbol}?period=annual&apikey=${API_KEY}`;
const companyProfile=`https://financialmodelingprep.com/api/v3/profile/${symbol}?apikey=${API_KEY}`;
const cashFlowStatement=`https://financialmodelingprep.com/api/v3/cash-flow-statement/${symbol}?period=annual&apikey=${API_KEY}`;
const executivesDetails = `https://financialmodelingprep.com/api/v3/key-executives/${symbol}?apikey=${API_KEY}`

//Grab "0" in "Dividends Historical" for dividend payouts 
//Grab "totalCurrentAssets" current assets/ "totalLiabilities" total liabilities in Balance Sheet Statements

fetch(incomeStatement)
  .then((response) => response.json())
  .then((data) => {
    const incomeOverRevenue = (data[0].incomeBeforeTaxRatio)
  console.log(`Income before taxes over revenue is at least 20%: ${incomeOverRevenue > .19}`)
  })

fetch(incomeStatement)
  .then((response) => response.json())
  .then((data) => {
    let growthRates = [];

    // Calculate the growth rate for each year
    for (let i = 0; i < data.length - 1; i++) {
      let growthRate = (data[i].revenue - data[i + 1].revenue) / data[i + 1].revenue;
      growthRates.push(growthRate);
    }

    // Calculate the average growth rate
    let totalGrowthRate = growthRates.reduce((a, b) => a + b, 0);
    let averageGrowthRate = totalGrowthRate / growthRates.length;

    console.log(`Average revenue growth over the last five years has been positive: ${averageGrowthRate > 0}`);
  })


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

    // Calculate the Free Cashflow growth rate for each year
    for (let i = 0; i < Math.min(data.length - 1, 4); i++) {
      let growthRate = (data[i].freeCashFlow - data[i + 1].freeCashFlow) / data[i + 1].freeCashFlow;
      growthRates.push(growthRate);
    }

    // Calculate the average free cashflow growth rate over the last 10 years
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



/* Plan for this screener:
  XXXX Domestic Stock
  2. Positive dividend payout
  XXXX Before taxes profit margin is over .19
  4. Current assets/total liabilities are over or equal to 1
  XXXX Average free cashflow growth rate over last 5 years is over .05 by calculating as such:
    XXXX Averaging the growth rate for each year over a 5 year period.
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
  XXXX IPO > 25 years
  XXXX CEO > 10 years
  XXXX Positive average revenue growth - 5 years


  Not part of screener:
  Use other screener to find top 5 in an industry
  Value line- Industry to last a long time (high rated in Value Line analysis)
  Other research - Managmeent that focuses on owners

  

*/