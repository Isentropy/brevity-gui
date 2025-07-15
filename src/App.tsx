import { useState } from 'react';
import './App.css';
import { BrowserProvider, JsonRpcProvider, parseEther, Provider, toBeHex, WeiPerEther } from 'ethers';
import { CloneFactory__factory, OwnedBrevityInterpreter, OwnedBrevityInterpreter__factory } from '@isentropy/brevity-lang/typechain-types';
import { useSDK } from '@metamask/sdk-react';
import BlockExplorerLink from './BlockExplorerLink';
import BrevityInterpreterStats from './BrevityInterpreterStats';
import Runner from './Runner';
import { Script } from 'vm';
import ScriptSelector, { ScriptAndDesc } from './ScriptSelector';
import { ADDRESSES_BYCHAINID, scriptsFromChainId } from './templateScripts';
const QUERY_PARAM_BREVITY_ADDRESS = 'b'
//0x00c36BbbF0151280d052C4a3f2D3cFeB52ee1f84

const DEFAULT_BREVITY_INTERPRETER = '0xb6AA3ce7d5eAcD1a1faE7A9740a5064436946eA3'
const CLONECODE = /0x363d3d373d3d3d363d73([a-f0-9]{40,40})5af43d82803e903d91602b57fd5bf3/
const defaultProvider = new JsonRpcProvider('https://rpc.gnosischain.com/');
const defaultChainID = '0x64'

interface Window {
  ethereum: any
  location: any
}
declare var window: Window


function App() {

  const urlParams = new URLSearchParams(window.location.search);
  let interpreterAddress = urlParams.get(QUERY_PARAM_BREVITY_ADDRESS);
  if (!interpreterAddress) {
    interpreterAddress = DEFAULT_BREVITY_INTERPRETER
    window.location.search = `?${QUERY_PARAM_BREVITY_ADDRESS}=` + DEFAULT_BREVITY_INTERPRETER
  }

  const [interpreter, setInterpreter] = useState<OwnedBrevityInterpreter>(OwnedBrevityInterpreter__factory.connect(interpreterAddress, defaultProvider));
  const [account, setAccount] = useState<string>();
  const [owner, setOwner] = useState<string>();
  const { sdk, connected, connecting, chainId, provider } = useSDK();
  const [script, setScript] = useState<string>(scriptsFromChainId(defaultChainID)[0].script);

  const connect = async () => {
    try {
      //const accounts = await sdk?.connect();
      //console.log(`accounts ${accounts}`)
      const provider_Metamask = new BrowserProvider(window.ethereum);
      provider_Metamask.getSigner().then((signer) => {
        const newInterpreter = OwnedBrevityInterpreter__factory.connect(interpreterAddress!, signer)
        setInterpreter(newInterpreter)
        newInterpreter.owner().then((a) => {setOwner(a)})
      })
      const accounts2 = await provider_Metamask.send("eth_requestAccounts", []);

      setAccount(accounts2?.[0]);
    } catch (err) {
      console.warn("failed to connect..", err);
    }
  };
  const clone = async () => {
    try {
      const cloneFactory = chainId ? ADDRESSES_BYCHAINID.get(toBeHex(chainId, 32))?.cloneFactory : chainId
      if(!cloneFactory) {
        console.error(`No CloneFactory defined for chainId ${chainId}`)
        return
      }
      const factory = CloneFactory__factory.connect(cloneFactory, interpreter.runner)
      const salt = toBeHex(new Date().getTime(), 32)
      // if its a proxy, clone the proxy's target not the proxy
      const code = await interpreter.runner?.provider?.getCode(interpreterAddress!)
      const cloneParse = CLONECODE.exec(code!)
      const implementation = cloneParse ? '0x' + cloneParse[1] : interpreterAddress!
      console.log(`implementation ${implementation}`)
      const newInterpreter = await factory.predictDeterministicAddress(implementation, salt, account!)
      factory.cloneDeterministic(interpreterAddress!, salt, account!).then((resp) => {
        resp.wait().then((tr) => {
          window.location.search = `?${QUERY_PARAM_BREVITY_ADDRESS}=` + newInterpreter
        })
      })
    } catch (err) {

    }
  }

  return (
    <div className="brevityGui">
      <h3> Brevity Demo. USE AT YOUR OWN RISK! See <a href='https://github.com/Isentropy/brevity/blob/master/LICENSE'>Brevity license</a>.</h3>
      <button style={{ padding: 10, margin: 10 }} onClick={connect}>
        Connect MetaMask
      </button>
      <br></br>
      Connected to Brevity interpreter {BlockExplorerLink(interpreterAddress, chainId)} on chain {chainId}
      <button style={{ padding: 10, margin: 10 }} disabled={account && chainId && ADDRESSES_BYCHAINID.get(toBeHex(chainId, 32))?.cloneFactory ? false : true} onClick={clone}>Clone</button>

      {account && (
        <div>
          <p></p>
          Connected to MetaMask with wallet: {BlockExplorerLink(account, chainId)} {owner?.toLowerCase() == account.toLowerCase() ? "OWNER" : "NOT OWNER"}
        </div>
      )}
      <br></br>
      <ScriptSelector callback={setScript} scripts={scriptsFromChainId(chainId)} optionsLength={10}></ScriptSelector>
      <br></br>
      <Runner interpreter={interpreter} account={account} script={script} chainId={chainId}></Runner>
      {interpreter && BrevityInterpreterStats(interpreter, chainId)}
    </div>
  );
}

export default App;
