export const networkConfig = {
    "80001": [
        {
            mixerAddress: "0xA0815eC0B7A91C907F17140699553972898B5E16", //proxy deployment
            token_icon: "https://cryptologos.cc/logos/polygon-matic-logo.svg?v=022",
            alt: "MATIC",
            networkName: "Mumbai"
        },

    ],


}

export const getConfigByChain = (chain) => networkConfig[chain]