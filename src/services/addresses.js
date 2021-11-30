export const addresses = {
    97: {
        TacoController: '0x1377d26E4f427739c0498E748f747f8063Bd675b',
        TacoHelper: '0xD440248530B4eea0bF7990BC5BCa01A82E4d398a',
        WBNB: '0xae13d989dac2f0debff460ac112a837c89baa7cd',
        ETH: '0x8babbb98678facc7342735486c851abd7a0d17ca',
        BUSD: '0x78867bbeef44f2326bf8ddd1941a4439382ef2a7',
        IndexFunds: ['0x0A497e7fbbE566c96949f7589d4f3C69eF4A8bdC']
        },
    56: {
         TacoController: '0x75F13E89cDDc604cc98945e187E9BFb4D5f50D60',
         TacoHelper: '0x5c195AB9896d92A6c8d8543f2217A40FeB6Ffa42',
        IndexFunds: ['0x6d359406166061cB652F323d08350aB560F774eC']
        },
};

export const getAddresses = () => {
    try{
        return addresses[process.env.REACT_APP_NETWORK_ID];
    } catch {
        return [];
    }

}