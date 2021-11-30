import { connectors } from 'web3modal';
import WalletConnectProvider from '@walletconnect/web3-provider';

import {
  bscTokenList, nativeCoins
} from 'static';

export const getNetworkCoin = () => {
  return nativeCoins.find(coin => coin.chainId == process.env.REACT_APP_NETWORK_ID);
};


export const getNetworkStables = () => {
  switch (process.env.REACT_APP_NETWORK_ID) {
    case '56':
      return [
        'BUSD',
        'USDT',
        'USDC',
        'DAI',
        'VAI',
        'QUSD',
        'UST',
        'VENUS BLP',
        '3EPS',
        'fUSDT',
        '4BELT',
      ];
    case '128':
      return ['USDT', 'HUSD'];
    case '43114':
      return ['USDT', 'DAI', 'BUSD', 'zDAI', 'zUSDT'];
    case '137':
      return ['USDC', 'USDT', 'maUSDC', 'DAI'];
    case '250':
      return ['USDC', 'USDT', 'DAI', 'fUSDT'];
    default:
      return [];
  }
};

export const getNetworkTokens = () => {
  switch (process.env.REACT_APP_NETWORK_ID) {
    case '56':
      return bscTokenList.tokens;
    case '97':
      // only for dev purposes
      return bscTokenList.tokens;
    default:
      // return bscTokenList.tokens;
      throw new Error(
          `Create Tokenlist for this chainId first.`
      );
  }
};

export const getNetworkConnectors = () => {
  switch (process.env.REACT_APP_NETWORK_ID) {
    case '56':
      return {
        network: 'binance',
        cacheProvider: true,
        providerOptions: {
          injected: {
            display: {
              name: 'Injected',
              description: 'Home-BrowserWallet',
            },
          },
          walletconnect: {
            package: WalletConnectProvider,
            options: {
              rpc: {
                1: 'https://bsc-dataseed.binance.org/',
                56: 'https://bsc-dataseed.binance.org/',
              },
            },
          },
          'custom-binance': {
            display: {
              name: 'Binance',
              description: 'Binance Chain Wallet',
              logo: require(`../images/wallets/binance-wallet.png`),
            },
            package: 'binance',
            connector: async (ProviderPackage, options) => {
              const provider = window.BinanceChain;
              await provider.enable();
              return provider;
            },
          },
          'custom-math': {
            display: {
              name: 'Math',
              description: 'Math Wallet',
              logo: require(`../images/wallets/math-wallet.svg`),
            },
            package: 'math',
            connector: connectors.injected,
          },
          'custom-twt': {
            display: {
              name: 'Trust',
              description: 'Trust Wallet',
              logo: require(`../images/wallets/trust-wallet.svg`),
            },
            package: 'twt',
            connector: connectors.injected,
          },
          'custom-safepal': {
            display: {
              name: 'SafePal',
              description: 'SafePal App',
              logo: require(`../images/wallets/safepal-wallet.svg`),
            },
            package: 'safepal',
            connector: connectors.injected,
          },
        },
      };
    case '128':
      return {
        network: 'heco',
        cacheProvider: true,
        providerOptions: {
          injected: {
            display: {
              name: 'Injected',
              description: 'Home-BrowserWallet',
            },
          },
          walletconnect: {
            package: WalletConnectProvider,
            options: {
              rpc: {
                1: 'https://http-mainnet.hecochain.com',
                128: 'https://http-mainnet.hecochain.com',
              },
            },
          },
          'custom-math': {
            display: {
              name: 'Math',
              description: 'Math Wallet',
              logo: require(`../images/wallets/math-wallet.svg`),
            },
            package: 'math',
            connector: connectors.injected,
          },
        },
      };
    case '43114':
      return {
        network: 'avalanche',
        cacheProvider: true,
        providerOptions: {
          injected: {
            display: {
              name: 'Injected',
              description: 'Home-BrowserWallet',
            },
          },
          walletconnect: {
            package: WalletConnectProvider,
            options: {
              rpc: {
                1: 'https://api.avax.network/ext/bc/C/rpc',
                43114: 'https://api.avax.network/ext/bc/C/rpc',
              },
            },
          },
        },
      };
    case '137':
      return {
        network: 'polygon',
        cacheProvider: true,
        providerOptions: {
          injected: {
            display: {
              name: 'Injected',
              description: 'Home-BrowserWallet',
            },
          },
          walletconnect: {
            package: WalletConnectProvider,
            options: {
              rpc: {
                1: 'https://rpc-mainnet.maticvigil.com/',
                137: 'https://rpc-mainnet.maticvigil.com/',
              },
            },
          },
        },
      };
    case '250':
      return {
        network: 'fantom',
        cacheProvider: true,
        providerOptions: {
          injected: {
            display: {
              name: 'Injected',
              description: 'Home-BrowserWallet',
            },
          },
          walletconnect: {
            package: WalletConnectProvider,
            options: {
              rpc: {
                1: 'https://rpcapi.fantom.network',
                250: 'https://rpcapi.fantom.network',
              },
            },
          },
        },
      };
    case '97':
      return {
        network: 'binance',
        cacheProvider: true,
        providerOptions: {
          chainId: 97,
          injected: {
            display: {
              name: 'Injected',
              description: 'Home-BrowserWallet',
            },
          },
          walletconnect: {
            package: WalletConnectProvider,
            options: {
              rpc: {
                97: 'https://data-seed-prebsc-1-s1.binance.org:8545',
              },
              chainId: 97,
            },
          },
        },
      };
    default:
      return {};
  }
};
