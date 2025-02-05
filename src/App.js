var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import './App.css';
import { BrowserProvider, JsonRpcProvider } from 'ethers';
import { OwnedBrevityInterpreter__factory } from '@isentropy/brevity-lang/typechain-types';
import { useSDK } from '@metamask/sdk-react';
import BlockExplorerLink from './BlockExplorerLink';
import BrevityInterpreterStats from './BrevityInterpreterStats';
import Runner from './Runner';
import ScriptSelector from './ScriptSelector';
const QUERY_PARAM_BREVITY_ADDRESS = 'b';
const DEFAULT_BREVITY_INTERPRETER = '0xD47a39886638936a1e7c091101Fca97bEFf50Ae2';
const SCRIPTS = [
    {
        desc: "script1",
        script: "//heresf ssdf sdf sdf sf sf asfsf dfsdf fd \n//yoyoy\n"
    },
    {
        desc: "script2",
        script: "//22heresf ssdf sdf sdf sf sf asfsf dfsdf fd \n//yoyoy\n"
    },
];
function App() {
    const urlParams = new URLSearchParams(window.location.search);
    let interpreterAddress = urlParams.get(QUERY_PARAM_BREVITY_ADDRESS);
    if (!interpreterAddress)
        interpreterAddress = DEFAULT_BREVITY_INTERPRETER;
    const defaultProvider = new JsonRpcProvider('https://rpc.gnosischain.com/');
    const [interpreter, setInterpreter] = useState(OwnedBrevityInterpreter__factory.connect(interpreterAddress, defaultProvider));
    const [account, setAccount] = useState();
    const [script, setScript] = useState("// enter script\n");
    const { sdk, connected, connecting, chainId } = useSDK();
    const connect = () => __awaiter(this, void 0, void 0, function* () {
        try {
            //const accounts = await sdk?.connect();
            //console.log(`accounts ${accounts}`)
            const provider_Metamask = new BrowserProvider(window.ethereum, { name: "gnosis", chainId: 100 });
            provider_Metamask.getSigner().then((signer) => {
                setInterpreter(OwnedBrevityInterpreter__factory.connect(interpreterAddress, signer));
            });
            const accounts2 = yield provider_Metamask.send("eth_requestAccounts", []);
            setAccount(accounts2 === null || accounts2 === void 0 ? void 0 : accounts2[0]);
        }
        catch (err) {
            console.warn("failed to connect..", err);
        }
    });
    return (_jsxs("div", Object.assign({ className: "brevityGui" }, { children: [_jsx("h3", { children: " DEMO ONLY. UNAUTHORIZED USE PROHIBITED " }), _jsx("button", Object.assign({ style: { padding: 10, margin: 10 }, onClick: connect }, { children: "Connect MetaMask" })), _jsx("br", {}), "Connected to Brevity interpreter ", BlockExplorerLink(interpreterAddress), " on chain ", chainId, account && (_jsxs("div", { children: [_jsx("p", {}), "Connected to MetaMask with wallet: ", BlockExplorerLink(account)] })), _jsx("br", {}), _jsx(ScriptSelector, { callback: setScript, scripts: SCRIPTS, optionsLength: 10 }), _jsx("br", {}), _jsx(Runner, { interpreter: interpreter, account: account, script: script }), interpreter && BrevityInterpreterStats(interpreter)] })));
}
export default App;
