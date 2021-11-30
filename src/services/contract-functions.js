import { AbiCoder } from "@ethersproject/abi";
import { BigNumber, formatFixed, parseFixed } from "@ethersproject/bignumber";
import { Contract } from "@ethersproject/contracts";
import { getAddresses } from "./addresses";
import * as ControllerABI from './abi/TacoController.json';
import * as HelperABI from './abi/TacoHelper.json';
import * as FundABI from './abi/IndexFundV1.json';
import * as ERC20ABI from './abi/ERC20.json';


const EXTRACT_ERROR_MESSAGE = /(?<="message":")(.*?)(?=")/g;
const zeroAddress = '0x0000000000000000000000000000000000000000';
const MaxInt256 = (BigNumber.from("0x7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff"));

/*
 *
 *  helper functions
 *
 */

function catchError(error) {
  console.error(error.message);

  // try to extract error message, otherwise return raw error
  let formatted_error;

  if (error.message.startsWith("invalid ENS name")) {
    formatted_error = "Missing or invalid parameter.";
  } else if (error.message.startsWith("invalid BigNumber string")) {
    formatted_error = "Invalid number parameter."
  } else {
    try {
      let errors = JSON.stringify(error).match(EXTRACT_ERROR_MESSAGE);
      formatted_error = errors[errors.length - 1];
    } catch (e) {
      formatted_error = error.message;
    }
  }

  return formatted_error;
}

// Helper function to prevent ambiguous failure message when dates aren't passed
function convertToZeroIfBlank(num) {
  return parseInt(num) || 0;
}

function toUnixTime(date) {
  // Return date if not a Date object
  if (Object.prototype.toString.call(date) !== "[object Date]") return date;
  return parseInt((date.getTime() / 1000).toFixed(0));
}

export async function getBlockNumber(w3provider) {
  return w3provider.getBlockNumber();
}

export function encodeParameters(types, values) {
  let abi = new AbiCoder();
  return abi.encode(types, values);
}

export function decodeParameters(types, values) {
  let abi = new AbiCoder();
  return abi.decode(types, values);
}

export function formatDate(timestamp) {
  if (timestamp === 0) {
    return "None";
  } else {
    return (new Date(timestamp * 1000)).toLocaleString();
  }
}

// Contract Functions

// READ FUNCTIONS
// TODO: adapt to decimals other than 18
export async function getFundTokens(w3provider, fundAddr) {
  let contract = new Contract(fundAddr, FundABI.abi, w3provider);
  let tokens;
  try {
    tokens = await contract.tokens();
  } catch (error) {
    console.log(error.message);
    tokens = [];
  }
  return tokens;
}

// Converted is bool to decide if converted to satoshis or returned as raw BigNumber
export async function getTotalReserves(w3provider, fundAddr, converted) {
  let contract = new Contract(fundAddr, FundABI.abi, w3provider);
  let reserves = [];
  try {
    reserves = await contract.getTotalReserves();
  } catch (error) {
    console.log(error.message);
    return reserves;
  }
  if(converted){
    let convert = [];
    for(let tok of reserves){
      convert.push(formatFixed(tok, 18).toString());
    }
    return convert;
  }
  return reserves;
}

export async function getFundUnitPrice(w3provider, fundAddr, converted) {
  let contract = new Contract(fundAddr, FundABI.abi, w3provider);
  let price = [];
  try {
    price = await contract.lastUnitPrices();
  } catch (error) {
    console.log(error.message);
    return price;
  }
  if(converted){
    let convert = [];
    for(let tok of price){
      convert.push(formatFixed(tok, 18).toString());
    }
    return convert;
  }
  return price;
}

export async function getTokenInfo(w3provider, tokenAddr) {
  let contract = new Contract(tokenAddr, ERC20ABI.abi, w3provider);
  let name;
  let symbol;
  try {
    name = await contract.name();
    symbol = await contract.symbol();
  } catch (error) {
    console.log(error.message);
    name = '';
    symbol = '';
  }
  return {name: name, symbol: symbol};
}

export async function getTokenBalance(w3provider, tokenAddr, accountAddr) {
  let contract = new Contract(tokenAddr, ERC20ABI.abi, w3provider);
  let balance;
  try {
    let tok = await contract.balanceOf(accountAddr);
    balance = await BigNumber.from(tok.toString());
  } catch (error) {
    console.log(error.message)
    balance = await BigNumber.from(0);
  }
  return formatFixed(balance, 18);
}

export async function getTokenSupply(w3provider, tokenAddr, converted) {
  let contract = new Contract(tokenAddr, ERC20ABI.abi, w3provider);
  let balance;
  try {
    let tok = await contract.totalSupply();
    balance = await BigNumber.from(tok.toString());
  } catch (error) {
    console.log(error.message)
    balance = await BigNumber.from(0);
  }
  if(converted) return formatFixed(balance, 18);
  return balance;
}

export async function getTokenAllowance(w3provider, tokenAddr, accountAddr, spenderAddr) {
  let contract = new Contract(tokenAddr, ERC20ABI.abi, w3provider);
  let balance;
  try {
    let tok = await contract.allowance(accountAddr, spenderAddr);
    balance = await BigNumber.from(tok.toString());
  } catch (error) {
    console.log(error.message)
    balance = await BigNumber.from(0);
  }
  return formatFixed(balance, 18);
}

export async function getFundFor(w3provider, helperAddr, tokenArray) {
  let contract = new Contract(helperAddr, HelperABI.abi, w3provider);
  let address;
  try {
    address = await contract.fundFor(tokenArray);
  } catch (error) {
    console.log(error.message)
    address = zeroAddress
  }
  return address;
}

export async function getEthBal(w3provider, accountAddr) {
  let balance;
  try {
    let bal = await w3provider.getBalance(accountAddr);
    balance = await BigNumber.from(bal.toString());
  } catch (error) {
    console.log(error.message)
    balance = await BigNumber.from(0);
  }
  return formatFixed(balance, 18);
}

export async function estimateFundEth(w3provider, helperAddr, fundAddr, ethAmount) {
  let contract = new Contract(helperAddr, HelperABI.abi, w3provider);
  let amount = parseFixed(ethAmount.toString(), 18);
  let requiredAmounts=[];
  let fundAmount=0;
  try {
    let res = await contract.getAmountsInForETH(fundAddr, amount.toString());
    for(let tok of res[0]){
      let convert = formatFixed(tok, 18).toString();
      requiredAmounts.push(convert);
    }
    fundAmount = res[1];
  } catch (error) {
    console.log(error.message)
  }
  let obj = {required: requiredAmounts, fundA: formatFixed(fundAmount, 18).toString()};
  return obj;
}

export async function estimateFundValue(w3provider, fundAddr, fundAmount, converted) {
  let amount = parseFixed(fundAmount.toString(), 18);
  let expectedAmounts=[];
  // Get fund reserves
  let reserves = await getTotalReserves(w3provider, fundAddr, false);
  if (reserves === []) return [];
  // Get Fund Supply
  let totalSupply = await getTokenSupply(w3provider, fundAddr, false);
  if (totalSupply.toString() === '0') return [];
  // funDAMount * reserve[token] /TotalSupply
  for(let tok of reserves){
    let am = amount.mul(tok).div(totalSupply);
    expectedAmounts.push(am);
  }
  if(converted) {
    let conv = [];
    for(let tok of expectedAmounts){
      conv.push(formatFixed(tok, 18).toString());
    }
    return conv;
  }
  return expectedAmounts;
}

export async function getAmountsIn(w3provider, fundAddr, fundAmount, converted) {
  let amount = parseFixed(fundAmount.toString(), 18);
  let amountsIn=[];
  let contract = new Contract(fundAddr, FundABI.abi, w3provider);
  try{
    amountsIn = await contract.estimateAmountIn(amount);
  } catch (error) {
    console.log(error);
    return [];
  }
  if(converted) {
    let conv = [];
    for(let tok of amountsIn){
      conv.push(formatFixed(tok, 18).toString());
    }
    return conv;
  }
  return amountsIn;
}

export async function getAmountsOut(w3provider, fundAddr, tokenAmounts, converted) {
  let convTokenAmounts = [];
  for(let tok of tokenAmounts){
    convTokenAmounts.push(parseFixed(tok.toString(), 18));
  }
  let amountOut;
  let contract = new Contract(fundAddr, FundABI.abi, w3provider);
  try{
    amountOut = await contract.estimateAmountOut(convTokenAmounts);
  } catch (error) {
    console.log(error);
    amountOut = BigNumber.from(0);
  }
  if(converted) {
    return (formatFixed(amountOut, 18).toString());
  }
  return amountOut;
}

// STATE-CHANGE FUNCTIONS

// Lower slippage applied on fundAmount
export async function buyFund(w3provider, helperAddr, fundAddr, fundAmount, slippage, to, deadline) {
  // Validate fund address
  let tokens = await getFundTokens(w3provider, fundAddr);
  if(tokens === []) return "ERROR: Invalid fund address";
  let addr = await getFundFor(w3provider, helperAddr, tokens);
  if(fundAddr !== addr){
    return "ERROR: Invalid fund address";
  }
  // Get latest estimations
  let amountsIn = await getAmountsIn(w3provider, fundAddr, fundAmount, false);
  if (amountsIn === []) return "ERROR: Insufficient amounts";
  // Calculate slippage
  let fundAmountBN = parseFixed(fundAmount.toString(), 18);
  let slippedFundAmount = fundAmountBN.mul(1000-5).div(1000);
  // Calculate deadine
  let timestamp = Math.floor(Date.now() / 1000) + deadline;
  // Prepare for sending tx
  let contract = new Contract(helperAddr, HelperABI.abi, w3provider);
  let signer = w3provider.getSigner();
  let signed = await contract.connect(signer);
  let tx;
  try {
    console.log(tokens, slippedFundAmount.toString(), amountsIn.toString(), to, timestamp)
    tx = await signed.buyFund(tokens, slippedFundAmount, amountsIn, to, timestamp);
  } catch (error) {
    let errM = catchError(error);
    console.log(errM);
    return `ERROR: ${errM}`;
  }
  return tx;
}

// Upper slippage on amountEth. Slippage should be in number (5 = 0.05%)
export async function buyFundEth(w3provider, helperAddr, fundAddr, ethAmount, slippage, to, deadline) {
  // Validate fund address
  let tokens = await getFundTokens(w3provider, fundAddr);
  if(tokens === []) return "ERROR: Invalid fund address";
  let addr = await getFundFor(w3provider, helperAddr, tokens);
  if(fundAddr !== addr){
    return "ERROR: Invalid fund address";
  }
  // Get latest estimations
  let amount = parseFixed(ethAmount.toString(), 18);
  let estimateResult;
  let contract = new Contract(helperAddr, HelperABI.abi, w3provider);
  try {
    estimateResult = await contract.getAmountsInForETH(fundAddr, amount.toString());
  } catch (error) {
    console.log(error.message)
    return `ERROR: ${error.message}`;
  }
  // Calculate slippage
  let slippedEthAmount = amount.mul(1000+5).div(1000);
  // Calculate deadine
  let timestamp = Math.floor(Date.now() / 1000) + deadline;
  // Prepare for sending tx
  let signer = w3provider.getSigner();
  let signed = await contract.connect(signer);
  let tx;
  try {
    console.log(tokens, estimateResult[0].toString(), estimateResult[1].toString(), to, timestamp, slippedEthAmount.toString())
    tx = await signed.buyFundETH(tokens, estimateResult[0], estimateResult[1], to, timestamp, {value: slippedEthAmount});
  } catch (error) {
    let errorTx = catchError(error);
    console.log(errorTx);
    return `ERROR: ${errorTx}`;
  }
  return tx;
}

// Lower slippage applied to minFunds. Must be at least 1 (0.01%) because of possible withdrawFees from vault protocols like Venus
export async function sellFund(w3provider, helperAddr, fundAddr, fundAmount, slippage, to, deadline) {
  // Validate fund address
  let tokens = await getFundTokens(w3provider, fundAddr);
  if(tokens === []) return "ERROR: Invalid fund address";;
  let addr = await getFundFor(w3provider, helperAddr, tokens);
  if(fundAddr !== addr){
    return "ERROR: Invalid fund address";
  }
  // Get latest estimations
  let estimateResult = await estimateFundValue(w3provider, fundAddr, fundAmount, false);
  if(estimateResult === []) return "ERROR: Invalid fund amounts";
  // Calculate slippage
  for(let i=0; i<estimateResult.length; i++){
    estimateResult[i] = estimateResult[i].mul(1000-slippage).div(1000);
  }
  // Calculate deadline
  let timestamp = Math.floor(Date.now() / 1000) + deadline;
  // Prepare for sending tx
  let contract = new Contract(helperAddr, HelperABI.abi, w3provider);
  let amount = parseFixed(fundAmount.toString(), 18);
  let signer = w3provider.getSigner();
  let signed = await contract.connect(signer);
  let tx;
  try {
    console.log(tokens, amount, estimateResult.toString(), to, timestamp);
    tx = await signed.sellFund(tokens, amount, estimateResult, to, timestamp);
  } catch (error) {
    let errM = catchError(error);
    console.log(errM);
    return `ERROR: ${errM}`;
  }
  return tx;
}

export async function approve(w3provider, token,  user, spender, toZero) {
  let signer = w3provider.getSigner();
  let contract = new Contract(token, ERC20ABI.abi, w3provider);
  let signed = await contract.connect(signer);
  let tx;
  try {
    if(toZero){
      tx = await signed.approve(spender, 0);
    }
    else{
      tx = await signed.approve(spender, MaxInt256);
    }
  } catch (error) {
    let errorText = catchError(error);
    return("ERROR: " + errorText);
  }
  return tx;
}

