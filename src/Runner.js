var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { BrevityParser } from "@isentropy/brevity-lang/tslib/brevityParser";
function Runner(p) {
    const [compiledProgram, setCompiledProgram] = useState();
    const [gasEstimate, setGasEstimate] = useState();
    const sendTx = () => __awaiter(this, void 0, void 0, function* () {
        p.interpreter.run(compiledProgram).then((tx) => {
            //window.location.reload()
        });
    });
    //    console.log(`p.script ${p.script}`);
    //    (document.getElementById("brevScript")! as HTMLTextAreaElement).defaultValue = p.script!
    const reset = () => __awaiter(this, void 0, void 0, function* () {
        if (!p.script)
            return;
        const bs = document.getElementById("brevScript");
        bs.value = p.script;
    });
    const compile = () => __awaiter(this, void 0, void 0, function* () {
        try {
            setCompiledProgram(undefined);
            const config = {
                maxMem: 100
            };
            const compiler = new BrevityParser(config);
            const script = document.getElementById("brevScript").value;
            const compiled = compiler.parseBrevityScript(script);
            console.log('successfully compiled program:\n' + JSON.stringify(compiled, null, 2));
            if (p.account)
                p.interpreter.run.estimateGas(compiled).then((estimate) => {
                    setGasEstimate(estimate);
                });
            setCompiledProgram(compiled);
        }
        catch (err) {
            console.warn("Compile Error:", err);
        }
    });
    return (_jsxs("div", Object.assign({ className: "brevityRunner" }, { children: [_jsx("textarea", { id: "brevScript", cols: 80, rows: 20, defaultValue: p.script }), _jsx("br", {}), _jsx("button", Object.assign({ style: { padding: 10, margin: 10 }, onClick: reset }, { children: "Reset" })), _jsx("button", Object.assign({ style: { padding: 10, margin: 10 }, onClick: compile }, { children: "Compile" })), _jsx("button", Object.assign({ disabled: p.account && compiledProgram ? false : true, style: { padding: 10, margin: 10 }, onClick: sendTx }, { children: "Send TX" })), compiledProgram ? `Gas Estimate: ${gasEstimate}` : ""] })));
}
export default Runner;
