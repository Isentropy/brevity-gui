import { CloneFactory__factory, OwnedBrevityInterpreter, OwnedBrevityInterpreter__factory } from '@isentropy/brevity-lang/typechain-types';
import { Signer, toBeHex } from "ethers"
import BlockExplorerLink from "./BlockExplorerLink"
import ScriptSelector from "./ScriptSelector"
import Runner from "./Runner"
import { useState } from 'react';
import { ADDRESSES_BYCHAINID, scriptsFromChainId } from './templateScripts';
import BrevityInterpreterStats from './BrevityInterpreterStats';
import { QUERY_PARAM_BREVITY_ADDRESS } from './App';

const CLONECODE = /0x363d3d373d3d3d363d73([a-f0-9]{40,40})5af43d82803e903d91602b57fd5bf3/

interface Props {
    interpreterAddress: string
    signer: Signer
    chainId: string
    account: string
}
//const [interpreter, setInterpreter] = useState<OwnedBrevityInterpreter>();

function Interpreter(p: Props) {
    const [owner, setOwner] = useState<string>();

    const interpreter = OwnedBrevityInterpreter__factory.connect(p.interpreterAddress, p.signer)
    if(!owner) interpreter.owner().then((o) => {setOwner(o)})
    const clone = async () => {
        try {
            const cloneFactory = p.chainId ? ADDRESSES_BYCHAINID.get(toBeHex(p.chainId, 32))?.cloneFactory : p.chainId
            if (!cloneFactory) {
                console.error(`No CloneFactory defined for chainId ${p.chainId}`)
                return
            }
            const factory = CloneFactory__factory.connect(cloneFactory, interpreter.runner)
            const salt = toBeHex(new Date().getTime(), 32)
            // if its a proxy, clone the proxy's target not the proxy
            const code = await interpreter.runner?.provider?.getCode(p.interpreterAddress)
            const cloneParse = CLONECODE.exec(code!)
            const implementation = cloneParse ? '0x' + cloneParse[1] : p.interpreterAddress
            console.log(`implementation ${implementation}`)
            const newInterpreter = await factory.predictDeterministicAddress(implementation, salt, p.account)
            factory.cloneDeterministic(p.interpreterAddress, salt, p.account).then((resp) => {
                resp.wait().then((tr) => {
                    window.location.search = `?${QUERY_PARAM_BREVITY_ADDRESS}=` + newInterpreter
                })
            })
        } catch (err) {

        }
    }
    return <div>
        Connected to Brevity interpreter {BlockExplorerLink(p.interpreterAddress, p.chainId)} as {owner?.toLowerCase() == p.account.toLowerCase() ? "OWNER" : "NOT OWNER"}
        <button style={{ padding: 10, margin: 10 }} disabled={ADDRESSES_BYCHAINID.get(toBeHex(p.chainId, 32))?.cloneFactory ? false : true} onClick={clone}>Clone</button>
        <br></br>
        <Runner interpreter={interpreter} account={p.account}  chainId={p.chainId}></Runner>
        {interpreter && BrevityInterpreterStats(interpreter, p.chainId)}
    </div>
}

export default Interpreter