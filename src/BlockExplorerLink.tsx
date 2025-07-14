import { toBeHex } from "ethers"
import { ADDRESSES_BYCHAINID } from "./templateScripts"

function BlockExplorerLink(address: string, chainId: string | undefined) {
    const base = chainId && ADDRESSES_BYCHAINID.get(toBeHex(chainId, 32))?.blockExplorerURL ? ADDRESSES_BYCHAINID.get(toBeHex(chainId, 32))!.blockExplorerURL :"https://etherscan.io"
    console.log(`chainId ${chainId} base ${base} `)
    const url = base + '/address/' + address
    return <a href={url}>{address}</a>
}

export default BlockExplorerLink