import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
function ScriptSelector(p) {
    const changeHandler = (event) => {
        const sel = event.target;
        const text = sel.value;
        //sel.options[sel.selectedIndex].text
        console.log(`newScript ${text}`);
        p.callback(text);
    };
    return (_jsxs("div", { children: [_jsx("h4", { children: "Template Script" }), _jsx("br", {}), _jsx("select", Object.assign({ onChange: changeHandler, className: "scriptSelector", size: Math.min(p.scripts.length, p.optionsLength) }, { children: p.scripts.map((sd) => {
                    return _jsx("option", Object.assign({ value: sd.script }, { children: sd.desc }));
                }) }))] }));
}
export default ScriptSelector;
