import { Step } from "./Runner"

interface Props {
    steps: Step[]
}

export default function StepsList(p: Props) {
    return <table><tbody>
    <tr>
        <th>Step</th>
        <th>Action</th>
        <th>Params</th>
    </tr>
        
        {(p.steps.map((step, index) => {
            let kv = ""
            for (let i = 0; i < step.params.length; i++) {
                if (i != 0) kv += ","
                kv += step.script.inputs![i] + "=" + step.params[i]
            }
            return <tr className={"row" + (index % 2)}>
                <td>{index+1}</td>
                <td>{step.script.desc}</td> 
                <td>{kv}</td>
                </tr>
        }))}
    </tbody>
    </table>
}