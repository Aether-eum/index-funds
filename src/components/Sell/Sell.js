import React, {useState, useEffect, useCallback} from "react";
import {
    sellFund, estimateFundValue, getTokenBalance, getTokenAllowance, approve
} from "services/contract-functions";
import {handleTransaction, INFO_SNACK} from "services/utils";
import {fetchIndexPrice} from "helpers/fetchPrice";
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
import { getAddresses } from "services/addresses";
import TextField from "@material-ui/core/TextField";
import { useSnackbar } from 'notistack';
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
    sell: {
        color: 'white',
        width: '150px',
        height: '50px',
        border: '1px solid rgba(255, 255, 255, 0.3)',
        borderRadius: '36px'
    }

}));

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
      marginBottom: 50,
      backgroundColor: 'black'
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

export default function Sell({ provider, signedInAddress, fundAddr, symbols, parentCallback}) {
    const classes = useStyles();
    const { enqueueSnackbar } = useSnackbar();
    const [getUserSettings] = useLocalSettings();
    const addressList = getAddresses();
    const [fundBalance, setFundBalance] = useState('0.0');
    const [settings, setSettings] = useState({fundAmount: '0.0', percentage: 0});
    const [unitFundValue, setUnitFundValue] = useState('0.0');
    const [estimateValue, setEstimateValue] = useState([]);
    const [allowance, setAllowance] = useState('0.0');
    const [fetchingTokens, setFetchingTokens] = useState(false);
    const [isPending, setIsPending] = useState(false);

    const handleTx = async() => {
        if(parentCallback){
            parentCallback();
        }
        fetchFundBalance();
    }

    const percentageToAmount = async(event, newValue) => {
        if (provider && signedInAddress) {
            let fundA;
            if(newValue >= 100){
                fundA = new BigNumber(fundBalance).toFixed(18);
            }
            else{
                fundA = new BigNumber(fundBalance).times(newValue).dividedBy(100).toFixed(8);
            }
            setSettings(prevState => ({
                ...prevState,
                percentage: newValue,
                fundAmount: fundA,
            }));
        };
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
        const total = new BigNumber(fundBalance);
        if (amount.isNaN()) amount = new BigNumber(0);

        amount = amount.decimalPlaces(18);
        if (amount.isGreaterThan(total)) amount = total;
        console.log(amount);

        const sliderInt = total.isZero() ? 0 : amount.times(100).dividedToIntegerBy(total).toNumber();
        setSettings(prevState => ({
            ...prevState,
            percentage: sliderInt,
            fundAmount: amount.toString(),
        }));
    }

    const fetchFundBalance = useCallback(async () => {
        console.log("sell callback");
        // Fetch fund Balance
        let bal = await getTokenBalance(provider, fundAddr, signedInAddress);
        // fetch fund allowance
        let allow = await getTokenAllowance(provider, fundAddr, signedInAddress, addressList.TacoHelper);
        // fetch fund's unint price
        let totalPrice = (await fetchIndexPrice({w3: provider, fAddr: fundAddr, id: symbols.id}))*Number(bal);
        setUnitFundValue(totalPrice.toFixed(2));
        setAllowance(allow);
        setFundBalance(bal.toString());
        setFetchingTokens(false);
    }, [provider, signedInAddress]);

    const fetchEstimateValue = useCallback(async () => {
        let res = await estimateFundValue(provider, fundAddr, settings.fundAmount, true);
        let symb = symbols.id.split('-');
        if(symb.length === res.length){
            for (let i=0; i<symb.length; i++){
                symb[i] = res[i] + " " + symb[i]
            }
        }
        setEstimateValue(symb);
    }, [settings.fundAmount]);

    const handleSell = async() => {
        let userSettings = getUserSettings();
        enqueueSnackbar("Please accept transaction on Wallet", INFO_SNACK);
        let tx = await sellFund(
            provider,
            addressList.TacoHelper,
            fundAddr, settings.fundAmount,
            Number(userSettings.slippage),
            signedInAddress,
            Number(userSettings.deadline));
        await handleTransaction(tx, enqueueSnackbar, handleTx, setIsPending);
    }

    const handleApprove = async() => {
        enqueueSnackbar("Please accept transaction on Wallet", INFO_SNACK);
        let tx;
        if(Number(allowance) > 0) {

            tx = await approve(provider, fundAddr, signedInAddress, addressList.TacoHelper, false);
        }
        else {
            tx = await approve(provider, fundAddr, signedInAddress, addressList.TacoHelper, false);
        }
        await handleTransaction(tx, enqueueSnackbar, handleTx, setIsPending);
    }

    // When provider changes
    useEffect(() => {
        if (provider && signedInAddress) {
            if (!fetchingTokens) {
                setFetchingTokens(true);
                fetchFundBalance();
            }
        }
        return () => {
            setFetchingTokens(false);
        };
    }, [provider, signedInAddress, symbols]);


    // When fundAmount is changed
    useEffect(() => {
        if (provider && signedInAddress) {
            if(Number(settings.fundAmount) > 0) {
                fetchEstimateValue();
            }
            else{
                setEstimateValue([]);
            }
        }
    }, [settings.fundAmount, provider, signedInAddress, symbols]);

    return (
            <Card style={{ fontFamily: 'All Round Gothic !important'}} className={classes.root} >
                <Typography variant="h5" gutterBottom>
                    Sell Fund {symbols.id}
                </Typography>
                <CardContent>
                    <Typography variant="h6" >
                        Fund balance: {fundBalance} (${unitFundValue})
                    </Typography>
                    <CssTextField  type="number" id="discrete-slider"
                                value={settings.fundAmount}
                                onChange={handleValueChange}
                                label="Amount"
                    >
                        {settings.fundAmount}
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
                    {Number(settings.fundAmount) > 0 &&
                    <Typography component="div" >
                        <Box fontWeight="fontWeightBold">
                            Estimated Info
                        </Box>
                        <Box>
                            Tokens To Receive: {estimateValue.toString()}
                        </Box>
                    </Typography>
                    }
                </CardContent>
                <CardActions>
                    <Button className={[classes.glass, classes.sell]} disabled={Number(settings.fundAmount) === 0 || Number(allowance) === 0 || isPending} onClick={handleSell}>SELL</Button>
                    <Button className={[classes.glass, classes.sell]} disabled={isPending} onClick={handleApprove}>{Number(allowance)>0 ? 'REMOVE APPROVE' : 'APPROVE'}</Button>
                </CardActions>
            </Card>
    )
}
