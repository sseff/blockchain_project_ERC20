import {React, useState, useEffect} from 'react'
import {ethers} from 'ethers'
import styles from './Wallet.module.css'

const Interactions = (props) => {
    const [transferHash, setTransferHash] = useState(null);
    const [noOfProjectProposals, setnoOfProjectProposals] = useState(null);


    const transferHandler = async (e) => {
        e.preventDefault();
        let transferAmount = e.target.sendAmount.value;
        let receiverAddress = e.target.receiverAddress.value;

        let txt = await props.contract.transfer(receiverAddress, transferAmount);
        setTransferHash(txt.hash);
    }

    const noOfProjectProposalsViewer = async (e) => {
        e.preventDefault();
        let countBigNumber = await props.contract.getNoOfProjectProposals();
        let count = countBigNumber.toNumber();
        setnoOfProjectProposals(count);
    }

    const submitProposalHandler = async (e) => {
        e.preventDefault();
        let ipfshash = e.target.ipfshash.value;
        let deadline = e.target.deadline.value;
        deadline = parseInt(deadline);
        let paymentamounts = e.target.paymentamounts.value.split(",").map(function(item) {
            return parseInt(item, 10);
        });
        let paymentdeadlines = e.target.paymentdeadlines.value.split(",").map(function(item) {
            return parseInt(item, 10);
        });
        let amount = e.target.submitProposalEtherAmount.value;
        console.log(ipfshash, deadline, paymentamounts, paymentdeadlines, amount);
        let tx = await props.contract.submitProjectProposal(ipfshash, deadline, paymentamounts, paymentdeadlines, {value:amount});
        console.log(tx);

    }
    const donateEtherHandler = async (e) => {
        e.preventDefault();
        let amount = e.target.donateEtherAmount.value;
        let tx = await props.contract.donateEther({value:amount});
        console.log(tx.hash);

    }

    return (
        <div className={styles.interactionsCard}>
            {/* take the address and amount to transfer */}
            <form onSubmit={transferHandler}>
                <h3>Transfer MyGov Token:</h3>
                <a>receiver address:</a>
                <input type='text' id='receiverAddress'/>
                <a><br></br></a>
                <a>transfer amount:</a>
                <input type='number' id='sendAmount' min='0'/>
                <a><br></br></a>
                <button type='submit' className={styles.button6}>Send</button>
                <div>
                    {transferHash}
                </div>
            </form>


            <form onSubmit={submitProposalHandler}>
                <h3>Submit Project Proposal:</h3>
                <a>IPFS Hash:</a>
                <input type='text' id='ipfshash'/>
                <a><br></br></a>
                <a>Voting Deadline:</a>
                <input type='number' id='deadline'/>
                <a><br></br></a>
                {/* bunlara uzerine gelince hint ekle virgulle ayrilacak diye */}
                <a>Payment Amounts:</a>
                <input type='text' id='paymentamounts'/>
                <a><br></br></a>
                <a>Payment Deadlines:</a>
                <input type='text' id='paymentdeadlines'/>
                <a><br></br></a>

                {/* burda wei gondermek biraz hamallik gibi?? */}
                <a>Ether Amount in Wei:</a>
                <input type='number' id='submitProposalEtherAmount'/>
                <a><br></br></a>
                <button type='submit' className={styles.button6}>Submit</button>
                {/* <a>  response**</a> */}
            </form>

            <form onSubmit={donateEtherHandler}>
                <h3>Donate Ethers:</h3>   
                <a>Ether Amount in Wei:</a>
                <input type='number' id='donateEtherAmount'/>
                <button type='submit' className={styles.button6}>Donate</button>
            </form>

            <h3>View Functions:</h3>
            <form onSubmit={isProjectFundedViewer}>
                <button type='submit' className={styles.button6}>Proposals Count</button>
                <a>  {noOfProjectProposals}</a>
            </form>
            <form onSubmit={ProjectNextPaymentViewer}>
                <button type='submit' className={styles.button6}>Proposals Count</button>
                <a>  {noOfProjectProposals}</a>
            </form>
            <form onSubmit={ProjectOwnerViewer}>
                <button type='submit' className={styles.button6}>Proposals Count</button>
                <a>  {noOfProjectProposals}</a>
            </form>
            <form onSubmit={ProjectInfoViewer}>
                <button type='submit' className={styles.button6}>Proposals Count</button>
                <a>  {noOfProjectProposals}</a>
            </form>
            <form onSubmit={noOfProjectProposalsViewer}>
                <button type='submit' className={styles.button6}>Proposals Count</button>
                <a>  {noOfProjectProposals}</a>
            </form>
            <form onSubmit={noOfFundedProposalsViewer}>
                <button type='submit' className={styles.button6}>Proposals Count</button>
                <a>  {noOfProjectProposals}</a>
            </form>
            <form onSubmit={etherReceivedByProjectViewer}>
                <button type='submit' className={styles.button6}>Proposals Count</button>
                <a>  {noOfProjectProposals}</a>
            </form>
            <form onSubmit={noOfSurveysViewer}>
                <button type='submit' className={styles.button6}>Proposals Count</button>
                <a>  {noOfProjectProposals}</a>
            </form>
            <form onSubmit={noOfMembersViewer}>
                <button type='submit' className={styles.button6}>Proposals Count</button>
                <a>  {noOfProjectProposals}</a>
            </form>
            <form onSubmit={SurveyOwnerViewer}>
                <button type='submit' className={styles.button6}>Proposals Count</button>
                <a>  {noOfProjectProposals}</a>
            </form>
            <form onSubmit={SurveyInfoViewer}>
                <button type='submit' className={styles.button6}>Proposals Count</button>
                <a>  {noOfProjectProposals}</a>
            </form>
            <form onSubmit={SurveyResultsViewer}>
                <button type='submit' className={styles.button6}>Proposals Count</button>
                <a>  {noOfProjectProposals}</a>
            </form>

        </div>
    );

}

export default Interactions;