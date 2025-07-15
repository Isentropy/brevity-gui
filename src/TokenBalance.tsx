import { useState } from "react";
import { OwnedBrevityInterpreter } from "@isentropy/brevity-lang/typechain-types/contracts/OwnedBrevityInterpreter";
import BlockExplorerLink from "./BlockExplorerLink";
import { ZeroAddress } from "ethers";
import { ERC20__factory, IERC20__factory } from "@isentropy/brevity-lang/typechain-types";

interface Props {
    holderAddress: string,
    tokenAddress: string,
    interpreter: OwnedBrevityInterpreter,
    withdrawToAddress?: string,
    chainId?: string
}

function TokenBalance(p: Props) {
    //const provider = p.interpreter.runner!.provider!
    const [balance, setBalance] = useState<bigint>();
    const [symbol, setSymbol] = useState<string>()

    p.interpreter.withdrawableBalance(p.tokenAddress).then((bal) => {
        setBalance(bal)
    })
    if (!symbol) {
        if (p.tokenAddress != ZeroAddress) {
            const erc20 = ERC20__factory.connect(p.tokenAddress, p.interpreter.runner)
            erc20.symbol().then((s) => { setSymbol(s) })
        } else setSymbol("native")
    }
    const withdraw = async () => {
        const amount = (document.getElementById("withdrawAmount") as HTMLInputElement).value
        p.interpreter.withdraw(p.tokenAddress, amount).then((tx) => {
            tx.wait().then((tr) => {
                window.location.reload()
            })
        })
    }

    return <tr>
        <td>{BlockExplorerLink(p.tokenAddress, p.chainId)}</td>
        <td>{symbol}</td>
        <td style={{ textAlign: "right" }}>{balance?.toString() && (balance?.toString())}</td>
        <td>{p.withdrawToAddress && (<button onClick={withdraw}>Withdraw to Owner</button>)}</td>
        <td>{p.withdrawToAddress && (<input id="withdrawAmount" defaultValue={balance?.toString()}></input>)}</td>
    </tr>
}


export default TokenBalance