import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import BlockExplorerLink from "./BlockExplorerLink";
import { id, toBeHex, ZeroAddress } from "ethers";
import TokenBalance from "./TokenBalance";
function BrevityInterpreterStats(interpreter) {
    const [address, setAddress] = useState();
    const [version, setVersion] = useState();
    const [owner, setOwner] = useState();
    const [uniqueTokens, setUniqueTokens] = useState();
    if (!version)
        interpreter.version().then((v) => {
            setVersion(v);
        });
    if (!owner)
        interpreter.owner().then((o) => {
            setOwner(o);
        });
    if (!address)
        interpreter.getAddress().then((a) => {
            setAddress(a);
            const filter = {
                fromBlock: 0,
                toBlock: 'latest',
                topics: [id('Transfer(address,address,uint256)'), null, toBeHex(a, 32)]
            };
            console.log(`filter ${JSON.stringify(filter)}`);
            if (!uniqueTokens)
                interpreter.runner.provider.getLogs(filter).then((logs) => {
                    console.log(`logs ${logs.length}`);
                    setUniqueTokens([ZeroAddress, ...new Set(logs.map((log) => { return log.address; }))]);
                });
        });
    return _jsxs("div", Object.assign({ className: "brevityStats" }, { children: [_jsx("h3", { children: "Brevity Interpreter Info:" }), address && (_jsxs("div", { children: ["Address: ", BlockExplorerLink(address)] })), (version === null || version === void 0 ? void 0 : version.toString()) && (_jsxs("div", { children: ["Brevity Version: ", version.toString()] })), owner && (_jsxs("div", { children: ["Owner: ", BlockExplorerLink(owner)] })), _jsx("h4", { children: "Token Holdings:" }), _jsx("table", { children: _jsxs("tbody", { children: [_jsxs("tr", { children: [_jsx("th", { children: "Token Name" }), _jsx("th", { children: "Balance" }), _jsx("th", { children: "Withdraw To Owner" }), _jsx("th", { children: "Withdraw Amount" })] }), uniqueTokens && address && interpreter && (uniqueTokens.map((tokenAddress) => {
                            return _jsx(TokenBalance, { tokenAddress: tokenAddress, holderAddress: address, interpreter: interpreter, withdrawToAddress: owner });
                        }))] }) })] }));
}
export default BrevityInterpreterStats;
