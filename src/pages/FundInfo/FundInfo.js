import React, {useState, useEffect, useCallback} from "react";
import {
    getTokenAllowance, getFundTokens, getTokenBalance, getTokenInfo, approve, getAmountsIn
} from "services/contract-functions";
import BuyETH from 'components/BuyETH/BuyETH'
import Sell from 'components/Sell/Sell'
import Buy from 'components/Buy/Buy'
import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import Link from '@material-ui/core/Link';
import ListItemText from '@material-ui/core/ListItemText';
import Modal from '@material-ui/core/Modal';
import Backdrop from '@material-ui/core/Backdrop';
import Fade from '@material-ui/core/Fade';
import {useParams} from "react-router-dom";
import { getAddresses } from "services/addresses";
import {fetchPrice, fetchIndexPrice} from "helpers/fetchPrice";
import { useSnackbar } from 'notistack';
import {handleTransaction, INFO_SNACK} from "services/utils";


const useStyles = makeStyles((theme) => ({
    root: {
        display: 'flex',
        flexWrap: 'wrap',
    },
    margin: {
        margin: theme.spacing(1),
    },
    withoutLabel: {
        marginTop: theme.spacing(3),
    },
    textField: {
        width: '25ch',
    },
    modal: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    paper: {
        backgroundColor: theme.palette.background.paper,
        border: '2px solid #000',
        boxShadow: theme.shadows[5],
        padding: theme.spacing(2, 4, 3),
    }
}));

export default function FundInfo({ provider, signedInAddress}) {
    const { enqueueSnackbar } = useSnackbar();
    const classes = useStyles();
    let { address } = useParams();
    const addressList = getAddresses();
    const [balance, setBalance] = useState({balance: '0', tokenValue: []});
    const [balances, setBalances] = useState([]);
    const [fundUnitPrice, setFundUnitPrice] = useState('0.0');
    const [tokens, setTokens] = useState([]);
    const [symbols, setSymbols] = useState({id: ''});
    const [fetchingTokens, setFetchingTokens] = useState(false);
    const [open, setOpen] = React.useState(false);
    const [isApproved, setIsApproved] = useState(false);
    const [isPending, setIsPending] = useState(false);

    const handleOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const handleApprove = async(addr, isZero) => {
        enqueueSnackbar("Please accept transaction on Wallet", INFO_SNACK);
        let tx = await approve(provider, addr, signedInAddress, addressList.TacoHelper, isZero);
        await handleTransaction(tx, enqueueSnackbar, fetchBalances, setIsPending);
    }

    const fetchBalances = useCallback(async () => {
        console.log("parent fetchBalances");
        let balances = [];
        // Fetch fund Balance
        let fundBal = await getTokenBalance(provider, address, signedInAddress);
        // Fetch token details
        let tokensFund = await getFundTokens(provider, address);
        let fundSymbols = '';
        for(let tokenOf of tokensFund) {
            let tokenInfo = await getTokenInfo(provider, tokenOf);
            // console.log();
            // Allowances
            let allowance = await getTokenAllowance(provider, tokenOf, signedInAddress, addressList.TacoHelper);
            let tokenBalance = await getTokenBalance(provider, tokenOf, signedInAddress);
            fundSymbols += tokenInfo.symbol + "-";
            let value = (await fetchPrice({ id: tokenInfo.symbol }))*Number(tokenBalance);
            let tokenData = {
                address: tokenOf,
                symbol: tokenInfo.symbol,
                name: tokenInfo.name,
                balance: tokenBalance.toString(),
                allowance: allowance.toString(),
                value: value.toFixed(2)
            };
            balances.push(tokenData);
        }
        let isAllow = true;
        let allowances = balances.map(a => a.allowance);
        if(allowances.length === 0 ) isAllow=false;
        for(let allow of allowances) {
            if(Number(allow) === 0.0) {
                isAllow=false;
                break;
            }
        }
        fundSymbols = fundSymbols.slice(0, -1);
        let unitPrice = (await fetchIndexPrice({w3:provider, fAddr:address, id:fundSymbols}))*Number(fundBal);
        let val = await getAmountsIn(provider, address, fundBal, true);
        let symb = fundSymbols.split('-');
        if(symb.length === val.length){
            for (let i=0; i<symb.length; i++){
                symb[i] = val[i] + " " + symb[i]
            }
        }
        setIsApproved(isAllow);
        setBalance({
            balance: fundBal.toString(),
            tokenValue: symb
        });
        setBalances(balances);
        setSymbols({id: fundSymbols});
        setTokens(tokensFund);
        setFundUnitPrice(unitPrice.toFixed(2));
        setFetchingTokens(false);
    }, [provider, signedInAddress, addressList, address]);

    // If address and provider detected then fetch balances
    useEffect(() => {
        if (provider && signedInAddress) {
            if (!fetchingTokens) {
                setFetchingTokens(true);
                fetchBalances();
            }
        }
    }, [provider, signedInAddress]);

    return (
        <div style={{ fontFamily: 'All Round Gothic !important'}}>
            <Typography variant="h5" >
                Index Fund {symbols.id}
            </Typography>
            <Typography  >
                <Link href={`https://bscscan.com/token/${address}`} color="inherit" target="_blank"  rel="noreferrer">
                    address: {address}
                </Link>
            </Typography>
            <Typography  >
                fund Balance: {balance.balance} (${fundUnitPrice})
            </Typography>
            {Number(balance.balance) > 0 &&
                <Typography  >
                    your balance Underlying Value: {balance.tokenValue.toString()}
                </Typography>
            }
            <Typography  >
                token balances:
            </Typography>
            <List className={classes.root} >
                {balances.map((token) => (
                    <ListItem key={token.address}>
                        <ListItemText primary={`${token.symbol} ${token.balance}`} secondary={`${token.value} $`} />
                        {(Number(token.allowance)===0) ?
                        <Button onClick={() => handleApprove(token.address, false)} disabled={isPending}>Approve</Button>
                            :
                            <Button onClick={() => handleApprove(token.address, true)} disabled={isPending}>Remove Approve</Button>
                        }
                    </ListItem>
                ))}
            </List>
            <Button onClick={handleOpen} style={{ color: 'white', fontFamily: 'All Round Gothic'}} disabled={!isApproved || isPending}>
                Buy Fund with Exact Tokens...
            </Button>
            <Modal
                aria-labelledby="transition-modal-title"
                aria-describedby="transition-modal-description"
                className={classes.modal}
                open={open}
                onClose={handleClose}
                closeAfterTransition
                BackdropComponent={Backdrop}
                BackdropProps={{
                    timeout: 500,
                }}
            >
                <Fade in={open}>
                    <div className={classes.paper}>
                        <Buy
                            provider={provider}
                            signedInAddress={signedInAddress}
                            fundAddr={address}
                            symbols={symbols}
                            tokenBalances={balances}
                            isApproved={isApproved}
                            parentCallback={fetchBalances}
                        />
                    </div>
                </Fade>
            </Modal>
            <div style={{ display:'flex', flexDirection: 'row', justifyContent: 'space-around'}} >
                <BuyETH
                    provider={provider}
                    signedInAddress={signedInAddress}
                    fundAddr={address}
                    symbols={symbols}
                    parentCallback={fetchBalances}/>
                <Sell
                    provider={provider}
                    signedInAddress={signedInAddress}
                    fundAddr={address}
                    symbols={symbols}
                    parentCallback={fetchBalances}/>
            </div>

        </div>

    )
}
