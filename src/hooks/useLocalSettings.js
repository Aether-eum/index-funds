import React, { useState, useEffect } from 'react';

function useLocalSettings() {

    const setDeadline = (deadline) => {
        localStorage.setItem("deadline", deadline.toString());
    }

    const setSlippage = (slippage) =>  {
        localStorage.setItem("slippage", slippage.toString());
    }

    const setTo = (to) => {
        localStorage.setItem("to", to.toString());
    }

    const getUserSettings = () => {
        let deadline = localStorage.getItem("deadline") || "300";
        let slippage = localStorage.getItem("slippage") || "1";
        return {deadline: deadline, slippage: slippage}
    }

    return [getUserSettings, setDeadline, setSlippage];
}

export default useLocalSettings;