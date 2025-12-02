import { useState } from "react";
import { OwnedBrevityInterpreter } from "@isentropy/brevity-lang/typechain-types"
import BlockExplorerLink from "./BlockExplorerLink";
import { Filter, id, toBeHex, ZeroAddress } from "ethers";
import TokenBalance from "./TokenBalance";

export default function TokenHoldings(interpreter: OwnedBrevityInterpreter, chainId: string | undefined) {
    const [address, setAddress] = useState<string>();
    //  const [version, setVersion] = useState<bigint>();
    const [owner, setOwner] = useState<string>();
    const [uniqueTokens, setUniqueTokens] = useState<string[]>();
    /*
      if (!version) interpreter.version().then((v) => {
        setVersion(v)
      })
    */

    if (!owner) interpreter.owner().then((o) => {
        setOwner(o)
    })
    if (!address) interpreter.getAddress().then((a) => {
        setAddress(a)

        const filter: Filter = {
            fromBlock: 0,
            toBlock: 'latest',
            topics: [id('Transfer(address,address,uint256)'), null, toBeHex(a, 32)]
        }
        console.log(`filter ${JSON.stringify(filter)}`)
        if (!uniqueTokens)
            interpreter.runner!.provider!.getLogs(filter).then((logs) => {
                console.log(`logs ${logs.length}`)
                setUniqueTokens([ZeroAddress, ...new Set(logs.map((log) => { return log.address }))])
            })
    })
    return <table>
        <tbody>
            <tr>
                <th>
                    Token Address
                </th>
                <th>
                    Symbol
                </th>
                <th>
                    Balance
                </th>
                <th>
                    Withdraw To Owner
                </th>
                <th>
                    Withdraw Amount (wei)
                </th>
            </tr>
            {uniqueTokens && address && interpreter && (
                uniqueTokens.map((tokenAddress) => {
                    return <TokenBalance tokenAddress={tokenAddress} chainId={chainId} holderAddress={address} interpreter={interpreter} withdrawToAddress={owner}></TokenBalance>
                })
            )}
        </tbody>
    </table>


}

