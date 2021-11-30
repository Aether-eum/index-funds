import React, { useState, useEffect } from "react";
import {Link} from 'react-router-dom';
import SettingsModal from "components/SettingsModal/SettingsModal";

import AppBar from '@material-ui/core/AppBar';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import Toolbar from '@material-ui/core/Toolbar';
import SettingsIcon from '@material-ui/icons/Settings';

import { makeStyles } from '@material-ui/core/styles';
import {Typography} from "@material-ui/core";

import metamask from '../../assets/img/metamask.svg'
import './NavigationBar.css'

const useStyles = makeStyles((theme) => ({
    grow: {
        margin: 2,
        width: '100%'
    },
    toolbar: {
        justifyContent: 'space-between',
    },
    link: {
        color: 'white',
        textDecoration: 'none',
        marginRight: 40,
    },
    right: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    left: {
        justifyItems: 'space-around'
    }

}));


function WalletButton({ provider, loadWeb3Modal, logoutOfWeb3Modal }) {
  return (
    <button
        style={{ fontFamily: 'FAS'}}
        className="head-icon"
        color="inherit"
      onClick={() => {
        if (!provider) {
          loadWeb3Modal();
        } else {
          logoutOfWeb3Modal();
        }
      }}
      title={!provider ? 'log': 'logout'}
    >
      {!provider ? 'user': 'user-slash'}
    </button>
  );
}

export default function NavigationBar({ provider, loadWeb3Modal, logoutOfWeb3Modal, signedInAddress}) {
    const classes = useStyles();
    const [open, setOpen] = React.useState(false);

    const handleOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    function truncateAddress(addr) {
        let prefix = addr.substring(0,6);
        let suffix = addr.substring(addr.length - 4);
        return prefix + "..." + suffix;
    }
    return (
        <div className={classes.grow}>
            <AppBar 
                position="static"
                style={{backgroundColor: 'rgba(0,0,0,0)', boxShadow: 'none'}}
            >
                <Toolbar className={classes.toolbar}>
                    <div className={classes.left}>
                        <Link to="/" className={classes.link}>
                            HOME
                        </Link>
                        <Link to="/fund" className={classes.link}>FIND-FUND</Link>
                        <Link to="/fund" className={classes.link}>FAQ</Link>
                    </div>

                    <div className={classes.right} >
                        {provider&&<img src={metamask} alt='metamask' title="Metamask" style={{ width: '30px', padding: '10px' }} />}
                        {(signedInAddress !== "") &&
                        
                        < Typography title={signedInAddress}>
                            {truncateAddress(signedInAddress)}
                        </Typography>
                        }
                        <WalletButton provider={provider} loadWeb3Modal={loadWeb3Modal} logoutOfWeb3Modal={logoutOfWeb3Modal} />
                        <IconButton className={classes.link} color="inherit" onClick={handleOpen}>
                                <SettingsIcon />
                        </IconButton>
                    </div>
                    <SettingsModal open={open} handleClose={handleClose} />
                </Toolbar>

            </AppBar>
        </div>

  )
}
