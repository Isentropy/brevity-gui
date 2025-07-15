import { useState } from 'react';
import './App.css';
import { BrowserProvider, JsonRpcProvider, parseEther, Provider, Signer, toBeHex, WeiPerEther } from 'ethers';
import { CloneFactory__factory, OwnedBrevityInterpreter, OwnedBrevityInterpreter__factory } from '@isentropy/brevity-lang/typechain-types';
import { useSDK } from '@metamask/sdk-react';
import BlockExplorerLink from './BlockExplorerLink';
import BrevityInterpreterStats from './BrevityInterpreterStats';
import Runner from './Runner';
import { Script } from 'vm';
import ScriptSelector, { ScriptAndDesc } from './ScriptSelector';
import Interpreter from './Interpreter'
import { ADDRESSES_BYCHAINID, scriptsFromChainId } from './templateScripts';
import ConnectOrCreate from './ConnectOrCreate';
export const QUERY_PARAM_BREVITY_ADDRESS = 'b'
//0x00c36BbbF0151280d052C4a3f2D3cFeB52ee1f84

//const DEFAULT_BREVITY_INTERPRETER = '0xb6AA3ce7d5eAcD1a1faE7A9740a5064436946eA3'
//const defaultProvider = new JsonRpcProvider('https://rpc.gnosischain.com/');
//const defaultChainID = '0x64'

interface Window {
  ethereum: any
  location: any
}
declare var window: Window


function App() {

  const urlParams = new URLSearchParams(window.location.search);
  let interpreterAddress = urlParams.get(QUERY_PARAM_BREVITY_ADDRESS);
  /*
  if (!interpreterAddress) {
    interpreterAddress = DEFAULT_BREVITY_INTERPRETER
    window.location.search = `?${QUERY_PARAM_BREVITY_ADDRESS}=` + DEFAULT_BREVITY_INTERPRETER
  }
  */
  const [account, setAccount] = useState<string>();
  const [signer, setSigner] = useState<Signer>()
  const [deployed, setDeployed] = useState<boolean>(false)
  const { sdk, connected, connecting, chainId, provider } = useSDK();

  const connect = async () => {
    try {
      const provider_Metamask = new BrowserProvider(window.ethereum);
      if(interpreterAddress) provider_Metamask.getCode(interpreterAddress).then((code) =>{
        if(code && code != '0x') {
          setDeployed(true)
        }
      })
      if(!signer) provider_Metamask.getSigner().then((s) => {
        setSigner(s)
        s.getAddress().then((a) => {setAccount(a)})
      })
    } catch (err) {
      console.warn("failed to connect..", err);
    }
  };
  

  return (
    <div className="brevityGui">
      <h3> Brevity Demo. USE AT YOUR OWN RISK! See <a href='https://github.com/Isentropy/brevity/blob/master/LICENSE'>Brevity license</a>.</h3>
      <button style={{ padding: 10, margin: 10 }} onClick={connect}>
        Connect MetaMask
      </button>
      <br></br>

      {account && (
        <div>
          <p></p>
          Connected to MetaMask with wallet: {BlockExplorerLink(account, chainId)} on chainId {chainId}
        </div>
      )}
      { account && interpreterAddress && chainId && signer && deployed &&
        <Interpreter interpreterAddress={interpreterAddress} signer={signer} chainId={chainId} account={account}></Interpreter>
      }
      { account && interpreterAddress && chainId && signer && !deployed &&
        `Interpreter Not Deployed: ${interpreterAddress}`
      }
      { account && signer && !deployed && 
        <ConnectOrCreate signer={signer} account={account}></ConnectOrCreate>
      }
    </div>
  );
}

export default App;
