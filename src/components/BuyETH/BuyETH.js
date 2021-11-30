import React, {useState, useEffect, useCallback} from "react";
import {
    buyFundEth, getEthBal, estimateFundEth
} from "services/contract-functions";
import {getNativeCoinPrice, handleTransaction, INFO_SNACK} from "services/utils";
import { BigNumber } from "bignumber.js";
import { makeStyles, withStyles } from '@material-ui/core/styles';
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
import { useSnackbar } from 'notistack';
import { getAddresses } from "services/addresses";
import TextField from '@material-ui/core/TextField';
import useLocalSettings from 'hooks/useLocalSettings';


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



const useStyles = makeStyles(() => ({
    root: {
        fontFamily: 'All Round Gothic !important',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
        width: '425px',
        padding: 20,
        border: '1px solid rgba(255, 255, 255, 0.3)',
        borderRadius: '34px',
        boxShadow: '0 4px 100px 0 rgba(0, 0, 0, 0.1)',
        backdropFilter: 'blur(12px)',
        color: 'white',
        background: '-moz-linear-gradient(45deg, rgba(255,255,255,0.0) 0%, rgba(255,255,255,0.2) 49%)',
        background: '-webkit-linear-gradient(45deg, rgba(255,255,255,0.0) 0%, rgba(255,255,255,0.2) 49%',
        background: 'linear-gradient(45deg, rgba(255,255,255,00) 0%, rgba(255,255,255,0.2) 49%)',

    },
    glass: {
        boxShadow: '0 7px 20px 0 rgba(0, 0, 0, 0.25)',
        background: '-moz-linear-gradient(45deg, rgba(255,255,255,0.0) 0%, rgba(255,255,255,0.15) 49%)',
        background: '-webkit-linear-gradient(45deg, rgba(255,255,255,0.0) 0%, rgba(255,255,255,0.15) 49%',
        background: 'linear-gradient(45deg, rgba(255,255,255,00) 0%, rgba(255,255,255,0.15) 49%)',
        filter: 'progid:DXImageTransform.Microsoft.gradient(startColorstr="#ffffff",endColorstr="#ffffff",GradientType=1)'
    },
    buy: {
        color: 'white',
        width: '150px',
        height: '50px',
        border: '1px solid rgba(255, 255, 255, 0.3)',
        borderRadius: '36px'
    }

}));

export default function BuyETH({ provider, signedInAddress, fundAddr, symbols, parentCallback}) {
    const { enqueueSnackbar } = useSnackbar();
    const [getUserSettings] = useLocalSettings();
    const classes = useStyles();
    const addressList = getAddresses();
    const [ethBalance, setEthBalance] = useState({amount: '0.0', value: '0.0'});
    const [settings, setSettings] = useState({ethAmount: '0.0', percentage: 0});
    const [estimateRes, setEstimateRes] = useState({fundA: '0', required: []});
    const [fetchingTokens, setFetchingTokens] = useState(false);
    const [isPending, setIsPending] = useState(false);

    const PrettoSlider = withStyles({
        root: {
          justifyContent: 'center'
        },
        thumb: {
          height: 20,
          width: 20,
          backgroundColor: '#fff',
          border: '2px solid currentColor',
          '&:focus, &:hover, &$active': {
            boxShadow: 'inherit',
          },
        },
        active: {
            marginBottom: 50
        },
        valueLabel: {
          left: 'calc(-50% + 4px)',
          height: 10,
          marginBottom: 50
        },
        track: {
          height: 10,
          borderRadius: 4,
          marginBottom: 50
        },
        rail: {
          height: 10,
          borderRadius: 4,
          marginBottom: 50
        },
      })(Slider);

      const CssTextField = withStyles({
        root: {
          '& label.Mui-focused': {
            color: 'white',
          },
          '& label': {
            color: 'white',
          },
          '& :after': {
            borderBottomColor: 'white',
          },
            '& fieldset': {
              borderColor: 'white',
            },
            '& value': {
                color: 'white'
            }
        },
      })(TextField);


    const handleTx = async() => {
        if(parentCallback){
            parentCallback();
        }
        fetchBalance();
    }

    const percentageToAmount = async(event, newValue) => {
        if (provider && signedInAddress) {
            let ethA;
            if(newValue >= 100){
                ethA = new BigNumber(ethBalance.amount).toFixed(18);
            }
            else{
                ethA = new BigNumber(ethBalance.amount).times(newValue).dividedBy(100).toFixed(8);
            }

            setSettings(prevState => ({
                ...prevState,
                percentage: newValue,
                ethAmount: ethA,
            }));
        }
        // setPercentage(newValue);
    }

    const handleValueChange = (event) => {
        console.log('CHANGED')
        const input = event.target.value.replace(/[,]+/, '').replace(/[^0-9\.]+/, '');
        // Special Case (bug of BigNumber(0.0))
        if(input === "0.0" || "0.00" || "0.000"){
            setSettings(prevState => ({
                ...prevState,
                percentage: 0,
                ethAmount: input,
            }));
            return;
        }
        let amount = new BigNumber(input);
        const total = new BigNumber(ethBalance.amount);
        if (amount.isNaN()) amount = new BigNumber(0);

        amount = amount.decimalPlaces(18);
        if (amount.isGreaterThan(total)) amount = total;

        const sliderInt = total.isZero() ? 0 : amount.times(100).dividedToIntegerBy(total).toNumber();
        setSettings(prevState => ({
            ...prevState,
            percentage: sliderInt,
            ethAmount: amount.toString(),
        }));
    }

    const fetchBalance = useCallback(async () => {
        console.log("buyeth callback");
        // Fetch eth Balance
        let bal = await getEthBal(provider, signedInAddress);
        let ethPrice = await getNativeCoinPrice();
        setEthBalance({
            amount: bal.toString(),
            value: (Number(bal)*ethPrice).toFixed(2)
        });
        setFetchingTokens(false);
    }, [provider, signedInAddress]);

    const fetchEstimate = useCallback(async () => {
        let res = await estimateFundEth(provider, addressList.TacoHelper, fundAddr, settings.ethAmount);
        let symb = symbols.id.split('-');
        if(symb.length === res.required.length){
            for (let i=0; i<symb.length; i++){
                symb[i] = res.required[i] + " " + symb[i]
            }
        }
        setEstimateRes({fundA: res.fundA, required: symb});
    }, [settings, symbols]);

    const handleBuy = async() => {
        let userSettings = getUserSettings();
        enqueueSnackbar("Please accept transaction on Wallet", INFO_SNACK);
        let tx = await buyFundEth(
            provider,
            addressList.TacoHelper,
            fundAddr,
            settings.ethAmount,
            Number(userSettings.slippage),
            signedInAddress,
            Number(userSettings.deadline));
        await handleTransaction(tx, enqueueSnackbar, handleTx, setIsPending);
    }

    useEffect(() => {
        if (provider && signedInAddress) {
            if (!fetchingTokens) {
                setFetchingTokens(true);
                fetchBalance();
            }
        }
    }, [provider, signedInAddress]);


    // When EthAmount changes
    useEffect(() => {

        if (provider && signedInAddress) {
            if(Number(settings.ethAmount) > 0) {
                fetchEstimate();
            }
            else{
                setEstimateRes({fundA:'0', required: []});
            }
        }
    }, [settings.ethAmount, provider, signedInAddress, symbols]);

    return (
        <>
            <Card className={classes.root} >
                <Typography variant="h5" component="h5" gutterBottom>
                    Buy Fund {symbols.id}
                </Typography>
                <CardContent>
                    <Typography variant="h6" >
                        BNB balance: {ethBalance.amount} (${ethBalance.value})
                    </Typography>
                    <CssTextField
                            type="number" 
                            id="discrete-slider"
                            value={settings.ethAmount}
                            onChange={handleValueChange}
                            color='#fff'
                            label='Amount'  
                    >
                        {settings.ethAmount}
                    </CssTextField>
                    <PrettoSlider
                        aria-labelledby="discrete-slider"
                        valueLabelDisplay="auto"
                        marks={marks}
                        min={0}
                        max={100}
                        onChangeCommitted={percentageToAmount}
                        value={settings.percentage}
                    />
                    {Number(settings.ethAmount) > 0 &&
                        <Typography component="div" >
                            <Box fontWeight="fontWeightBold">
                                Estimated Info
                            </Box>
                            <Box>
                                Tokens To Buy: {estimateRes.required.toString()}
                            </Box>
                            <Box>
                                Fund Token to Receive: {estimateRes.fundA.toString()}
                            </Box>
                        </Typography>
                    }
                </CardContent>
                <CardActions>
                    <Button className={[classes.glass, classes.buy]} disabled={Number(settings.ethAmount) === 0 || isPending} onClick={handleBuy}>BUY</Button>
                </CardActions>
            </Card>
        </>

    )
}
