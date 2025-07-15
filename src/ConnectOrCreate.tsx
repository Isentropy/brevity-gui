import { Signer } from "ethers"
import { QUERY_PARAM_BREVITY_ADDRESS } from "./App"
import { OwnedBrevityInterpreter__factory } from "@isentropy/brevity-lang/typechain-types"

interface Props {
    signer: Signer
    account: string
}


function ConnectOrCreate(p: Props) {
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
        <label>Target:</label> <input id="target" size={42} defaultValue={"0xb6AA3ce7d5eAcD1a1faE7A9740a5064436946eA3"} minLength={4000}></input>
        <button style={{ padding: 10, margin: 10 }} onClick={connect}>Connect</button>
    </div>

}

export default ConnectOrCreate