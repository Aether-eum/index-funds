import React, {useState, useEffect, useCallback} from "react";
import {
    buyFund, getAmountsIn, getAmountsOut
} from "services/contract-functions";
import {handleTransaction, INFO_SNACK} from "services/utils";
import {fetchIndexPrice} from "helpers/fetchPrice";
import { BigNumber } from "bignumber.js";
import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import Slider from '@material-ui/core/Slider';
import ListItemText from '@material-ui/core/ListItemText';
import Box from '@material-ui/core/Box';
import { getAddresses } from "services/addresses";
import TextField from "@material-ui/core/TextField";
import { useSnackbar } from 'notistack';
import useLocalSettings from "hooks/useLocalSettings";

const marks = [
    {
        value: 0,
        label: '0%',
    },
    {
        value: 25,
        label: '25%',
    },
    {
        value: 50,
        label: '50%',
    },
    {
        value: 75,
        label: '75%',
    },
    {
        value: 100,
        label: '100%',
    },
];


const useStyles = makeStyles((theme) => ({
}));

export default function Buy({ provider, signedInAddress, fundAddr, symbols, tokenBalances, isApproved, parentCallback}) {
    const classes = useStyles();
    const addressList = getAddresses();
    const { enqueueSnackbar } = useSnackbar();
    const [getUserSettings] = useLocalSettings();
    // Max amount of Fund that user can buy with tokenBalances
    const [fundLimit, setFundLimit] = useState({amount: '0.0', value:'0.0'});
    // Selected amount
    const [settings, setSettings] = useState({fundAmount: '0.0', percentage: 0});
    const [estimateIn, setEstimateIn] = useState([]);
    const [isPending, setIsPending] = useState(false);
    const [fetchingTokens, setFetchingTokens] = useState(false);

    const handleTx = async() => {
        if(parentCallback){
            parentCallback();
        }
        fetchFundLimit();
    }

    const percentageToAmount = async(event, newValue) => {
        if (provider && signedInAddress) {
            let a;
            if(newValue >= 100){
                a = new BigNumber(fundLimit.amount).toFixed(18);
            }
            else{
                a = new BigNumber(fundLimit.amount).times(newValue).dividedBy(100).toFixed(8);
            }

            setSettings(prevState => ({
                ...prevState,
                percentage: newValue,
                fundAmount: a,
            }));
        }
    }

    const handleValueChange = (event) => {
        const input = event.target.value.replace(/[,]+/, '').replace(/[^0-9\.]+/, '');
        // Special Case (bug of BigNumber(0.0))
        if(input === "0.0" || "0.00" || "0.000"){
            setSettings(prevState => ({
                ...prevState,
                percentage: 0,
                fundAmount: input,
            }));
            return;
        }
        let amount = new BigNumber(input);
        const total = new BigNumber(fundLimit.amount);
        if (amount.isNaN()) amount = new BigNumber(0);

        amount = amount.decimalPlaces(18);
        if (amount.isGreaterThan(total)) amount = total;

        const sliderInt = total.isZero() ? 0 : amount.times(100).dividedToIntegerBy(total).toNumber();
        setSettings(prevState => ({
            ...prevState,
            percentage: sliderInt,
            fundAmount: amount.toString(),
        }));
    }

    const fetchFundLimit = useCallback(async () => {
        console.log("buy callback");
        let bal = await getAmountsOut(provider, fundAddr, tokenBalances.map(a => a.balance), true);
        let unitPrice = await fetchIndexPrice({w3: provider, fAddr: fundAddr, id: symbols.id});
        setFundLimit({
            amount: bal.toString(),
            value: (Number(bal)*unitPrice).toFixed(2)
        });
        setFetchingTokens(false);
    }, [provider, signedInAddress, tokenBalances, symbols]);

    const fetchEstimateIn = useCallback(async () => {
        let res = await getAmountsIn(provider, fundAddr, settings.fundAmount, true);
        let symb = symbols.id.split('-');
        if(symb.length === res.length){
            for (let i=0; i<symb.length; i++){
                symb[i] = res[i] + " " + symb[i]
            }
        }
        setEstimateIn(symb);
    }, [settings.fundAmount, symbols]);

    const handleBuy = async() => {
        let userSettings = getUserSettings();
        enqueueSnackbar("Please accept transaction on Wallet", INFO_SNACK);
        let tx = await buyFund(
            provider,
            addressList.TacoHelper,
            fundAddr,
            settings.fundAmount,
            Number(userSettings.slippage),
            signedInAddress,
            Number(userSettings.deadline));
        await handleTransaction(tx, enqueueSnackbar, handleTx, setIsPending);
    }

    useEffect(() => {
        if (provider && signedInAddress) {
            if (!fetchingTokens && tokenBalances.length > 0) {
                setFetchingTokens(true);
                fetchFundLimit();
            }
        }
    }, [provider, signedInAddress, tokenBalances, symbols]);


    useEffect(() => {
        if (provider && signedInAddress) {
            if(Number(settings.fundAmount) > 0) {
                fetchEstimateIn();
            }
            else{
                setEstimateIn([]);
            }
        }
    }, [settings.fundAmount, provider, signedInAddress, symbols]);

    return (
        <>
            <Card>
                <Typography variant="h5" component="h5" gutterBottom>
                    Buy Fund {symbols.id} with Tokens
                </Typography>
                <CardContent>
                    <Typography variant="h6" >
                        Max Fund to Buy: {fundLimit.amount} (${fundLimit.value})
                    </Typography>
                    <TextField  type="number" id="discrete-slider"
                                value={settings.fundAmount}
                                onChange={handleValueChange}
                    >
                        Amount: {settings.fundAmount}
                    </TextField>
                    <Slider
                        aria-labelledby="discrete-slider"
                        valueLabelDisplay="auto"
                        marks={marks}
                        min={0}
                        max={100}
                        onChangeCommitted={percentageToAmount}
                        value={settings.percentage}
                    />
                    {Number(settings.fundAmount) > 0 &&
                    <Typography component="div" >
                        <Box fontWeight="fontWeightBold">
                            Estimated Info
                        </Box>
                        <Box>
                            Tokens To Spend: {estimateIn.toString()}
                        </Box>
                    </Typography>
                    }
                </CardContent>
                <CardActions>
                    <Button disabled={Number(settings.fundAmount) === 0 || !isApproved || isPending} onClick={handleBuy}>BUY</Button>
                </CardActions>
            </Card>

        </>

    )
}
