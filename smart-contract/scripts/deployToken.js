const { ethers, upgrades } = require("hardhat")


async function main() {

    const gldToken = await ethers.getContractFactory("GLDToken")
    const proxy = await upgrades.deployProxy(gldToken)
    console.log("GLDToken deployed to:", proxy.address)
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.log("This is error")
        console.error(error)
        process.exit(1)
    })
