import React from "react";
import useWeb3Modal from "hooks/useWeb3Modal";
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import NavigationBar from "components/NavigationBar/NavigationBar";
import FundsList from "pages/FundsList/FundsList";
import Fund from "pages/Fund/Fund"
import { SnackbarProvider } from 'notistack';
import { initializePriceCache } from 'helpers/fetchPrice';
import Slide from '@material-ui/core/Slide';
import './App.css'


function App() {
  const [provider, loadWeb3Modal, logoutOfWeb3Modal, signedInAddress] = useWeb3Modal();
  initializePriceCache();
  return (
    <div className="fill-window" >
        <div className="global-background bg-dim full-bg-size"  >

        <SnackbarProvider   maxSnack={1} anchorOrigin={{vertical: 'top', horizontal: 'center',}} TransitionComponent={Slide}>
            <Router>
                <NavigationBar
                    provider={provider}
                    loadWeb3Modal={loadWeb3Modal}
                    logoutOfWeb3Modal={logoutOfWeb3Modal}
                    signedInAddress={signedInAddress}
                    />
                <Switch>
                    <Route exact path="/">
                        <FundsList provider={provider} signedInAddress={signedInAddress} />
                    </Route>
                    <Route path="/fund">
                        <Fund provider={provider} signedInAddress={signedInAddress}/>
                    </Route>
                </Switch>
            </Router>
        </SnackbarProvider>
                    </div>
    </div>
  );
}

export default App;
