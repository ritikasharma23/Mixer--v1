export const networkConfig = {
    "80001": [
        {
            mixerAddress: "0xeB93352d4fD4052177426ccC85783b39bF41ebf0", //proxy deployment
            networkName: "Mumbai"
        },

    ],


}

export const getConfigByChain = (chain) => networkConfig[chain]