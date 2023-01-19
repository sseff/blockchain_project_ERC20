import {React, useState, useEffect} from 'react'
import {BigNumber, ethers} from 'ethers'
import styles from './Wallet.module.css'

const Interactions = (props) => {
    const [transferHash, setTransferHash] = useState(null);
    const [isProjectFunded, setisProjectFunded] = useState(null);
    const [projectNextPayment, setprojectNextPayment] = useState(null);
    const [projectOwner, setprojectOwner] = useState(null);
    const [projectHash, setprojectHash] = useState(null);
    const [projectPaySchedule, setprojectPaySchedule] = useState([null]);
    const [projectPaymentAmounts, setprojectPaymentAmounts] = useState([null]);
    const [projectVoteDeadline, setprojectVoteDeadline] = useState(null);
    const [noOfProjectProposals, setnoOfProjectProposals] = useState(null);
    const [noOfFundedProposals, setnoOfFundedProposals] = useState(null);
    const [etherReceivedByProject, setetherReceivedByProject] = useState(null);
    const [noOfSurveys, setnoOfSurveys] = useState(null);
    const [surveyResults, setSurveyResults] = useState([null]);
    const [surveyHash, setSurveyHash] = useState([null]);
    const [surveyinfo, setSurveyinfo] = useState(null);
    const [surveyowner, setSurveyowner] = useState(null);
    const [memberNumber, setMemberNumber] = useState(null);

    const GL = 550000;
    const glOverride = {gasLimit:GL};

    const donateEtherHandler = async (e) => {
        e.preventDefault();
        let amount = e.target.donateEtherAmount.value;
        let tx = await props.contract.donateEther({value:amount, gasLimit:GL});
        console.log(tx.hash);

    }
    const transferHandler = async (e) => {
        e.preventDefault();
        let transferAmount = e.target.sendAmount.value;
        let receiverAddress = e.target.receiverAddress.value;

        let txt = await props.contract.transfer(receiverAddress, transferAmount, glOverride);
        setTransferHash(txt.hash);
    }

    const submitProposalHandler = async (e) => {
        e.preventDefault();
        let ipfshash = e.target.ipfshash.value;
        let deadline = e.target.deadline.value;
        let paymentamounts = e.target.paymentamounts.value.split(",").map(Number);
        let payschedule = e.target.paymentdeadlines.value.split(",").map(Number);
        let amount = e.target.submitProposalEtherAmount.value;
        console.log(ipfshash, deadline, paymentamounts, payschedule, amount);
        let tx = await props.contract.submitProjectProposal(ipfshash, deadline, paymentamounts, payschedule, {value:amount, gasLimit: GL});
        console.log(tx);

    }

    const delegateVoteToHandler = async (e) => {
        e.preventDefault();
        let address = e.target.memberaddress.value;
        let id = e.target.projectid.value;

        await props.contract.delegateVoteTo(address, id, glOverride);
    }

    const submitSurveyHandler = async (e) => {
        e.preventDefault();
        let ipfshash = e.target.ipfshash.value;
        let deadline = parseInt(e.target.deadline.value);
        let numchoices = parseInt(e.target.numchoices.value);
        let atmost = parseInt(e.target.atmostchoices.value);
        let amount = e.target.amount.value;
        console.log(ipfshash, deadline, numchoices, atmost, amount);
        let tx = await props.contract.submitSurvey(ipfshash, deadline, numchoices, atmost, {value:amount, gasLimit: GL});
        console.log(tx);
    }

    const voteForProposalHandler = async (e) => {
        e.preventDefault();

        let id = e.target.id.value;
        let vote = e.target.vote.value;
        let Vote = false;
        if(vote == 1){
            Vote = true;
        }
        await props.contract.voteForProjectProposal(id, Vote, glOverride);
    }
    const voteForPaymentHandler = async (e) => {
        e.preventDefault();

        let id = e.target.id.value;
        let vote = e.target.vote.value;
        let Vote = false;
        if(vote == 1){
            Vote = true;
        }
        await props.contract.voteForProjectPayment(id, Vote, glOverride);
    }

    const takeSurveyHandler = async (e) => {
        e.preventDefault();
        let id = e.target.id.value;
        let choices = e.target.choices.value.split(",").map(Number);
        console.log(choices);
        await props.contract.takeSurvey(id, choices, glOverride);
    }
    const reserveGrantHandler = async (e) => {
        e.preventDefault();
        let id = e.target.id.value;
        await props.contract.reserveProjectGrant(id, glOverride);
    }
    const withdrawPaymentHandler = async (e) => {
        e.preventDefault();
        let id = e.target.id.value;
        await props.contract.withdrawProjectPayment(id, glOverride);
    }


    const isProjectFundedViewer = async (e) => {
        e.preventDefault();
        let id = e.target.projectid.value;
        id=parseInt(id);
        let tx = await props.contract.getIsProjectFunded(id);
        if(tx){
            setisProjectFunded("Yes");
        }
        else{
            setisProjectFunded("No");
        }
    }
    const ProjectNextPaymentViewer = async (e) => {
        e.preventDefault();
        let id = e.target.projectid.value;
        id=parseInt(id);
        let tx = await props.contract.getProjectOwner(id);
        if(tx == "0x0000000000000000000000000000000000000000"){
            tx = "No such project!";
        }
        else{
            tx = await props.contract.getProjectNextPayment(id);
            tx = tx.toNumber();
            console.log(tx);
        }
        setprojectNextPayment(tx);
    }
    const ProjectOwnerViewer = async (e) => {
        e.preventDefault();
        let id = e.target.projectid.value;
        id=parseInt(id);
        let tx = await props.contract.getProjectOwner(id);
        if(tx == "0x0000000000000000000000000000000000000000"){
            tx = "No such project!";
        }
        setprojectOwner(tx);
    }
    const ProjectInfoViewer = async (e) => {
        e.preventDefault();
        let id = e.target.projectid.value;
        id=parseInt(id);
        let tx = await props.contract.getProjectInfo(id);
        setprojectHash(tx[0]);
        let deadline = tx[1].toNumber();
        setprojectVoteDeadline(deadline);
        setprojectPaySchedule(tx[2].toString());
        setprojectPaymentAmounts(tx[3].toString());
    }
    const noOfProjectProposalsViewer = async (e) => {
        e.preventDefault();
        let countBigNumber = await props.contract.getNoOfProjectProposals();
        let count = countBigNumber.toNumber();
        setnoOfProjectProposals(count);
    }
    const noOfFundedProposalsViewer = async (e) => {
        e.preventDefault();
        let countBigNumber = await props.contract.getNoOfFundedProjects();
        let count = countBigNumber.toNumber();
        setnoOfFundedProposals(count);
    }
    const etherReceivedByProjectViewer = async (e) => {
        e.preventDefault();
        let id = e.target.projectid.value;
        id=parseInt(id);
        let tx = await props.contract.getEtherReceivedByProject(id);
        tx = tx.toNumber();
        setetherReceivedByProject(tx);
    }
    const noOfSurveysViewer = async (e) => {
        e.preventDefault();
        let countBigNumber = await props.contract.getNoOfSurveys();
        let count = countBigNumber.toNumber();
        setnoOfSurveys(count);
    }
    const noOfMembersViewer = async (e) => {
        e.preventDefault();
        let memberNum = await props.contract.getNoOfMembers();
        memberNum = memberNum.toNumber();
        setMemberNumber(memberNum);
    }
    const SurveyOwnerViewer = async (e) => {
        e.preventDefault();
        let surveyId = e.target.surveyid.value;
        surveyId = parseInt(surveyId);
        let surveyOwn = await props.contract.getSurveyOwner(surveyId);
        if(surveyOwn == "0x0000000000000000000000000000000000000000"){
            surveyOwn = "No such survey!";
        }
        setSurveyowner(surveyOwn);
    }
    const SurveyInfoViewer = async (e) => {
        e.preventDefault();
        let surveyId = e.target.surveyid.value;
        let tx = await props.contract.getSurveyInfo(surveyId);
        let ipfshash = "IPFS Hash: " + tx[0];
        let surveyDeadline = tx[1];
        let numchoices = tx[2].toNumber();
        let atmost = tx[3].toNumber();
        let info = "Survey Deadline: " + surveyDeadline + "\nNumber of Choices: " + numchoices + "\nAt Most Choice: " + atmost;
        setSurveyHash(ipfshash);
        setSurveyinfo(info);
    }
    const SurveyResultsViewer = async (e) => {
        e.preventDefault();
        let surveyId = e.target.surveyid.value;
        let surveyOwn = await props.contract.getSurveyOwner(surveyId);
        if(surveyOwn == "0x0000000000000000000000000000000000000000"){
            setSurveyResults("No such survey!");
        }
        else{
            let tx = await props.contract.getSurveyResults(surveyId);
            let numtaken = tx[0];
            let results = tx[1];
            let str = "Number of voters taken: " + numtaken + "\nResults: " + results;
            setSurveyResults(str);
        }
    }

    return (
        <div className={styles.interactionsCard}>

            <div class="column"></div>
            <form onSubmit={donateEtherHandler}>
                <h3>Donate Ethers:</h3>   
                <a>Ether Amount in Wei:</a>
                <input type='number' id='donateEtherAmount'/>
                <button type='submit' className={styles.button6}>Donate</button>
            </form>


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
            <form onSubmit={submitSurveyHandler}>
                <h3>Submit Survey:</h3>
                <a>IPFS Hash:</a>
                <input type='text' id='ipfshash'/>
                <a><br></br></a>
                <a>Survey Deadline:</a>
                <input type='number' id='deadline'/>
                <a><br></br></a>
                <a>Number of Choices:</a>
                <input type='number' id='numchoices'/>
                <a><br></br></a>
                <a>At Most Choices:</a>
                <input type='number' id='atmostchoices'/>
                <a><br></br></a>

                <a>Ether Amount in Wei:</a>
                <input type='number' id='amount'/>
                <a><br></br></a>
                <button type='submit' className={styles.button6}>Submit</button>
                {/* <a>  response**</a> */}
            </form>

            <form onSubmit={delegateVoteToHandler}>
                <h3>Delegate Vote To:</h3>
                <a>Member Address:</a>
                <input type='text' id='memberaddress'/>
                <a><br></br></a>
                <a>Project ID:</a>
                <input type='number' id='projectid'/>
                <a><br></br></a>
                <button type='submit' className={styles.button6}>Submit</button>
                {/* <a>  response**</a> */}
            </form>

            <form onSubmit={voteForProposalHandler}>
                <h3>Vote For Project Proposal:</h3>
                <a><br></br></a>
                <a>Project ID:</a>
                <input type='number' id='id'/>
                <a>Vote:</a>

                {/* <div onChange={this.onChangeValue}>
                    <input type="radio" value="Yes" id="vote" />Yes
                    <input type="radio" value="No" id="vote" />No
                </div> */}

                <input type='number' id='vote'/>
                <a><br></br></a>
                <button type='submit' className={styles.button6}>Submit</button>
                {/* <a>  response**</a> */}
            </form>

            <form onSubmit={voteForPaymentHandler}>
                <h3>Vote For Project Payment:</h3>
                <a><br></br></a>
                <a>Project ID:</a>
                <input type='number' id='id'/>
                <a>Vote:</a>
                <input type='number' id='vote'/>
                <a><br></br></a>
                <button type='submit' className={styles.button6}>Submit</button>
                {/* <a>  response**</a> */}
            </form>

            <form onSubmit={takeSurveyHandler}>
                <h3>Take Survey:</h3>
                <a><br></br></a>
                <a>Survey ID:</a>
                <input type='number' id='id'/>
                <a>Choices:</a>
                <input type='text' id='choices'/>
                <button type='submit' className={styles.button6}>Submit</button>
                {/* <a>  response**</a> */}
            </form>

            <form onSubmit={reserveGrantHandler}>
                <h3>Reserve Project Grant:</h3>
                <a><br></br></a>
                <a>Project ID:</a>
                <input type='number' id='id'/>
                <a><br></br></a>
                <button type='submit' className={styles.button6}>Submit</button>
                {/* <a>  response**</a> */}
            </form>

            <form onSubmit={withdrawPaymentHandler}>
                <h3>Withdraw Project Payment:</h3>
                <a><br></br></a>
                <a>Project ID:</a>
                <input type='number' id='id'/>
                <a><br></br></a>
                <button type='submit' className={styles.button6}>Submit</button>
                {/* <a>  response**</a> */}
            </form>






            <div>
            <h3>View Functions:</h3>
            <form onSubmit={isProjectFundedViewer}>
                <a>See if a project is funded by giving its project id:</a>
                <input type='number' id='projectid'/>
                <button type='submit' className={styles.button6}>✔</button>
                <a>  {isProjectFunded}</a>
            </form>
            <form onSubmit={ProjectNextPaymentViewer}>
                <a>Get project's next payment by giving its project id:</a>
                <input type='number' id='projectid'/>
                <button type='submit' className={styles.button6}>✔</button>
                <a>  {projectNextPayment}</a>
            </form>
            <form onSubmit={ProjectOwnerViewer}>
                <a>Get project's owner by giving its project id:</a>
                <input type='number' id='projectid'/>
                <button type='submit' className={styles.button6}>✔</button>
                <a> <br></br> {projectOwner}</a>
            </form>
            <form onSubmit={ProjectInfoViewer}>
                <a>Get project's info by giving its project id:</a>
                <input type='number' id='projectid'/>
                <button type='submit' className={styles.button6}>✔</button>
                <a> <br></br> IPFS Hash: {projectHash} <br></br> Voting Deadline: {projectVoteDeadline}</a>
                <a> <br/> Payment Amounts: {projectPaymentAmounts} <br></br> Payment Schedule: {projectPaySchedule}</a>
            </form>
            <form onSubmit={noOfProjectProposalsViewer}>
                <a>Get number of project proposals: </a>
                <button type='submit' className={styles.button6}>✔</button>
                <a>  {noOfProjectProposals}</a>
            </form>
            <form onSubmit={noOfFundedProposalsViewer}>
                <a>Get number of funded proposals: </a>
                <button type='submit' className={styles.button6}>✔</button>
                <a>  {noOfFundedProposals}</a>
            </form>
            <form onSubmit={etherReceivedByProjectViewer}>
                <a>Get project's total amount of ethers received by giving its project id:</a>
                <input type='number' id='projectid'/>
                <button type='submit' className={styles.button6}>✔</button>
                <a>  {etherReceivedByProject}</a>
            </form>
            <form onSubmit={noOfSurveysViewer}>
                <a>Get number of submitted surveys: </a>
                <button type='submit' className={styles.button6}>✔</button>
                <a>  {noOfSurveys}</a>
            </form>
            <form onSubmit={noOfMembersViewer}>
                <a>Get number of members:</a>      
                <button type='submit' className={styles.button6}>✔</button> 
                <a>{memberNumber}</a>
            </form>
            <form onSubmit={SurveyOwnerViewer}>
                <a>Get survey owner by its id:</a>          
                <input type='number' id='surveyid'/>
                <button type='submit' className={styles.button6}>✔</button> 
                <a><br></br> {surveyowner}</a>
            </form>
            <form onSubmit={SurveyInfoViewer}> 
                <a>Get survey information by its id:</a>          
                <input type='number' id='surveyid'/>
                <button type='submit' className={styles.button6}>✔</button> 
                <a><br></br> {surveyHash}<br></br> {surveyinfo}</a>
            </form>
            <form onSubmit={SurveyResultsViewer}>     
                <a>Get survey results by its id</a>          
                <input type='number' id='surveyid'/>
                <button type='submit' className={styles.button6}>✔</button> 
                <a><br></br>{surveyResults}</a>
            </form>

        </div>
        </div>
    );

}

export default Interactions;