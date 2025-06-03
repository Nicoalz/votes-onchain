pragma solidity ^0.8.28;

contract Vote {
    address public owner;
    struct Poll {
        string question;
        string option1;
        string option2;
        address[] vote1;
        address[] vote2;
        bool isActive;
        uint maxVotes;
    }
    Poll[] public polls;

    constructor() {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "You are not the owner");
        _;
    }

    function getOwner() public view returns (address) {
        return owner;
    }

    function createPoll(string memory _question, string memory _option1, string memory _option2, uint _maxVotes) public onlyOwner {
        require(bytes(_option1).length > 0, "Option1 cannot be empty");
        require(bytes(_option2).length > 0, "Option2 cannot be empty");
        require(bytes(_question).length > 0, "Question cannot be empty");
        require(_maxVotes > 0, "Max votes must be greater than 0");

        Poll storage newPoll = polls.push();
        newPoll.question = _question;
        newPoll.option1 = _option1;
        newPoll.option2 = _option2;
        newPoll.vote1 = new address[](0);
        newPoll.vote2 = new address[](0);
        newPoll.isActive = true;
        newPoll.maxVotes = _maxVotes;
    }

    function addressExists(address[] memory addresses, address target) internal pure returns (bool) {
        for (uint i = 0; i < addresses.length; i++) {
            if (addresses[i] == target) {
                return true;
            }
        }
        return false;
    }

    function vote(uint _pollId, bool _vote1) public {
        require(_pollId < polls.length, "Poll does not exist");
        require(polls[_pollId].isActive, "Poll is not active");
        require(!addressExists(polls[_pollId].vote1, msg.sender) && !addressExists(polls[_pollId].vote2, msg.sender), "You have already voted");
        
        if (_vote1) {
            polls[_pollId].vote1.push(msg.sender);
        } else {
            polls[_pollId].vote2.push(msg.sender);
        }

        uint totalVotes = polls[_pollId].vote1.length + polls[_pollId].vote2.length;
        if (totalVotes >= polls[_pollId].maxVotes) {
            if ( polls[_pollId].vote1.length == polls[_pollId].vote2.length){
                resetVotesPoll(_pollId);
            }
            else{
                endPoll(_pollId);
            }
        }
    }

    function getPoll(uint _pollId) public view returns (string memory, string memory, string memory, address[] memory, address[] memory, bool, uint) {

        return (polls[_pollId].question, polls[_pollId].option1, polls[_pollId].option2, polls[_pollId].vote1, polls[_pollId].vote2, polls[_pollId].isActive, polls[_pollId].maxVotes);
    }
    
    function getAllPolls() public view returns (
        string[] memory questions,
        string[] memory allOptions1,
        string[] memory allOptions2,
        address[][] memory allVotes1,
        address[][] memory allVotes2,
        bool[] memory isActive
    ) {
        
        questions = new string[](polls.length);
        allOptions1 = new string[](polls.length);
        allOptions2 = new string[](polls.length);
        allVotes1 = new address[][](polls.length);
        allVotes2 = new address[][](polls.length);
        isActive = new bool[](polls.length);


        for (uint i = 0; i < polls.length; i++) {
            questions[i] = polls[i].question;
            allOptions1[i] = polls[i].option1;
            allOptions2[i] = polls[i].option2;
            isActive[i] = polls[i].isActive;
            allVotes1[i] = polls[i].vote1;
            allVotes2[i] = polls[i].vote2;
            // for (uint j = 0; j < polls[i].vote1.length; j++) {
            //     allVotes1[i] = polls[i].vote1[j];
            // }
            // for (uint j = 0; j < polls[i].vote2.length; j++) {
            //     allVotes2[i] = polls[i].vote2[j];
            // }
        }

        return (questions, allOptions1, allOptions2, allVotes1, allVotes2, isActive);
    }

    function resetVotesPoll(uint _pollId) internal {
        require(polls[_pollId].isActive, "Poll is not active");
        polls[_pollId].vote1 = new address[](0);
        polls[_pollId].vote2 = new address[](0);
    }

    function endPoll(uint _pollId) internal {
        require(_pollId < polls.length, "Poll does not exist");
        polls[_pollId].isActive = false;
    }

    function getPollResults(uint _pollId) public view returns (string memory, string memory, string memory, address[] memory, address[] memory, bool, uint) {
        return (polls[_pollId].question, polls[_pollId].option1, polls[_pollId].option2, polls[_pollId].vote1, polls[_pollId].vote2, polls[_pollId].isActive, polls[_pollId].maxVotes);
    }

  
}
