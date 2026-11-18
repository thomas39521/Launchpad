// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract PegasusLaunchpad {
    address public owner;
    uint256 public totalRaised;
    uint256 public hardCap;
    uint256 public tokenRate = 10000; // 1 ETH = 10,000 PGS tokens

    mapping(address => uint256) public investments;
    mapping(address => uint256) public claimableTokens;

    event Invested(address indexed investor, uint256 ethAmount, uint256 tokensAllocated);
    event TokensClaimed(address indexed investor, uint256 tokenAmount);

    modifier onlyOwner() {
        require(msg.sender == owner, "Not the project owner");
        _;
    }

    // Accepts the target pool hard cap in Wei upon deployment
    constructor(uint256 _hardCapInWei) {
        owner = msg.sender;
        hardCap = _hardCapInWei;
    }

    // This function receives the native ETH from your frontend input
    function invest() external payable {
        require(msg.value > 0, "You must send ETH to participate");
        require(totalRaised + msg.value <= hardCap, "This pool has hit its hard cap target");

        // Calculate token distribution weight (e.g. 0.1 ETH * 10000 = 1000 PGS)
        uint256 tokensToAllocate = msg.value * tokenRate;
        
        investments[msg.sender] += msg.value;
        claimableTokens[msg.sender] += tokensToAllocate;
        totalRaised += msg.value;

        emit Invested(msg.sender, msg.value, tokensToAllocate);
    }

    // Allows users to claim their pool allocation
    function claim() external {
        uint256 amountToClaim = claimableTokens[msg.sender];
        require(amountToClaim > 0, "No allocation available to claim");

        claimableTokens[msg.sender] = 0;
        // Production note: For real distributions, execute your token transfer here:
        // IERC20(tokenAddress).transfer(msg.sender, amountToClaim);

        emit TokensClaimed(msg.sender, amountToClaim);
    }

    // Modern .call method implemented to remove warnings and support smart contract wallets safely
    function withdrawFunds() external onlyOwner {
        uint256 contractBalance = address(this).balance;
        require(contractBalance > 0, "No funds available to pull");
        
        // Sends all native ETH to the owner safely forwarding gas
        (bool success, ) = payable(owner).call{value: contractBalance}("");
        require(success, "Transfer failed.");
    }
}