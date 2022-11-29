import { useState, useEffect } from "react";
import { getTokenByChain, TokenInfo } from "../assets/tokenConfig";
import { useAccount, useNetwork } from "wagmi";
import BusyLoader, { LoaderType } from "../components/BusyLoader";
import { FaBackspace, FaMoneyBillWave } from "react-icons/fa";
import PhoneLink from "../artifacts/contracts/phoneLink.sol/phoneLink.json";
import toast from "react-hot-toast";
import InputIcon from "../components/InputIcon";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { ethers } from "ethers";
import { getConfigByChain } from "../config";

const style = {
  wrapper: `relative`,
  info: `flex justify-between text-[#e4e8eb] drop-shadow-xl`,
  infoLeft: `flex-0.2 flex-wrap`,
  container: `flex flex-wrap before:content-[''] before:bg-red-500 before:absolute before:top-0 before:left-0 before:right-0 before:bottom-0 before:bg-gradient-to-b from-purple-600 to-blue-300 before:bg-cover before:bg-center before:bg-fixed before:opacity-100`,
  contentWrapper: `w-full m-4 h-screen relative justify-center flex-wrap items-center block flex-grow lg:flex lg:items-center lg:w-auto`,
  details: ``,
  center: ` h-screen relative justify-center flex-wrap items-center `,
  searchBar: `flex flex-1 w-full border-black items-center bg-[#faf9f7] rounded-[0.8rem] mt-2`,
  searchInput: `h-[2.6rem] w-full border-0 bg-transparent outline-0 ring-0 px-2 pl-0 text-[#000000] placeholder:text-[#5e5d5b] placeholder:text-sm`,
  copyContainer: `flex flex-1 w-full border-black items-center bg-[#faf9f7] rounded-[0.8rem]`,
  title: `relative text-black justify-center text-2xl lg:text-[46px] font-semibold`,
  description: `text-[#000000] container-[400px] text-lg lg:text-lg mt-[0.8rem] mb-[2.5rem]`,
  spinner: `w-full h-screen flex justify-center text-white mt-20 p-100 object-center`,
  nftButton: `font-bold w-full mt-4 bg-[#43058f] text-white text-lg rounded-xl p-3  shadow-lg hover:bg-[#6f41b7] cursor-pointer`,
  dropDown: `font-bold w-full mt-4 bg-[#2181e2] text-white text-sm lg:text-lg rounded p-4 shadow-sm cursor-pointer`,
  option: `font-bold w-1/2 lg:w-full mt-4 bg-[#2181e2] text-white text-sm lg:text-lg rounded p-4 shadow-lg cursor-pointer`,
  glowDivBox: `relative group w-full lg:w-[40%] mt-30 rounded-2xl `,
};

const defaults = {
  balanceToken: "0",
};

const Pay = () => {
  //const { chain, chains } = useNetwork();
  const [availableTokens, setAvailableTokens] = useState<TokenInfo[]>([]);
  const [tokenAddr,setTokenAddr]= useState<string>()
  const [selectedOption, setSelectedOption] = useState<string>();
  const [balanceToken, setBalanceToken] = useState(defaults.balanceToken);
  const [formInput, updateFormInput] = useState({
    target: "",
    amount: 0.0,
  });
  const [loadingState, setLoadingState] = useState<Boolean>(false);
  const [defaultAccount, setDefaultAccount] = useState<any>(null);
  const [currNet, setCurrNet] = useState<number>(0);

  useEffect(() => {
    onLoad();
    setAvailableTokens(getTokenByChain(currNet));
  }, [currNet, defaultAccount]);

  const onLoad = async () => {
    await (window as any).ethereum.send("eth_requestAccounts"); // opens up metamask extension and connects Web2 to Web3
    const accounts = await (window as any).ethereum.request({
      method: "eth_requestAccounts",
    });
    const provider = new ethers.providers.Web3Provider(
      (window as any).ethereum
    ); //create provider
    const signer = provider.getSigner();
    const network = await provider.getNetwork();
    setDefaultAccount(accounts[0]);
    setCurrNet(network?.chainId);
  };

  const saveTransaction = async () => {
    const body = {
      from: defaultAccount,
      to: formInput?.target,
      coin: selectedOption,
      amount: formInput?.amount,
    };
    const headers = { "Content-Type": "application/json" };

    return await fetch(`http://localhost:8284/save/trnx`, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    })
      .then((response) => {
        const { status } = response;
        console.log("Status", status);
      })
      .catch((e) => console.log("error is", e));
  };

  async function transfer(e: any) {
    e?.preventDefault();
    await saveTransaction();
    await (window as any).ethereum.send("eth_requestAccounts"); // opens up metamask extension and connects Web2 to Web3
    const provider = new ethers.providers.Web3Provider(
      (window as any).ethereum
    ); //create provider
    const signer = provider.getSigner();
    const network = await provider.getNetwork();
    const contract = new ethers.Contract(
      getConfigByChain(network?.chainId)[0].contractProxyAddress,
      PhoneLink.abi,
      signer
    );
    var tx
    const etherPrice = ethers.utils.parseUnits(formInput?.amount.toString(), 'ether')
    if(tokenAddr==='null'){
      tx = await contract.depositTokens("0x0000000000000000000000000000000000000000",0,formInput?.target, {value:etherPrice});
    }else{
      tx = await contract.depositTokens(tokenAddr,formInput?.amount,formInput?.target);
    }
    
    const receipt = await provider
      .waitForTransaction(tx.hash, 1, 150000)
      .then(async () => {
        toast.success("Transfer completed !!");
      }).catch((e)=>{
        toast.error("Transaction failed.")
        toast.error(`Error is: ${e}`);
      });
  }

  return (
    <div>
      <div className={style.wrapper}>
        <div className={style.container}>
          <div className={style.contentWrapper}>
            <div className={style.glowDivBox}>
              <div className="relative h-[full] w-[95%] justify-center rounded-lg bg-gradient-to-b from-purple-300 to-blue-200 px-7 py-9  text-center leading-none lg:w-full">
                {1 === 2 ? (
                  <div className="mx-auto flex flex-wrap text-center">
                    <ConnectButton label="Connect Your Wallet And Start Sending Crypto" />
                  </div>
                ) : (
                  <>
                    <div className={style.details}>
                      <span className="flex flex-wrap justify-center space-x-5">
                        <span className="pr-6 text-xl font-bold text-black lg:text-3xl">
                          Send Crypto
                        </span>
                      </span>
                      <span className="flex flex-wrap items-center justify-center space-x-5">
                        <span className="mt-4 mb-3 justify-center text-center font-sans text-base not-italic leading-5 text-[#111111]">
                          Start Mixing
                        </span>
                      </span>
                    </div>

                    <div className="font-bold drop-shadow-xl">
                      <div className={style.info}>
                        <div className={style.infoLeft}>
                          <div className="mt-4 mb-2 text-sm font-normal text-[#000000]">
                            Choose Cryptocurrency:
                          </div>
                        </div>
                      </div>
                      <select
                        className={style.dropDown}
                        onChange={async (e) => {
                          const selectedValue = Number(e.target.value);
                          let token: TokenInfo | undefined;
                          if (selectedValue) {
                            token = availableTokens[Number(selectedValue)];
                            setSelectedOption(token.name);
                            setTokenAddr(token.address)
                          }
                          //await loadBalance(token);
                        }}
                      >
                        {availableTokens.map(
                          (token: TokenInfo, index: number) => (
                            <option
                              className={style.option}
                              value={index}
                              key={token.address}
                            >
                              {token.name}
                            </option>
                          )
                        )}
                      </select>
                      {/* <div className={style.info}>
                        <div className={style.infoLeft}>
                          <div className="text-sm font-normal text-[#000000] ">
                            <span className="label-rm">Balance:</span>
                            {balanceToken}
                          </div>
                        </div>
                      </div> */}
                      <div className={style.info}>
                        <div className={style.infoLeft}>
                          <div className="mt-4 text-sm font-normal text-[#000000]">
                            Transfer To:
                          </div>
                        </div>
                      </div>
                      <div className={style.searchBar}>
                        <input
                          type="text"
                          className={style.searchInput}
                          placeholder="Transfer To:"
                          value={formInput.target}
                          onChange={(e) =>
                            updateFormInput((formInput) => ({
                              ...formInput,
                              target: e.target.value,
                            }))
                          }
                        />
                      </div>

                      <div className={style.info}>
                        <div className={style.infoLeft}>
                          <div className="mt-4 text-sm font-normal text-[#000000]">
                            Amount To Transfer:
                          </div>
                        </div>
                      </div>
                      <div className={style.searchBar}>
                        <InputIcon
                          className="input-icon"
                          Icon={FaMoneyBillWave}
                        />
                        <input
                          type="number"
                          className={style.searchInput}
                          placeholder="Amount to transfer"
                          value={formInput.amount}
                          onChange={(e) =>
                            updateFormInput((formInput) => ({
                              ...formInput,
                              amount: Number(e.target.value),
                            }))
                          }
                        />
                        <button
                          type="button"
                          onClick={(_) =>
                            updateFormInput((formInput) => ({
                              ...formInput,
                              amount: 0.0,
                            }))
                          }
                        >
                          <InputIcon
                            className="input-icon"
                            Icon={FaBackspace}
                          />
                        </button>
                      </div>

                      {loadingState === true ? (
                        <BusyLoader
                          loaderType={LoaderType.Beat}
                          wrapperClass="white-busy-container"
                          className="white-busy-container"
                          color={"#000000"}
                          size={15}
                        >
                          <div className={style.description}>
                            {" "}
                            Connecting to blockchain. Please wait
                          </div>
                        </BusyLoader>
                      ) : (
                        <button
                          type="submit"
                          onClick={transfer}
                          className={style.nftButton}
                        >
                          Transfer
                        </button>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Pay;
