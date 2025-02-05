import { jsx as _jsx } from "react/jsx-runtime";
function BlockExplorerLink(address) {
    const url = 'https://gnosisscan.io/address/' + address;
    return _jsx("a", Object.assign({ href: url }, { children: address }));
}
export default BlockExplorerLink;
