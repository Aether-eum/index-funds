import React, { useState, useEffect } from "react";
import Modal from '@material-ui/core/Modal';
import TextField from '@material-ui/core/TextField';
import InputAdornment from '@material-ui/core/InputAdornment';

import { makeStyles } from '@material-ui/core/styles';

    import useLocalSettings from 'hooks/useLocalSettings';
import {Backdrop, Button} from "@material-ui/core";

const useStyles = makeStyles((theme) => ({
    paper: {
        position: 'absolute',
        width: 400,
        border: '1px solid rgba(255, 255, 255, 0.3)',
        borderRadius: '34px',
        boxShadow: '0 4px 100px 0 rgba(0, 0, 0, 0.1)',
        backdropFilter: 'blur(12px)',
        color: 'white !important',
        background: '-moz-linear-gradient(45deg, rgba(255,255,255,0.0) 0%, rgba(255,255,255,0.2) 49%)',
        background: '-webkit-linear-gradient(45deg, rgba(255,255,255,0.0) 0%, rgba(255,255,255,0.2) 49%',
        background: 'linear-gradient(45deg, rgba(255,255,255,00) 0%, rgba(255,255,255,0.2) 49%)',
        padding: theme.spacing(2, 4, 3),
        right: 10,
        top: 50
    },
    input :{

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
    }
}));

export default function SettingsModal({open, handleClose}) {
    const classes = useStyles();
    const [getUserSettings, setDeadline, setSlippage] = useLocalSettings();
    const [slip, setSlip] = useState('');
    const [dead, setDead] = useState('');

    const handleAuto = () => {
        setSlip("0.01");
    }

    const handleSave = () => {
        let slipV;
        if(Number(slip) === 0 || Number.isNaN(slip)){
            slipV = 0.01;
        }
        else{
            slipV = slip;
        }
        setSlippage(slipV*100);
        let deadV = Math.trunc(dead*60);
        if (deadV === 0) deadV = 60;
        setDeadline(deadV);
        fetchFromLocal();
        handleClose();
    }

    //isSlip false would be isDead
    const handleChange = (event, isSlip) => {
        let max = 180;
        if(isSlip){
            max = 50;
        }
        let input;

        // if slip allow decimals
        if (isSlip){
            input = event.target.value.replace(/[,]+/, '').replace(/[^0-9\.]+/, '');
        }
        else {
            input = event.target.value.replace(/[,]+/, '').replace(/[^0-9]+/, '');
        }

        console.log(input);
        let amount = input;
        if (amount > max) amount = max;


        if(isSlip){
            setSlip(amount);
        } else {
            setDead(amount);
        }

    }

    function fetchFromLocal() {
        let userSettings = getUserSettings();
        console.log(userSettings);
        setSlip((Number(userSettings.slippage)/100).toString());
        setDead((Number(userSettings.deadline)/60).toString());
    }

    useEffect(() => {
        fetchFromLocal();

    }, []);

    return (
        <Modal
            open={open}
            onClose={handleClose}
        >
            <div className={classes.paper}>
                <h2>Transaction settings</h2>
                <div>
                    <TextField
                        label="Slippage Tolerance"
                        className={classes.input}
                        placeholder={'0.01'}
                        value={slip}
                        type={'number'}
                        InputProps={{
                        endAdornment: <InputAdornment position="end">%</InputAdornment>,
                        }}
                        onChange={(e) => {
                            handleChange(e, true);
                        }}
                        {...(Number(slip) === 0 ? {error:true, helperText:"Tx will probably fail"} : {error:false})}
                    />
                    <Button onClick={handleAuto}>
                        Auto
                    </Button>
                </div>
                <div>
                    <TextField
                        label="Transaction deadline"
                        className={classes.input}
                        placeholder={'5'}
                        value={dead}
                        InputProps={{
                            endAdornment: <InputAdornment position="end">minutes</InputAdornment>,
                        }}
                        onChange={(e) => {
                            handleChange(e, false);
                        }}
                        {...(Number(dead) === 0 ? {error:true, helperText:"Tx will fail"} : {error:false})}
                    />
                </div>
                <Button className={[classes.glass, classes.btn]} onClick={handleSave}>
                    Save Changes
                </Button>
            </div>
        </Modal>
    );
};