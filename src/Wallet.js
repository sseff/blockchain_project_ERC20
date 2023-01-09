import {React, useState, useEffect} from 'react'
import {ethers} from 'ethers'


const Wallet = () => {
    const [tokenName, setTokenName] = useState("Token");
    const [connectButtonName, setConnectButtonName] = useState("Connect");
    const [error, setError] = useState(null);
    const connectWalletHandler = () => {
        if(window.ethereum && window.ethereum.isMetaMask) {
            window.ethereum.request({method: 'eth_requestAccounts'})
            .then(result => {
                accountChangedHandler(result[0]);
                setConnectButtonName("Wallet connected!");
            })
            .catch(error => {
                setError(error.message);
            })
        }
        else {
            console.log("You need to install MetaMask!");
            setError("MetaMask is not installed.")
        }
    }

    const accountChangedHandler = (newAddress) => {
        
    }

    return (
        <div>
            <h1>{tokenName} + "ERC-20</h1>
        </div>
    );
}

export default Wallet;