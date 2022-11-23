const { web3 } = require("hardhat");
const { expect } = require("chai");
const { BN, constants, expectEvent, expectRevert } = require('@openzeppelin/test-helpers');

const { abi: erc20Abi, bytecode: erc20ByteCode } = require("../artifacts/contracts/erc20Token.sol/GLDToken.json");
const { abi: innerContractAbi, bytecode: innerContractByteCode } = require("../artifacts/contracts/innerContract.sol/InnerContract.json");
const { abi: mixerAbi, bytecode: mixerBytecode } = require("../artifacts/contracts/mainContract.sol/Mixer.json");

describe("Main Contract Tests", () => {
    let mixerContractInstance, innerContractAddress, innerContractInstance, erc20ContractInstance, accounts;
    before(async () => {
        accounts = await web3.eth.getAccounts();

        erc20ContractInstance = await new web3.eth.Contract(erc20Abi)
            .deploy({ data: erc20ByteCode, arguments: ["1000000000000000000"] })
            .send({ from: accounts[0] });

        mixerContractInstance = await new web3.eth.Contract(mixerAbi)
            .deploy({ data: mixerBytecode })
            .send({ from: accounts[0] });

        innerContractAddress = await mixerContractInstance.methods.currentContract().call();
        innerContractInstance = new web3.eth.Contract(innerContractAbi, innerContractAddress);
    });

    context("Deposit and Withdraw", () => {
        it("Deposit into contract", async () => {
            // Account0 has not deposited anything yet to mixer. So it's 0
            let initialBalanceOfERC20inAcc1InInner = await innerContractInstance.methods.balances(accounts[0], erc20ContractInstance.options.address).call();
            expect(initialBalanceOfERC20inAcc1InInner).to.be.bignumber.equal("0");

            // Account0 approves and deposits to the mixer
            await erc20ContractInstance.methods.approve(mixerContractInstance.options.address, "1000000000")
                .send({ from: accounts[0] });

            await mixerContractInstance.methods.depositTokens(erc20ContractInstance.options.address, "1000000000", accounts[1])
                .send({ from: accounts[0], value: new BN("10000000000000000") });

            // Account0 has deposited into mixer, so balance in contract has increased.
            initialBalanceOfERC20inAcc1InInner = await innerContractInstance.methods.balances(accounts[0], erc20ContractInstance.options.address).call();
            expect(initialBalanceOfERC20inAcc1InInner).to.be.bignumber.equal("1000000000");

            // since tokens has not been withdrawn, the balance in erc20Contract is 0.
            let balanceofERC20inAcc1 = await erc20ContractInstance.methods.balanceOf(accounts[1]).call();
            expect(balanceofERC20inAcc1).to.be.bignumber.equal("0");

            // increment depositCount of innerContract by 1
            let depositCount = await mixerContractInstance.methods.addressDeposits(innerContractAddress).call();
            expect(depositCount).to.be.bignumber.equal("1");
        });

        it("Withdraw from contract", async () => {
            // innerContract holds tokens
            let balanceOfInnerContractOfERC20 = await erc20ContractInstance.methods.balanceOf(innerContractAddress).call();
            expect(balanceOfInnerContractOfERC20).to.be.bignumber.equal("1000000000");

            // tokens are being withdrawn
            await mixerContractInstance.methods.withdraw(innerContractAddress, erc20ContractInstance.options.address, "1000000000", accounts[1])
                .send({ from: accounts[0] });

            // since tokens have been withdrawn, tokens have been transfered.
            let balanceofERC20inAcc1 = await erc20ContractInstance.methods.balanceOf(accounts[1]).call();
            expect(balanceofERC20inAcc1).to.be.bignumber.equal("1000000000");

            // since tokens are withdrawn, tokens have been deducted from innerContract.
            balanceOfInnerContractOfERC20 = await erc20ContractInstance.methods.balanceOf(innerContractAddress).call();
            expect(balanceOfInnerContractOfERC20).to.be.bignumber.equal("0");
        });
    })

    context("Deposit a lot", () => {
        it("Deposit 29 more times", async () => {
            await erc20ContractInstance.methods.approve(mixerContractInstance.options.address, "29000000000")
                .send({ from: accounts[0] });

            for (let i = 0; i < 29; i++) {
                await mixerContractInstance.methods.depositTokens(erc20ContractInstance.options.address, "1000000000", accounts[1])
                    .send({ from: accounts[0], value: new BN("10000000000000000") });
            }
        })

        it("If deposit now, should create new InnerContract", async () => {
            let initialInnerContractAddress = await mixerContractInstance.methods.currentContract().call();

            await erc20ContractInstance.methods.approve(mixerContractInstance.options.address, "1000000000")
                .send({ from: accounts[0] });

            await mixerContractInstance.methods.depositTokens(erc20ContractInstance.options.address, "1000000000", accounts[1])
                .send({ from: accounts[0], value: new BN("10000000000000000") });

            // new inner contract should be created.
            let newInnerContractAddress = await mixerContractInstance.methods.currentContract().call();
            expect(newInnerContractAddress).to.not.equal(initialInnerContractAddress);

            let depositCount = await mixerContractInstance.methods.addressDeposits(initialInnerContractAddress).call();
            expect(depositCount).to.be.bignumber.equal("30");

            depositCount = await mixerContractInstance.methods.addressDeposits(newInnerContractAddress).call();
            expect(depositCount).to.be.bignumber.equal("1");
        })
    })
})