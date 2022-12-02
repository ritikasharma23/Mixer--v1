const { ethers, upgrades } = require("hardhat")

async function main() {
    const mixer = await ethers.getContractFactory("Mixer")
    let proxy = await upgrades.upgradeProxy("0xeB93352d4fD4052177426ccC85783b39bF41ebf0", mixer); //mumbai
    //let proxy = await upgrades.upgradeProxy("0xbf3FFcEfEeee311564D39445BceD995548f9aF38", mixer); //
    console.log("Mixer Contract has been successfully upgraded !!")
}


main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.log("This is error")
        console.error(error)
        process.exit(1)
    })
