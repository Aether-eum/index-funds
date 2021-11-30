import React, { useState, useEffect } from "react";
import {
    getFundFor,
} from "services/contract-functions";
import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import Input from '@material-ui/core/Input';
import TextField from '@material-ui/core/TextField';


import {useHistory} from "react-router-dom";
import { getAddresses } from "services/addresses";

const useStyles = makeStyles((theme) => ({
    root: {
        display: 'flex',
        flexWrap: 'wrap',
        border: '1px solid rgba(255, 255, 255, 0.3)',
        boxShadow: '0 1px 50px 0 rgba(0, 0, 0, 0.1)',
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
    btn: {
      color: 'white',
      width: '150px',
      height: '50px',
      border: '1px solid rgba(255, 255, 255, 0.3)',
      borderRadius: '36px',
      margin: 10
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
}));

export default function FundFinder({ provider}) {
    const history = useHistory();
    const classes = useStyles();
    const addresList = getAddresses();
    const [temp, setTemp] = useState('');
    const [foundAddr, setFoundAddr] = useState('0x0000000000000000000000000000000000000000');
    const [errorIn, setErrorIn] = useState('');

    const handleChange =  (event) => {
        setTemp(event.target.value);
    };

    const handleClick = (index) =>  {
        history.push(`/fund/${index}`);
    }

    const validateAddr = async() => {
        try {
            console.log(temp);
            let addressArr = temp.split(",");
            console.log(addressArr);
            setErrorIn('');
            if(!addresList.TacoHelper) {
                return;
            }
            console.log(addressArr);
            let result = await getFundFor(provider, addresList.TacoHelper, addressArr);
            setFoundAddr(result);
        }
        catch(e){
           setErrorIn('Invalid array of addresses');
        }
    }

    // async function fundFor() {
    //     if(!addresList.TacoHelper) {
    //         return;
    //     }
    //     console.log('FundFor');
    //     console.log(addresses);
    //     let result = await getFundFor(provider, addresList.TacoHelper, addresses);
    //     setFoundAddr(result);
    // }
    return (
        <div style={{ fontFamily: 'All Round Gothic !important'}} className="fonts-all" >
            <Typography variant="h5" >
                Index Fund Finder
            </Typography>
            <Typography variant="caption" >
                Please enter coin addresses separated by commas(",")
            </Typography>
            <Card className={classes.root} style={{  borderRadius: '10px 10px 0px 0px', borderBottom: 'none' }}>
                <TextField
                    label="Addresses"
                    style={{ margin: 8 }}
                    placeholder="[address1,address2,address3...]"
                    // helperText="Full width!"
                    fullWidth
                    margin="normal"
                    InputLabelProps={{
                        shrink: true,
                    }}
                    variant="outlined"
                    value={temp}
                    onChange={handleChange}
                    {...(errorIn !=='' ? {error:true, helperText:errorIn} : {error:false})}
                />
                <CardContent>
                    {/*<FormControl fullWidth className={classes.margin}>*/}
                    {/*    <InputLabel >Addresses</InputLabel>*/}
                    {/*    <TextField*/}
                    {/*        fullWidth*/}
                    {/*        value={temp}*/}
                    {/*        onChange={handleChange}*/}
                    {/*        {...(errorIn !=='' ? {error:true, helperText:errorIn} : {error:false})}*/}
                    {/*    />*/}
                    {/*</FormControl>*/}

                    <CardActions>
                        <Button
                        className={[classes.btn, classes.glass]}
                            onClick={validateAddr}
                        >Find Index Fund</Button>
                    </CardActions>

                </CardContent>

            </Card>

            <Card className={classes.root} style={{  borderRadius: '0px 0px 10px 10px',  borderTop: 'none' }} >
                <CardContent>
                    <Typography variant="h6" >
                        Found address: {foundAddr}
                    </Typography>
                    <Button
                    className={[classes.btn, classes.glass]}
                        onClick={() => handleClick(foundAddr)}
                        disabled={foundAddr==='0x0000000000000000000000000000000000000000'}
                    >Go to Fund</Button>
                </CardContent>
            </Card>
        </div>

    )
}
