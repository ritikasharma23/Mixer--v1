// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.7;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/utils/Context.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./innerContract.sol";

contract Mixer is Context, Ownable {
    mapping(address => uint8) public addressDeposits;
    address public currentContract;

    event NewInnerContractCreated(address);

    constructor() {
        createNewInnerContract();
    }

    function createNewInnerContract() internal returns(address) {
        currentContract = address( new InnerContract() );
        emit NewInnerContractCreated(currentContract);
        return currentContract;
    }

    function depositTokens(address _erc20Addr, uint256 _numberOfTokens, address _to) external payable {
        require(msg.value >= 10**16, "Mixer: Fee to contract not sent!");

        if (addressDeposits[currentContract] == 30) {
            createNewInnerContract();
        }

        if (_erc20Addr == address(0)) {
            payable(currentContract).transfer(msg.value - 10**16);
            InnerContract(currentContract).depositTokens(_msgSender(), _erc20Addr, msg.value - 10**16, _to);
        } else {
            ERC20(_erc20Addr).transferFrom(_msgSender(), currentContract, _numberOfTokens);
            InnerContract(currentContract).depositTokens(_msgSender(), _erc20Addr, _numberOfTokens, _to);
        }
        

        addressDeposits[currentContract] += 1;
    }

    function withdraw(address _contractAddress, address _erc20Addr, uint256 _numberOfTokens, address _to) external onlyOwner {
        InnerContract(_contractAddress).withdraw(_msgSender(), _erc20Addr, _numberOfTokens, _to);
    }

    receive() external payable {
        revert();
    }
}