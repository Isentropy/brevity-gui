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
    const [script, setScript] = useState<ScriptAndDesc>(p.scripts[0]);

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
        p.outputStep({ script, params })
        if (p.stderr) p.stderr(`Added Step`)
    }

    return (
        <div>
            <label>Select Action: </label><select onChange={changeHandler} className="scriptSelector">
                {p.scripts.map((sd, index) => {
                    return <option>{sd.desc}</option>
                })}
            </select>

            <div style={{ display: "flex" }}>
                <div>
                    {script?.inputs && <h4>Input Params</h4>}
                    <table>
                        {script?.inputs &&
                            (script.inputs.map((inputParam, index) => {
                                return <tr>
                                    <td>{inputParam} = </td>
                                    <td><input id={"param" + index}></input></td>
                                </tr>
                            }))
                        }
                    </table>
                </div>
            </div>
            <button style={{ padding: 10, margin: 10 }} onClick={addStep}>
                Add Step
            </button>


        </div>)
}

export default ScriptSelector 