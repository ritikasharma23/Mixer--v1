// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.7;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts-upgradeable/utils/ContextUpgradeable.sol";
import '@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol';
import '@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol';
import "./innerContract.sol";

contract Mixer is Initializable, ContextUpgradeable, OwnableUpgradeable {
    mapping(address => uint8) public addressDeposits;
    address payable public currentContract;

    event NewInnerContractCreated(address);

    constructor() initializer {
        __Ownable_init();
        createNewInnerContract();
    }

    function createNewInnerContract() internal returns(address) {
        currentContract = payable( address ( new InnerContract() ) );
        emit NewInnerContractCreated(currentContract);
        return currentContract;
    }

    function depositTokens(address _erc20Addr, uint256 _numberOfTokens, address _to) external payable {
        require(msg.value >= 10**16, "Mixer: Fee to contract not sent!");

        if (addressDeposits[currentContract] == 30) {
            createNewInnerContract();
        }

        if (_erc20Addr == address(0)) {
            currentContract.transfer(msg.value - 10**16);
            InnerContract(currentContract).depositTokens(_msgSender(), _erc20Addr, msg.value - 10**16, _to);
        } else {
            ERC20(_erc20Addr).transferFrom(_msgSender(), currentContract, _numberOfTokens);
            InnerContract(currentContract).depositTokens(_msgSender(), _erc20Addr, _numberOfTokens, _to);
        }

        addressDeposits[currentContract] += 1;
    }

    function withdraw(address _contractAddress, address _erc20Addr, uint256 _numberOfTokens, address _from, address _to) external {
        InnerContract(payable(_contractAddress)).withdraw(_from, _erc20Addr, _numberOfTokens, _to);
    }

    receive() external payable {
        revert();
    }
}