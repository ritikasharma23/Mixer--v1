require("@nomicfoundation/hardhat-toolbox");
require("@nomiclabs/hardhat-web3");
require('@openzeppelin/hardhat-upgrades')

const infura_projectId = "403f2033226a44788c2638cc1c29d438"
const fs = require("fs")
const privateKey = fs.readFileSync(".secret").toString();

module.exports = {
  networks: {
    hardhat: {
      chainId: 1337
    },
    bitgert_main: {
      url: 'https://serverrpc.com',
      accounts: [privateKey],
    },
    bitgert_test: {
      url: 'https://testnet-rpc.brisescan.com',
      accounts: [privateKey],
    },
  },
  solidity: "0.8.17",
};
