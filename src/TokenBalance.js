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
import BlockExplorerLink from "./BlockExplorerLink";
function TokenBalance(p) {
    //const provider = p.interpreter.runner!.provider!
    const [balance, setBalance] = useState();
    p.interpreter.withdrawableBalance(p.tokenAddress).then((bal) => {
        setBalance(bal);
    });
    const withdraw = () => __awaiter(this, void 0, void 0, function* () {
        const amount = document.getElementById("withdrawAmount").value;
        p.interpreter.withdraw(p.tokenAddress, amount).then((tx) => {
            tx.wait().then((tr) => {
                window.location.reload();
            });
        });
    });
    return _jsxs("tr", { children: [_jsx("td", { children: BlockExplorerLink(p.tokenAddress) }), _jsx("td", Object.assign({ style: { textAlign: "right" } }, { children: (balance === null || balance === void 0 ? void 0 : balance.toString()) && (balance === null || balance === void 0 ? void 0 : balance.toString()) })), _jsx("td", { children: p.withdrawToAddress && (_jsx("button", Object.assign({ onClick: withdraw }, { children: "Withdraw to Owner" }))) }), _jsx("td", { children: p.withdrawToAddress && (_jsx("input", { id: "withdrawAmount", defaultValue: balance === null || balance === void 0 ? void 0 : balance.toString() })) })] });
}
export default TokenBalance;
