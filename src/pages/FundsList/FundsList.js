import React, { useState, useEffect, useCallback } from "react";
import { useHistory, Link } from "react-router-dom";
import {
    getTokenInfo,
    getTokenBalance,
    getFundTokens,
} from "services/contract-functions";
import {fetchIndexPrice} from "helpers/fetchPrice";
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import CardActionArea from '@material-ui/core/CardActionArea';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import { getAddresses } from "services/addresses";
import { makeStyles } from '@material-ui/core/styles';
import Backdrop from "@material-ui/core/Backdrop";
import Fade from "@material-ui/core/Fade";
import BuyETH from "components/BuyETH/BuyETH";
import Sell from "components/Sell/Sell";
import Modal from "@material-ui/core/Modal";

import BlueChip from '../../assets/img/blueChip.svg'
import Binance from '../../assets/img/binance.svg'

const useStyles = makeStyles((theme) => ({
    root: {
        fontFamily: 'All Round Gothic !important',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
        width: '425px',
        height: '300px',
        border: '1px solid rgba(255, 255, 255, 0.3)',
        borderRadius: '34px',
        boxShadow: '0 4px 100px 0 rgba(0, 0, 0, 0.1)',
        backdropFilter: 'blur(12px)',
        color: 'white',
        background: '-moz-linear-gradient(45deg, rgba(255,255,255,0.0) 0%, rgba(255,255,255,0.35) 49%)',
        background: '-webkit-linear-gradient(45deg, rgba(255,255,255,0.0) 0%, rgba(255,255,255,0.35) 49%',
        background: 'linear-gradient(45deg, rgba(255,255,255,00) 0%, rgba(255,255,255,0.35) 49%)',
        filter: 'progid:DXImageTransform.Microsoft.gradient(startColorstr="#ffffff",endColorstr="#ffffff",GradientType=1)',
        marginBottom: '20px'
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
        fontFamily: 'All Round Gothic',
        width: '150px',
        height: '50px',
        borderRadius: '36px',
        boxShadow: '0 7px 20px 0 rgba(0, 0, 0, 0.25)',
        background:"linear-gradient(45deg, rgba(244,187,110,1) 0%, rgba(237,93,121,1) 49%)","filter":"progid:DXImageTransform.Microsoft.gradient(startColorstr=\"#f4bb6e\",endColorstr=\"#ed5d79\",GradientType=1)"
    },
    sell: {
        color: 'white',
        width: '150px',
        height: '50px',
        border: '1px solid rgba(255, 255, 255, 0.3)',
        borderRadius: '36px',
    },
    endButton : {
        border: '2px solid'
    },
    modal: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    paper: {
        padding: theme.spacing(2, 4, 3),
    },
    coins: {
        flexDirection: 'row !imoprtant',
        fontSize: '30px',
        textAlign: 'center !imoprtant',
        paddingTop: '10px',
        alignItems: 'center',
        justifyContent: 'center !important',
        alignContent: 'center !important',
    },
    backdrop: {
        zIndex: theme.zIndex.drawer + 1,
        color: 'red',
        background: 'rgba(0,0,0,0.3)',
        backdropFilter: 'blur(8px)'
      },
}));

function FundListElements({ fundBalances, provider, signedInAddress, fetch }) {
    const history = useHistory();
    const classes = useStyles();
    const [open, setOpen] = React.useState(false);
    const [isBuy, setIsBuy] = React.useState(true);


    async function handleClick(index) {
        history.push(`/fund/${index}`);
        // alert(index);
    }

    const handleOpen = (isBuy) => {
        setIsBuy(isBuy);
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    return fundBalances.map((index) =>
        <div key={index.address} style={{ fontFamily: 'All Round Gothic !important', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-around' }} >
            {/* CARD HERE */}
            <Card className={classes.root} style={{ fontFamily: 'All Round Gothic !important' }} > 
                <CardActionArea onClick={() => handleClick(index.address)}>
                    <CardContent>
                        <img src={BlueChip} style={{ width: '145px'}} />
                        <Typography className={classes.title} >
                            {index.name}
                        </Typography>

                        <Typography className={classes.pos} >
                            Balance : {index.balance} (${index.value})
                        </Typography>
                        <div className={classes.coins} >
                            <span style={{ fontFamily: 'FAB', padding: '10px' }} >bitcoin</span>
                            <span style={{ fontFamily: 'FAB', padding: '10px' }} >ethereum</span>
                            <img src={Binance} style={{ width: '35px', marginBottom: '-5px', paddingLeft: '10px' }}/>
                        </div>
                    </CardContent>
                </CardActionArea>
                <CardActions>
                    <Button size="small" className={classes.buy}  onClick={() => handleOpen(true)}>Buy</Button>
                    <Button size="small" className={[classes.sell, classes.glass, classes.button]} onClick={() => handleOpen(false)}>Sell</Button>
                </CardActions>
            </Card>
            
            
            <Backdrop className={classes.backdrop} open={open} >
            <Modal
                aria-labelledby="transition-modal-title"
                aria-describedby="transition-modal-description"
                className={classes.modal}
                open={open}
                onClose={handleClose}
                closeAfterTransition
                // BackdropComponent={Backdrop}
                // BackdropProps={{
                //     timeout: 500,
                //     filter: 'blur(100px)',
                // }}
            >
                <Fade in={open}>
                    <div className={classes.paper}>
                        {isBuy ?
                            <BuyETH
                                provider={provider}
                                signedInAddress={signedInAddress}
                                fundAddr={index.address}
                                symbols={{id: index.symbols}}
                                parentCallback={fetch}
                            />
                            :
                            <Sell
                                provider={provider}
                                signedInAddress={signedInAddress}
                                fundAddr={index.address}
                                symbols={{id: index.symbols}}
                                parentCallback={fetch}
                            />
                        }
                    </div>
                </Fade>
            </Modal>
            </Backdrop>   
        </div>

    );
}

function FundListRoot({ fundBalances, provider, signedInAddress, fetch }) {
    if (!fundBalances || fundBalances.length === 0) {
        return <p>No IndexFunds found.</p>
    }

    return (
        <ul>
            <FundListElements fundBalances={fundBalances} provider={provider} signedInAddress={signedInAddress} fetch={fetch}/>
        </ul>
    );
}



export default function FundsList({ provider, signedInAddress}) {
    const addresses = getAddresses();
    const history = useHistory();
    const classes = useStyles();
    const [fundBalances, setFundBalances] = useState([]);
    const [fetchingTokens, setFetchingTokens] = useState(false);
    const [error, setError] = useState("");


    const fetchBalances = useCallback(async () => {
        console.log('list callback');
        let fundBalances = [];
        try {
            for (let i = 0; i < addresses.IndexFunds.length; i++) {
                let fundAddr = addresses.IndexFunds[i];
                // Fetch fund Balance
                let fundBal = await getTokenBalance(provider, fundAddr, signedInAddress);
                // Fetch token details
                let tokenDetails = await getFundTokens(provider, fundAddr);
                let fundSymbols = '';
                for(let token of tokenDetails) {
                    let tokenInfo = await getTokenInfo(provider, token);
                    fundSymbols += tokenInfo.symbol + "-";
                }
                fundSymbols = fundSymbols.slice(0, -1);
                let unitPrice = await fetchIndexPrice({id:fundSymbols, w3:provider, fAddr: fundAddr});
                let fundBalance = {
                    address: fundAddr,
                    tokens: tokenDetails,
                    name: "Index Fund Token " + fundSymbols,
                    balance: fundBal.toString(),
                    symbols: fundSymbols,
                    value: (unitPrice*Number(fundBal)).toFixed(2)
                };
                fundBalances.push(fundBalance);
            }

        } catch (error) {
            console.log(error);
            setError("Could not connect to contract on the selected network. Check your wallet provider settings.");
        }

        setFundBalances(fundBalances);
        setError("");
        setFetchingTokens(false);
    }, [provider, signedInAddress, addresses]);

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
        <div style={{ marginRight: '30px', marginLeft: '30px' }} >
            <h1>
                Index Funds
            </h1>
            <FundListRoot fundBalances={fundBalances} provider={provider} signedInAddress={signedInAddress} fetch={fetchBalances}/>
            <Button className={classes.endButton} onClick={() => {history.push(`/fund`)}}>Find Your Fund</Button>
        </div>
    );
}