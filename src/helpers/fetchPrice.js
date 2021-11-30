import axios from 'axios';

import { getNetworkTokens } from './getNetworkData';
import {getFundPrice} from "services/utils";


const t = () => Math.trunc(Date.now() / (5 * 60 * 1000));

const endpoints = {
  coingecko: 'https://api.coingecko.com/api/v3/simple/price',
};

const tokens = getNetworkTokens();

const CACHE_TIMEOUT_MS = 1 * 60 * 1000; // 1 minute(s)
const priceCache = {
  cache: new Map(),
  lastUpdated: undefined,
};

function isCached(id) {
  return priceCache.cache.has(id);
}

function getCachedPrice(id) {
  return priceCache.cache.get(id);
}

function maybeUpdateCache() {
  const currentTimestamp = new Date();
  if (
    priceCache.lastUpdated &&
    currentTimestamp.getTime() > priceCache.lastUpdated.getTime() + CACHE_TIMEOUT_MS
  ) {
    initializePriceCache();
  }
}

const fetchCoingecko = async ids => {
  try {
    const response = await axios.get(endpoints.coingecko, {
      params: { ids: ids.join(','), vs_currencies: 'usd' },
    });
    const prices = {};
    for (let id in response.data) {
      prices[id] = response.data[id].usd;
    }
    return prices;
  } catch (err) {
    console.error(err);
    return {};
  }
};

const fetchTokens = async () => {
  try {
    const response = await axios.get(`https://apy-api.herokuapp.com/prices`);
    return response.data;
  } catch (err) {
    console.error(err);
    return {};
  }
};

const fetchLPs = async () => {
  try {
    const response = await axios.get(`https://apy-api.herokuapp.com/lps`);
    return response.data;
  } catch (err) {
    console.error(err);
    return {};
  }
};

const fetchFunds = async () => {
  try {
    const response = await axios.get(`https://apy-api.herokuapp.com/lps`);
    return response.data;
  } catch (err) {
    console.error(err);
    return {};
  }
};

const oracleEndpoints = {
  coingecko: ids => fetchCoingecko(ids),
  tokens: () => fetchTokens(),
  lps: () => fetchLPs(),
  // soon: fetch indexfunds
};

let pricesLoadedPromise;
export function whenPricesLoaded() {
  return pricesLoadedPromise;
}

export function initializePriceCache() {
  const currentTimestamp = new Date();
  priceCache.lastUpdated = currentTimestamp;

  const oracleToIds = new Map();
  tokens.forEach(tokens => {
    if (!oracleToIds.has('tokens')) {
      oracleToIds.set('tokens', []);
    }
    oracleToIds.get('tokens').push(tokens.symbol);
  });

  const promises = [...oracleToIds.keys()].map(key => oracleEndpoints[key](oracleToIds.get(key)));
  pricesLoadedPromise = Promise.all(promises).then(results => {
    const allPrices = results.reduce(
      (accPrices, curPrices) => ({ ...accPrices, ...curPrices }),
      {}
    );
    [...oracleToIds.values()].flat().forEach(id => priceCache.cache.set(id, allPrices[id]));
  });
}

export const fetchPrice = ({ id }) => {
  if (id === undefined) {
    console.error('Undefined pair');
    return 0;
  }

  maybeUpdateCache();

  return getCachedPrice(id) || 0;
};

export const fetchIndexPrice = async({ id, w3, fAddr}) => {
  if (id === undefined) {
    console.error('Undefined pair');
    return 0;
  }

  if(getCachedPrice(id) === undefined) {
    let price = await getFundPrice(w3, fAddr, id);
    priceCache.cache.set(id, price.toFixed(2));
  }

  return getCachedPrice(id) || 0;
};
