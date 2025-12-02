import { useEffect, useState } from "react";
import { BrevityParser, BrevityParserConfig, BrevityParserOutput } from "@isentropy/brevity-lang/tslib/brevityParser";
import { OwnedBrevityInterpreter } from "@isentropy/brevity-lang/typechain-types";
import { ADDRESSES_BYCHAINID, composeScript, ScriptAndDesc, scriptsFromChainId, toBrevity } from "./templateScripts";
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';
import ScriptSelector from "./ScriptSelector";
import StepsList from "./StepsList";
import { toBeHex } from "ethers";
import BrevityInterpreterStats from "./BrevityInterpreterStats";
import TokenHoldings from "./TokenHoldings";
interface Props {
    interpreter: OwnedBrevityInterpreter
    account?: string
    chainId: string
}

export interface Step {
    script: ScriptAndDesc,
    params: string[]
}

function Runner(p: Props) {
    const [compiledProgram, setCompiledProgram] = useState<BrevityParserOutput>();
    const [gasEstimate, setGasEstimate] = useState<bigint>();
    const [compileErr, setCompileErr] = useState<any>();
    const [steps, setSteps] = useState<Step[]>([]);

    //const [script, setScript] = useState<string>();
    //if(!script) setScript(scriptsFromChainId(p.chainId.toString())[0].script)

    const sendTx = async () => {
        p.interpreter.run(compiledProgram!).then((tx) => {
            //window.location.reload()
        }).catch((err) => {
            setCompileErr("Successfully Compiled\nTX submit error: " + err.toString())
        })
    }
    //    console.log(`p.script ${p.script}`);
    //    (document.getElementById("brevScript")! as HTMLTextAreaElement).defaultValue = p.script!
    /*
    const appendScript = async (script: string) => {
        const bs = document.getElementById("brevScript")! as HTMLTextAreaElement
        if (!script) return
        bs.value += script
    }
    */
    /*
    const refreshCodeFromSteps = async () => {
        const bs = document.getElementById("brevScript")! as HTMLTextAreaElement
        bs.value += script
    }
        */


    // refresh script when step received or deleted

    const refreshScriptFromSteps = () => {
        console.log(`refresh ${steps.length} steps`)
        const bs = document.getElementById("brevScript")! as HTMLTextAreaElement
        const fullScript = steps.map((step) => {
            return composeScript(step.script, step.params)
        }).join(`\nclearMemStack\nclearParams\n`)
        bs.value = toBrevity(ADDRESSES_BYCHAINID.get(toBeHex(p.chainId, 32))) + '\n\n' + fullScript
    }


    const receiveStep = (step: Step) => {
        setSteps([...steps, step])
        //console.log(`setSteps ${steps.length}`)
        //refreshScriptFromSteps()
    }
    const rmStep = (index: number) => {
        console.log(`rmStep ${index}`)
        setSteps(steps.slice(0, index).concat(index == steps.length - 1 ? [] : steps.slice(index + 1)))
    }

    const reset = async () => {
        setSteps([])
        setCompileErr('')
        //refreshScriptFromSteps()
    }

    useEffect(refreshScriptFromSteps, [steps])

    const compile = async () => {
        try {
            setCompiledProgram(undefined)
            const config: BrevityParserConfig = {
                maxMem: 100
            }
            const compiler = new BrevityParser(config)
            const script = (document.getElementById("brevScript")! as HTMLTextAreaElement).value
            const compiled = compiler.parseBrevityScript(script)
            console.log('successfully compiled program:\n' + JSON.stringify(compiled, null, 2))
            if (p.account) p.interpreter.run.estimateGas(compiled).then((estimate) => {
                setGasEstimate(estimate)
            }).catch((err) => {
                setCompileErr("Successfully Compiled\nEstimate Gas Error: " + err)
            });

            setCompiledProgram(compiled)
            setCompileErr("Successfully Compiled")
        } catch (err) {
            console.warn("Compile Error:", err);
            setCompileErr(err)
        }
    }


    return (
        <div className="brevityRunner">
            <Tabs >
                <TabList>
                    <Tab><b>Step Compose</b></Tab>
                    <Tab><b>Brevity Code</b></Tab>
                    <Tab><b>Token Holdings</b></Tab>
                    <Tab><b>Interpreter Info</b></Tab>
                </TabList>
                <TabPanel>
                    <div style={{ height: 500, overflowY: 'auto' }}>
                        <div className="stepsCompose" style={{ float: 'left', width: "38%", height: "100%" }}>
                            <ScriptSelector stderr={setCompileErr} outputStep={receiveStep} scripts={scriptsFromChainId(p.chainId)} optionsLength={4}></ScriptSelector>
                        </div>

                        <div style={{ height: 500, padding: 10, borderLeft: '2px solid white', float: 'right', width: "60%" }}>
                            <h3>  Workflow</h3>
                            <StepsList steps={steps} rmStep={rmStep}></StepsList>
                        </div>
                    </div>
                </TabPanel>
                <TabPanel forceRender>
                    <textarea id="brevScript" spellCheck={false} cols={80} rows={20}></textarea>
                </TabPanel>
                <TabPanel>
                    <div style={{ height: 500, overflowY: 'auto' }}>
                        {TokenHoldings(p.interpreter, p.chainId)}
                    </div>
                </TabPanel>
                <TabPanel>
                    <div style={{ height: 500, overflowY: 'auto' }}>
                        {BrevityInterpreterStats(p.interpreter, p.chainId)}
                    </div>
                </TabPanel>

            </Tabs>
            <hr></hr>
            <button style={{ padding: 10, margin: 10 }} onClick={reset}>
                Reset
            </button>
            <button style={{ padding: 10, margin: 10 }} onClick={compile}>
                Compile
            </button>
            <button disabled={p.account && compiledProgram ? false : true} style={{ padding: 10, margin: 10 }} onClick={sendTx}>
                Run Script
            </button>
            {compiledProgram ? `Gas Estimate: ${gasEstimate}` : ""}
            <h3>Error Console: </h3>
            <textarea spellCheck={false} readOnly={true} cols={80} value={compileErr}></textarea>

        </div>)
}

export default Runner