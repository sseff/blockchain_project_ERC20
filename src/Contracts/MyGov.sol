// SPDX-License-Identifier: MIT
pragma solidity >=0.7.0 <0.9.0;
import "@openzeppelin/contracts@4.8.0/token/ERC20/ERC20.sol";
// MyGov Contract
contract MyGov is ERC20 {
 
   // fixed total supply
   uint tokenSupply = 10000000000;
   // total member count
   uint memberCount = 0;
   // count of all proposals
   uint proposalCount = 0;
   // count of all funded proposals
   uint fundedProjectCount = 0;
   // count of all surveys submitted
   uint surveyCount = 0;
   // if the current stage of the project is paid
   bool currentStagePaid = false;
 
   // Voter struct
   struct Voter {
       bool    voted;                  // if voted is true, that voter has already voted
       address delegate;               // the member that voter has delegated to
       uint    totalVoteAccumulated;   // count of votes that accumulates
       bool    tookFreeToken;          // if the voter has already taken their token from the faucet
       bool    tookPartInSurvey;       // if the voter took part in the current survey
   }
  
   // Proposal struct
   struct  Proposal { 
       string ipfsHash;
       uint    yesVoteCount;           // count of yes answers
       uint    totalVoteCount;         // number of accumulated votes 
       bool    funded;                 // true if the proposal funded
       bool    completed;              // true if the proposal completed
       bool    cancelled;              //true if the project is cancelled at any point
       uint    voteDeadline;           // vote deadline for a voter to vote
       uint    reservedAmount;         // total amount reserved for the project
       address proposer;               // the owner of the proposal
       uint [] paymentAmounts;         // array of payment amounts for the times scheduled
       uint [] paySchedule;            // array of payment times in Unix time
       int    stage;                  // the number of in which payment stage the project is
       uint    fundedAmount;           // total amount of funding done yet
       mapping(address => bool) votes; // the addresses of the voters and their votes
       address[] voterAddresses;       // the addresses of the voters
   }  
 
 
    // Survey struct
   struct Survey {
       string ipfsHash;         
       uint surveyDeadline;     // deadline of the survey
       uint numOfChoices;       // number of choices in the survey
       uint atMostChoice;       // maximum number of choices the users can choose
       address surveyOwner;     // the address of the owner of the survey
       mapping(address=>uint[]) choices;    // the choices of the members
       address[] participants;  // the addresses of the members participating in the survey
   }
 
   // holds the current payment amount
   uint currentPaymentAmountIndex = 0; //index
   // holds voters map
   mapping(address =>  Voter)  public  voters;
   // holds proposals map
   mapping(uint =>  Proposal)   public  proposals;
   // holds survey map
   mapping(uint => Survey) public surveys;
 
   // constructor
   constructor(uint tokensupply) ERC20("MyGov", "MGT") {
       tokensupply = tokenSupply;
       _mint(address(this), tokensupply);
   }
  
   // Allows anyone to donate Ethers to the contract
   function donateEther() payable external {
   }
 
    // Allows users to donate their MyGov tokens.
   function donateMyGovToken(uint amount) public {
       transfer(address(this), amount);  
   } 
 
    // Allows any user to receive 1 MyGov token.
    // Each user can only receive one token.
   function faucet() public returns(bool) {  
       Voter storage sender = voters[msg.sender];
       require(!sender.tookFreeToken, "Already given token.");
       sender.tookFreeToken = true;  
       this.transfer(msg.sender, 1);
       memberCount++;
       return true;  
   }
 
   // Delegates the right to vote to another voter.
   function delegateVoteTo(address memberaddr,uint projectid) public onlyVoter(msg.sender) onlyVoter(memberaddr) onlyNotCancelled(projectid){
       // holds sender
       Voter storage sender = voters[msg.sender];
       // checks if the sender already voted, if not continues
       require(!sender.voted, " Already voted.");
       // checks if sender and delegated voter are the same person, if not continues
       require(memberaddr != msg.sender, "Self-delegation!.");
 
       //
       while (voters[memberaddr].delegate != address(0)) {
           memberaddr = voters[memberaddr].delegate;
 
           require(memberaddr != msg.sender, "Loop not allowed!");
       }
 
       // holds the delegated voter
       Voter storage newVoterDelegated = voters[memberaddr];
       // assigns delegated voter to sender, to hold the information
       sender.delegate = memberaddr;
       // think like sender is voted because they can not vote anymore
       sender.voted = true;
       // adds the voter to the voters addresses for the project
       proposals[projectid].voterAddresses.push(msg.sender);
 
       // if delegated voter has already voted
       if(newVoterDelegated.voted == true) {
           // sum up total count of the proposal with accumulated vote count of sender
           proposals[projectid].totalVoteCount += sender.totalVoteAccumulated + 1;
           // finds the vote of the delegated voter
           bool vote = proposals[projectid].votes[memberaddr];
           // saves the vote of the delegator to the same vote as the delegated
           proposals[projectid].votes[msg.sender] = vote;
           // if vote is yes
           if(vote) {
               // yes count of the proposal increases by sender's accumulted vote and sender current vote(1)
               proposals[projectid].yesVoteCount += sender.totalVoteAccumulated + 1;
           }
       }
       // if delegated voter has not voted yet
       else {
           // sum up total accumulated vote count of the sender and delegated voter and also senders current vote right
           newVoterDelegated.totalVoteAccumulated += sender.totalVoteAccumulated + 1;
       }
   }
 
   // function for voting
   function voteForProjectProposal(uint projectid,bool choice) public onlyVoter(msg.sender) onlyNotCancelled(projectid) {
       // checks if the voter has voetd, if not continues
       require(!voters[msg.sender].voted, "Already voted.");
       // checks if deadline of the proposal has passed, if not continues
       require(proposals[projectid].voteDeadline > block.timestamp, "Deadline is passed.");
       // assigns voter has voted
       voters[msg.sender].voted = true;
       //
       proposals[projectid].voterAddresses.push(msg.sender);
       // sum up new votes to total vote count
       proposals[projectid].totalVoteCount += voters[msg.sender].totalVoteAccumulated + 1;
       // if choice is yes
       if(choice) {
           // add new votes to yes vote count
           proposals[projectid].yesVoteCount += voters[msg.sender].totalVoteAccumulated + 1;
       }
       // holds the choice of the voter
       proposals[projectid].votes[msg.sender] = choice;
 
   }
 
   // Allows users to vote for the payment of the project.
   // Only the projects that are not cancelled can be voted for,
   // and only members can vote.
   function voteForProjectPayment(uint projectid,bool choice) public onlyVoter(msg.sender) onlyNotCancelled(projectid) {
       // checks if the voter already voted, if not continues
       require(!voters[msg.sender].voted, "Already voted.");
       require(proposals[projectid].stage >= 0, "Project isn't approved yet.");
       // assign voter as voted
       voters[msg.sender].voted = true;
       // increase vote count of the proposal
       proposals[projectid].totalVoteCount += voters[msg.sender].totalVoteAccumulated + 1;
       // if choice is yes
       if(choice) {
           // increase yes count of the proposal
           proposals[projectid].yesVoteCount += voters[msg.sender].totalVoteAccumulated + 1;
       }
       // holds the choice of the voter
       proposals[projectid].votes[msg.sender] = choice;
   }
 

   function approveEachPayment(uint projectid) public onlyNotCancelled(projectid) returns(bool) {
       require(proposals[projectid].stage > -1, "Project not approved yet,");
       // checks if the fund approved, if yes continues
       require(approveProposalFund(projectid) == true, "Payment not approved by voters.");
       // holds index of the current payment amount
       uint amount = proposals[projectid].paymentAmounts[currentPaymentAmountIndex];
       // holds proposer
       address payable proposer = payable(proposals[projectid].proposer);
       //
       (bool success, ) = proposer.call{value:amount}("");
       // if success continue
       require(success, "Payment failed.");
       return true;
   }
 
   // checks if the person is a member
   modifier onlyVoter(address person) {
       // holds the balance of the person
       uint256 balance = balanceOf(person);
       // checks if balance is more than zero, if yes continues
       require(balance > 0, "Not a member.");
       _;
   }
 
   // Checks if the project is cancelled
   modifier onlyNotCancelled(uint projectid){
       require(!proposals[projectid].cancelled, "Project is cancelled.");
       _;
   }
 
   // function to approve proposal
   function approveProposal(uint projectid) public returns(bool) {
       // holds count of the votes given
       uint votesGiven = proposals[projectid].yesVoteCount;
       require(votesGiven > 0, "No approval votes yet.");
       // if yes votes are more than or equal to member/10, then project is approved
       if(votesGiven >= memberCount/10.0) {
           //
           resetVoters(projectid);
           // resets the index
           currentPaymentAmountIndex = 0;
           proposals[projectid].stage++;
           currentStagePaid = false;
           return true;
       }
       else {
 
           // project not accepted because of the deadline
           if(proposals[projectid].voteDeadline < block.timestamp) {
               proposals[projectid].cancelled = true;
               proposals[projectid].reservedAmount = 0;
               // reset all
               resetVoters(projectid);
               // reset index
               currentPaymentAmountIndex = 0;
               return false;
           }
           // continues
           else {
               return false;
           }
          
       }
   }
  
   // approves proposal fund
   function approveProposalFund(uint projectid) public returns(bool) {
       // yes vote count
       uint votesGiven = proposals[projectid].yesVoteCount;
       require(votesGiven > 0, "No approval votes yet.");
       // checks the rate
       if(votesGiven >= memberCount/100.0) {
           // increses index
           currentPaymentAmountIndex++;
           // increses stage
           proposals[projectid].stage++;
           currentStagePaid = false;
 
           // after project completed last stage
           if(currentPaymentAmountIndex == proposals[projectid].paySchedule.length){
               // project completed
               proposals[projectid].completed = true;
               // reset index
               currentPaymentAmountIndex = 0;
           }
 
           // if project not funded
           if(!proposals[projectid].funded){
               // funds project
               proposals[projectid].funded = true;
               // count of funded projects increses
               fundedProjectCount++;
           }
          
           // resets parameters
           resetVoters(projectid);          
           return true;
       }
       else {
           // if deadline passed, project cancelled
           if(proposals[projectid].paySchedule[currentPaymentAmountIndex] < block.timestamp) {
               // reset parameters
               resetVoters(projectid);
               proposals[projectid].cancelled;
               proposals[projectid].reservedAmount = 0;
               // reset index;
               currentPaymentAmountIndex = 0;
               return false;
           }
           // if deadline not passed, continues
           else {
               return false;
           }
       }
   }
 
   /*
   *   If a project is cancelled or finished funding, some data is reset,
   *   including if the voters have voted yet or not, and their delegation addresses.
   */
   function resetVoters(uint projectid) internal {
 
       for(uint i = 0; i < proposals[projectid].voterAddresses.length; i++) {
           Voter storage v = voters[proposals[projectid].voterAddresses[i]];
           v.voted = false;
           v.delegate = address(0);
           v.totalVoteAccumulated = 0;
       }
       delete proposals[projectid].voterAddresses;
       proposals[projectid].yesVoteCount = 0;
       proposals[projectid].totalVoteCount = 0;

   }
 
   /*
   *   Allows a user to propose a project.
   *   The user must be a member in order to propose a project.
   *   The user must send enough Ethers and MyGov tokens to submit a proposal.
   *   The deadline of the proposed project must be later than the time of
   *   the proposal.
   */
   function submitProjectProposal
       (string memory ipfshash,
       uint votedeadline,
       uint [] memory paymentamounts,
       uint [] memory payschedule) public payable onlyVoter(msg.sender) returns(uint projectid)
   {
           transfer(address(this), 5);
           require(msg.value >= 0.1 ether, "0.1 ETH is required.");
           require(votedeadline > block.timestamp, "Proposal deadline already passed.");
           require(paymentamounts.length == payschedule.length, "Payment amounts and pay schedules don't match.");
           if(proposalCount > 0){
           require(proposals[proposalCount-1].completed || proposals[proposalCount-1].cancelled, "There is already an active project.");}
           projectid = proposalCount;
           proposals[projectid].ipfsHash = ipfshash;
           proposals[projectid].proposer = msg.sender;
           proposals[projectid].voteDeadline = votedeadline;
           proposals[projectid].paymentAmounts = paymentamounts;
           proposals[projectid].paySchedule = payschedule;
           proposals[projectid].stage = -1;
 
           proposalCount++;
 
           return projectid;
   }
 
    /*
   *   Allows the user to reserve the project grant.
   *   Only the owner of the project can do this.
   *   The project must not be cancelled in order to reserve the grant.
   *   The owner can only reserve the payment of the project before the
   *   proposal deadline.
   */ 
   function reserveProjectGrant(uint projectid) public onlyNotCancelled(projectid){
       require(msg.sender == proposals[projectid].proposer, "Only the project owner can reserve the grant.");
 
       if(block.timestamp >= proposals[projectid].voteDeadline){
           proposals[projectid].cancelled = true;
           resetVoters(projectid);
           currentPaymentAmountIndex = 0;
       }
 
       require(block.timestamp < proposals[projectid].voteDeadline, "Deadline is already passed. Funding lost.");
       require(proposals[projectid].reservedAmount == 0, "Already reserved.");
 
       uint amount = 0;
       for(uint i = 0; i < proposals[projectid].paymentAmounts.length; i++){
           amount += proposals[projectid].paymentAmounts[i];
       }
       if(amount > address(this).balance){
           resetVoters(projectid);
           proposals[projectid].cancelled = true;
       }
       require(amount <= address(this).balance, "Not enough balance of ETH in contract.");
 
       proposals[projectid].reservedAmount += amount;
   }
 
    /*
    *   Allows the owner of the project to withdraw the reserved amount of ETH.
    *   Only the owner of the project can withdraw the funding.
    *   Requires the project to not be cancelled.
    */
    function withdrawProjectPayment(uint projectid) public onlyNotCancelled(projectid) {
        require(msg.sender == proposals[projectid].proposer, "Only the project owner can withdraw the grant.");
        require(proposals[projectid].reservedAmount != 0, "Owner hasn't reserved in time.");
        require(!proposals[projectid].cancelled, "Project cancelled.");
        require(!currentStagePaid, "Payment for the stage already done.");

    bool result = false;
        if(proposals[projectid].stage == -1){
            result = approveProposal(projectid);
        }
        else {
            result = approveEachPayment(projectid);
        }
    
        require(result, "Can not withdraw yet.");
        address payable proposer = payable(proposals[projectid].proposer);
        uint _stage = uint(proposals[projectid].stage);
        uint amount = proposals[projectid].paymentAmounts[_stage];
        (bool success, ) = proposer.call{value:amount}("");
        require(success, "Payment failed.");
        currentStagePaid = true;
        proposals[projectid].reservedAmount -= amount;
        proposals[projectid].fundedAmount += amount;
    }
 
   /*
   *   Allows a user to submit a survey.
   *   The user must be a member to carry out a survey.
   *   Creates a survey, adds it to the mapping of surveys in the contract.
   *   The deadline of the survey must be later than the time of the creation.
   *   Returns the id of the newly created survey.
   */
    function submitSurvey(string memory ipfshash, uint surveydeadline,
    uint numchoices, uint atmostchoice) public payable onlyVoter(msg.sender) returns (uint surveyid) {
        require(surveydeadline > block.timestamp, "Survey deadline already passed.");
        transfer(address(this), 2);
        require(msg.value >= 0.04 ether, "0.04 ETH is required.");
        if (surveyCount > 0) {
        require(surveys[surveyCount-1].surveyDeadline < block.timestamp, "There's already an active survey.");
        }
        else {
            for(uint i = 0; i < surveys[surveyCount-1].participants.length; i++) {
                address p = surveys[surveyCount-1].participants[i];
                voters[p].tookPartInSurvey = false;
            }
        }

        surveyid = surveyCount;
        surveyCount++;

        surveys[surveyid].ipfsHash = ipfshash;
        surveys[surveyid].surveyDeadline = surveydeadline;
        surveys[surveyid].numOfChoices = numchoices;
        surveys[surveyid].atMostChoice = atmostchoice;
        surveys[surveyid].surveyOwner = msg.sender;

        return surveyid;
    }

    function takeSurvey(uint surveyid,uint [] memory choices) onlyVoter(msg.sender) public {
        Survey storage survey = surveys[surveyid];
        require(choices.length <= survey.atMostChoice, "Too many choices.");
        require(block.timestamp <= survey.surveyDeadline, "Survey deadline has passed.");
        require(voters[msg.sender].tookPartInSurvey, "Already took part in survey");

        surveys[surveyid].choices[msg.sender] = choices;
        surveys[surveyid].participants.push(msg.sender);
        voters[msg.sender].tookPartInSurvey = true;

    }
 

 
   /*
   *   Returns if a specific project is funded or not.
   */
    function getIsProjectFunded(uint projectid) public view returns(bool funded){
        funded = proposals[projectid].funded;
        return funded;
    }
 
   /*
   *   Returns the Unix time of the next payment of a specific project.
   *   The project description said that this function returns int but we assumed
   *   it has to be uint.
   */
   function getProjectNextPayment(uint projectid) public view returns(uint next){
       if(proposals[projectid].completed) {
           uint length = proposals[projectid].paySchedule.length;
           next = proposals[projectid].paySchedule[length-1];
       }
       next = proposals[projectid].paySchedule[currentPaymentAmountIndex];
       return next;
   }
  
   /*
   *   Returns the owner of a specific project.
   */
   function getProjectOwner(uint projectid) public view returns(address projectowner){
       projectowner = proposals[projectid].proposer;
       return projectowner;
   }
 
   /*
   *   Returns the details of a specific project including deadline and payment schedule.
   */
   function getProjectInfo(uint projectid) public view returns
   (string memory ipfshash, uint votedeadline,uint [] memory paymentamounts, uint [] memory payschedule){
       ipfshash = proposals[projectid].ipfsHash;
       votedeadline = proposals[projectid].voteDeadline;
       paymentamounts = proposals[projectid].paymentAmounts;
       payschedule = proposals[projectid].paySchedule;
       return (ipfshash, votedeadline, paymentamounts, payschedule);
   }
 
   /*
   *   Gets the number of projects that have been proposed.
   */
   function getNoOfProjectProposals() public view returns(uint numproposals){
       numproposals = proposalCount;
       return numproposals;
   }
 
   /*
   *   Gets the number of projects that have started to be funded.
   */
   function getNoOfFundedProjects () public view returns(uint numfunded){
       numfunded = fundedProjectCount;
       return numfunded;
   }
 
   /*
   *   Gets the total amount of Ethers received by a project, regardless of
   *   whether the project is finished or not.
   */
   function getEtherReceivedByProject (uint projectid) public view returns(uint amount){
       amount = proposals[projectid].fundedAmount;
       return amount;
   }
 
   /*
   *   Gets the number of valid surveys that have been submitted until now.
   */
   function getNoOfSurveys() public view returns(uint numsurveys){
       numsurveys = surveyCount;
       return numsurveys;
   }

   function getNoOfMembers() public view returns(uint){
       return memberCount;
   }

    /*
   *   Gets the owner of the survey.
   */
    function getSurveyOwner(uint surveyid) public view returns(address surveyowner){
        surveyowner = surveys[surveyid].surveyOwner;
        return surveyowner;
    }

    /*
    *   Returns the details of a specific survey.
    */
    function getSurveyInfo(uint surveyid) public view returns(string memory ipfshash,
    uint surveydeadline,uint numchoices, uint atmostchoice){
        ipfshash = surveys[surveyid].ipfsHash;
        surveydeadline = surveys[surveyid].surveyDeadline;
        numchoices = surveys[surveyid].numOfChoices;
        atmostchoice = surveys[surveyid].atMostChoice;
        return (ipfshash, surveydeadline, numchoices, atmostchoice);

    }

    /*
    *   Calculates the results of a specific survey and returns the number of participants
    *   in the survey and the results.
    */
    function getSurveyResults(uint surveyid) public view returns(uint numtaken, uint [] memory results){
        results[surveys[surveyid].numOfChoices];
        numtaken = surveys[surveyid].participants.length;
        for (uint i = 0; i < numtaken; i++){
            address a = surveys[surveyid].participants[i];
            uint l = surveys[surveyid].choices[a].length;
            for(uint j = 0; j < l; j++){
                uint option = surveys[surveyid].choices[a][j];
                results[option]++;
            }
        }
        return (numtaken, results);
    }
 
    /*
    *   Overrides the transfer function in the ERC20 contract because of the rule that
    *   the voters can not empty their wallets before the deadline.
    */
    function transfer(address to, uint256 amount) public virtual override returns (bool) {
        address voter = msg.sender;

        if(proposalCount == 0){
            return super.transfer(to, amount);
        }
        else {

            Proposal storage p = proposals[proposalCount-1];
            if(voters[voter].voted) {
                if(p.stage == -1) {
                    if(p.voteDeadline >= block.timestamp){
                    require(balanceOf(voter) - amount != 0);
                    }
                }
                else {
                    if(p.paySchedule[uint(p.stage)] >= block.timestamp) {
                    require(balanceOf(voter) - amount != 0);
                    }    
                }
                
            }        

            if(balanceOf(voter) == amount && balanceOf(to) > 0){
                memberCount--;
            }
            
            if(balanceOf(to) == 0 && balanceOf(voter) > amount){
                memberCount++;
            }
            return super.transfer(to, amount);
        }
        
    }
 
}
 
