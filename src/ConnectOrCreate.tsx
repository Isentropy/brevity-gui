import { Signer } from "ethers"
import { QUERY_PARAM_BREVITY_ADDRESS } from "./App"
import { OwnedBrevityInterpreter__factory } from "@isentropy/brevity-lang/typechain-types"
import { ADDRESSES_BYCHAINID } from "./templateScripts"

interface Props {
    signer: Signer
    account: string
    chainId: string
}

function ConnectOrCreate(p: Props) {
    const defaultInterpreter = ADDRESSES_BYCHAINID.get(p.chainId)?.TEMPLATE_INTERPRETER ? ADDRESSES_BYCHAINID.get(p.chainId)!.TEMPLATE_INTERPRETER : "0xb6AA3ce7d5eAcD1a1faE7A9740a5064436946eA3"
    const deploy = async () => {
        const owner = (document.getElementById("owner") as HTMLInputElement).value
        const factory = new OwnedBrevityInterpreter__factory(p.signer)
        factory.deploy(owner).then((ctr) => {
            ctr.waitForDeployment().then(()=>{
                ctr.getAddress().then((address) => {    
                    window.location.search = `?${QUERY_PARAM_BREVITY_ADDRESS}=` + address
                })
            })
        })
    }

    const connect = async () => {
        const target = (document.getElementById("target") as HTMLInputElement).value
        window.location.search = `?${QUERY_PARAM_BREVITY_ADDRESS}=` + target
    }
    return <div>
        <h4>Deploy New Brevity Interpreter</h4>
        <label>Owner:</label> <input id="owner" defaultValue={p.account} size={42}></input>
        <button style={{ padding: 10, margin: 10 }} onClick={deploy}>Deploy</button>
        <h4>Connect To Existing Brevity Interpreter</h4>
        <label>Target:</label> <input id="target" size={42} defaultValue={defaultInterpreter} minLength={4000}></input>
        <button style={{ padding: 10, margin: 10 }} onClick={connect}>Connect</button>
        <br></br>
        Connect to existing to clone. Cloning uses 90000 gas, deploy uses 2000000.
    </div>

}

export default ConnectOrCreate