import { useState } from "react";
import { BrevityParser, BrevityParserConfig, BrevityParserOutput } from "@isentropy/brevity-lang/tslib/brevityParser";
import { OwnedBrevityInterpreter } from "@isentropy/brevity-lang/typechain-types";
import { scriptsFromChainId } from "./templateScripts";

interface Props {
    interpreter: OwnedBrevityInterpreter
    account?: string
    script?: string
    chainId?: string
}

function Runner(p: Props) {
    const [compiledProgram, setCompiledProgram] = useState<BrevityParserOutput>();
    const [gasEstimate, setGasEstimate] = useState<bigint>();
    const [compileErr, setCompileErr] = useState<any>();

    const sendTx = async () => {
        p.interpreter.run(compiledProgram!).then((tx) => {
            //window.location.reload()
        }).catch((err) =>{
            setCompileErr("Successfully Compiled\nTX submit error: "+ err.toString())
        })
    }
//    console.log(`p.script ${p.script}`);
//    (document.getElementById("brevScript")! as HTMLTextAreaElement).defaultValue = p.script!
    const appendScript = async () => {
        if(!p.script) return
        const bs = document.getElementById("brevScript")! as HTMLTextAreaElement
        bs.value += p.script
    }
    const reset = async () => {
        if(!p.script) return
        const bs = document.getElementById("brevScript")! as HTMLTextAreaElement
        bs.value = scriptsFromChainId(p.chainId)[0].script
    }

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
            if(p.account) p.interpreter.run.estimateGas(compiled).then((estimate) => {
                setGasEstimate(estimate)
            }).catch((err)=>{
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
        <textarea id="brevScript" spellCheck={false} cols={80} rows={20} defaultValue={p.script}></textarea>
        <br></br>
        <button style={{ padding: 10, margin: 10 }} onClick={reset}>
            Reset
        </button>
        <button style={{ padding: 10, margin: 10 }} onClick={appendScript}>
            Append Template
        </button>
        <button style={{ padding: 10, margin: 10 }} onClick={compile}>
            Compile
        </button>
        <button disabled={p.account && compiledProgram ? false : true} style={{ padding: 10, margin: 10 }} onClick={sendTx}>
            Send TX
        </button>
        {compiledProgram ? `Gas Estimate: ${gasEstimate}` : ""}
        <h3>Error Console: </h3>
        <textarea spellCheck={false} readOnly={true} cols={80} value={compileErr}></textarea>

    </div>)
}

export default Runner