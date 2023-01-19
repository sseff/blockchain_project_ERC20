import {React, useState, useEffect, View} from 'react'
import {ethers} from 'ethers'
import Interactions from './Interactions'
import styles from './Wallet.module.css'
import simple_token_abi from './Contracts/simple_token_abi.json'



const Wallet = () => {
    // deployed contract address, ganache-clib address
    const contractAddress = '0xe206b443EBA1159A1cc24b91cc578A603E905085';
    const [tokenName, setTokenName] = useState("Token");
    const [connectButtonName, setConnectButtonName] = useState("Connect");
    const [error, setError] = useState(null);
    const [defaultAccount, setDefaultAccount] = useState(null);
    const [balance, setBalance] = useState(null);
    const [provider, setProvider] = useState(null);
    const [signer, setSigner] = useState(null);
    const [contract, setContract] = useState(null);

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

    const faucetHandler = async () => {
        await contract.faucet({gasLimit:550000});
    }

    const accountChangedHandler = (newAddress) => {
        setDefaultAccount(newAddress);
        updateEthers();
    }

    const updateEthers = () => {
        //from the read only provider, get the read access
        let tempProvider = new ethers.providers.Web3Provider(window.ethereum);
        //signer is read and write, get the write access
        let tempSigner = tempProvider.getSigner();
        //get the contract
        let tempContract = new ethers.Contract(contractAddress, simple_token_abi, tempSigner);

        setProvider(tempProvider);
        setSigner(tempSigner);
        setContract(tempContract);
    }

    // anytime the contract object changes, we run this
    useEffect(() => {
        if(contract != null){
            updateBalance();
            updateTokenName();
        }
    }, [contract])

    const updateBalance = async () => {
        // await because this is a promise
        let balanceBigNumber = await contract.balanceOf(defaultAccount);
        let balanceNumber = balanceBigNumber.toNumber();
        setBalance(balanceNumber);
        console.log("balanceNumber: ", balanceNumber);
    } 

    const updateTokenName = async () => {
        setTokenName(await contract.name());
    }

    return (
        <div>
            <h1>{tokenName} + ERC-20</h1>
            <button className={styles.button6} onClick={connectWalletHandler}>{connectButtonName}</button>
            <div className={styles.walletCard}>
                <div>
                    <p>Address: {defaultAccount}</p>
                </div>
                <button className={styles.button6} onClick={faucetHandler}>Faucet</button>

                <div>
                    <h2>{tokenName} Balance: {balance}</h2>
                    <button className={styles.button6} onClick={updateBalance}>Refresh Balance</button>
                </div>
                <div>
                    {error}
                </div>
                <Interactions contract= {contract}/>
            </div>
        </div>
    );
}

export default Wallet;