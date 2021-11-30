import React from "react";
import FundFinder from "components/FundFinder/FundFinder";
import FundInfo from "pages/FundInfo/FundInfo";
import {Switch, Route } from 'react-router-dom';



export default function Fund({ provider, signedInAddress}) {
    return (
        <>
            <Switch>
                <Route exact path='/fund'>
                    <FundFinder provider={provider}/>
                </Route>
                <Route path='/fund/:address'>
                    <FundInfo provider={provider} signedInAddress={signedInAddress}/>
                </Route>
            </Switch>
        </>

    )
}
