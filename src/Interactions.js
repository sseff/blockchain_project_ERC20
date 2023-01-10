import {React, useState, useEffect} from 'react'
import {ethers} from 'ethers'
import styles from './Wallet.module.css'


const Interactions = (props) => {
    const [transferHash, setTransferHash] = useState(null);
    const transferHandler = async (e) => {
        e.preventDefault();
        let transferAmount = e.target.sendAmount.value;
        let receiverAddress = e.target.receiverAddress.value;

        let txt = await props.contract.transfer(receiverAddress, transferAmount);
        setTransferHash(txt.hash);
    }


    return (
        <div className={styles.interactionsCard}>
            {/* take the address and amount to transfer */}
            <form onSubmit={transferHandler}>
                <h2>Transfer ...</h2>
                <p>receiver address</p>
                <input type='text' id='receiverAddress'/>
                <p>send amount</p>
                <input type='number' id='sendAmount' min='0'/>
                <button type='submit' className={styles.button6}>Send</button>
                <div>
                    {transferHash}
                </div>
            </form>
        </div>
    );

}

export default Interactions;