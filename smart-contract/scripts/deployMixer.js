const { ethers, upgrades } = require("hardhat")


async function main() {

  const mixer = await ethers.getContractFactory("Mixer")
  const proxy = await upgrades.deployProxy(mixer)
  console.log("Mixer deployed to:", proxy.address)
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.log("This is error")
    console.error(error)
    process.exit(1)
  })
