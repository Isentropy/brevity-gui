import { useState } from "react";
import { BrevityInterpreter, IERC20, OwnedBrevityInterpreter } from "./brevity/typechain-types"
import BlockExplorerLink from "./BlockExplorerLink";
import { dataSlice, Filter, FunctionFragment, id, toBeHex } from "ethers";

function BrevityInterpreterStats(interpreter : OwnedBrevityInterpreter) {
    const [address, setAddress] = useState<string>();
    const [nativeTokenBal, setNativeTokenBal] = useState<bigint>();
    const [version, setVersion] = useState<bigint>();
    const [owner, setOwner] = useState<string>();
    const [uniqueTokens, setUniqueTokens] = useState<string[]>();

    interpreter.version().then((v)=>{
        setVersion(v)
    })
    interpreter.owner().then((o)=>{
        setOwner(o)
    })
    interpreter.getAddress().then((a)=> {
        setAddress(a)
        interpreter.runner!.provider!.getBalance(a).then((bal) => {
            setNativeTokenBal(bal)
        })
        const filter : Filter = {
            fromBlock: 0,
            toBlock:'latest',
            topics: [id('Transfer(address,address,uint256)'), null, toBeHex(a, 32)]
        }
        console.log(`filter ${JSON.stringify(filter)}`)
        if(!uniqueTokens)
        interpreter.runner!.provider!.getLogs(filter).then((logs) => {
            console.log(`logs ${logs.length}`)
            setUniqueTokens([...new Set(logs.map((log) => { return dataSlice(log.topics[2], 12) }))])
        })
    })
    return <div>
        <h3>Brevity Interpreter Info</h3>
        {address && (
            <div>
            Address: {BlockExplorerLink(address)}
            </div>
        )}
        {version?.toString() && (
            <div>
            Brevity Version: {version.toString()}
            </div>
        )}
        {owner && (
            <div>
            Owner: {BlockExplorerLink(owner)}
            </div>
        )}
        {nativeTokenBal?.toString() && (
            <div>
            Native Token Balance: {nativeTokenBal.toString()}
            </div>
        )}
        {uniqueTokens && (
            <div>
            Unique tokens: {JSON.stringify(uniqueTokens)}
            </div>
        )}
    </div>
}

export default BrevityInterpreterStats