import { useState } from "react"
import { ScriptAndDesc } from "./templateScripts"
import { Step } from "./Runner"

interface Props {
    // 
    outputStep: (step: Step) => void
    stderr?: (err: string) => void
    scripts: ScriptAndDesc[]
    optionsLength: number
}


function ScriptSelector(p: Props) {
    const [script, setScript] = useState<ScriptAndDesc>();

    const changeHandler = (event: any) => {
        const sel = event.target! as HTMLSelectElement
        setScript(p.scripts[sel.selectedIndex])
    }

    const addStep = () => {
        if (!script) return
        const params = []
        if (script.inputs) {
            for (let i = 0; i < script.inputs.length; i++) {
                const val = (document.getElementById("param" + i) as HTMLInputElement).value.trim()
                if (val == '') {
                    if (p.stderr) p.stderr(`${script.inputs[i]} unset`)
                    return
                }
                params.push(val)
            }
        }
        p.outputStep({script, params})
        if (p.stderr) p.stderr(`Added Step`)
    }

    return (
        <div>

            <div style={{ display: "flex" }}>
                <select onChange={changeHandler} className="scriptSelector" size={Math.min(p.scripts.length, p.optionsLength)}>
                    {p.scripts.map((sd, index) => {
                        return <option>{sd.desc}</option>
                    })}
                </select>
                <div>
                    {script?.inputs && <h3>Input Params</h3>}

                    {script?.inputs &&
                        (script.inputs.map((inputParam, index) => {
                            return <div>
                                <label>{inputParam}</label>
                                <input id={"param" + index}></input>
                            </div>
                        }))
                    }
                </div>
                <button style={{ padding: 10, margin: 10 }} onClick={addStep}>
                    Add Step
                </button>
            </div>


        </div>)
}

export default ScriptSelector 