export interface ScriptAndDesc {
    desc: string
    script: string
}

interface Props {
    callback: (script: string) => void
    scripts: ScriptAndDesc[]
    optionsLength: number
}

function ScriptSelector(p: Props) {
    const changeHandler = (event: any) => {
        const sel = event.target! as HTMLSelectElement
        const text = sel.value
        //sel.options[sel.selectedIndex].text
        console.log(`newScript ${text}`)
        p.callback(text)
    }
    

    return (
        <div>
            <h3>Brevity Console</h3>
            
            <label>Template:</label>
            <select onChange={changeHandler} className="scriptSelector" size={Math.min(p.scripts.length, p.optionsLength)}>
                {p.scripts.map((sd) => {
                    return <option value={sd.script}>{sd.desc}</option>
                })}
            </select>

        </div>)
}

export default ScriptSelector 