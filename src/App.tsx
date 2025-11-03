import { useState } from 'react';
import './App.css';
import { BrowserProvider, Signer } from 'ethers';
import { useSDK } from '@metamask/sdk-react';
import BlockExplorerLink from './BlockExplorerLink';
import Interpreter from './Interpreter'
import ConnectOrCreate from './ConnectOrCreate';
export const QUERY_PARAM_BREVITY_ADDRESS = 'b'

interface Window {
  ethereum: any
  location: any
}
declare var window: Window


function App() {

  const urlParams = new URLSearchParams(window.location.search);
  let interpreterAddress = urlParams.get(QUERY_PARAM_BREVITY_ADDRESS);
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
      <h3> <a href="https://github.com/Isentropy/brevity">Brevity</a> Demo. Use at your own risk! See <a href='https://github.com/Isentropy/brevity/blob/master/LICENSE'>Brevity license</a>.</h3>
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
      { account && signer && !deployed && chainId && 
        <ConnectOrCreate signer={signer} chainId={chainId}  account={account}></ConnectOrCreate>
      }
      <div><hr></hr>
      Copyright 2024-2025 <a href="http://isentropy.com"> Isentropy LLC 
      </a>
      <br></br>
      <br></br>
      THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.</div>
    </div>
  );
}

export default App;
