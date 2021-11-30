import { BigNumber, formatFixed, parseFixed } from "@ethersproject/bignumber";
import {getFundUnitPrice} from './contract-functions';
import {fetchPrice} from "helpers/fetchPrice";
import { getNetworkCoin } from 'helpers/getNetworkData';

export const SUCCESS_SNACK = {variant: "success"};
export const ERROR_SNACK = {variant: "error"};
export const MESSAGE_SNACK = {variant: "default"};
export const INFO_SNACK = {variant: "info"};


const zeroAddress = '0x0000000000000000000000000000000000000000';
const MaxInt256 = (BigNumber.from("0x7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff"));

// Functions that mix external apis/services with contract calls. Usually called from different components

export async function getFundPrice(w3provider, fundAddr, symbols) {
  let unitPrices = await getFundUnitPrice(w3provider, fundAddr, true);
  let symbolArr = symbols.split('-');
  let totalPrice = 0;
  if(symbolArr.length === unitPrices.length){
    for (let i=0; i<symbolArr.length; i++){
      let unitPrice = await fetchPrice({id: symbolArr[i]});
      totalPrice += unitPrice*Number(unitPrices[i]);
    }
  }
  return totalPrice;
}

export async function getNativeCoinPrice() {
  let coin = getNetworkCoin();
  return await fetchPrice({id:coin.wrappedSymbol});
}

//
export async function handleTransaction(tx, onEventSnack, onSuccess, isPending){
  console.log(tx);
  onEventSnack("Sending transaction...", MESSAGE_SNACK);
  isPending(true);
  if(typeof tx === 'string' || tx instanceof String ){
    if(tx.startsWith("ERROR")){
      console.log(tx);
    }
    onEventSnack(tx, ERROR_SNACK);
    isPending(false);
  }
  else if(tx === undefined){
    console.log("parameter error");
    onEventSnack(tx, "Unknown Error", ERROR_SNACK);
    isPending(false);
  }
  else if(typeof tx === 'boolean'){
    if(!tx){
      onEventSnack("Unknown Error", ERROR_SNACK);
      isPending(false);
    }
  }
  else{
    tx.wait().then(function(receipt) {
      console.log('Transaction success! ', receipt);
      onEventSnack('Transaction success! ' + receipt.transactionHash, SUCCESS_SNACK);
      isPending(false);
      onSuccess();
    });
  }


}

