import { toBeHex } from "ethers";

export interface ScriptAndDesc {
    desc: string
    script: string | ((params: string[]) => string)
    inputs?: string[]
    //customCompose?: (params: string[]) => string
}

//const CLONEFACTORY = '0x7F34DBB490f15A724BB6cee784cFaf351eF62e4C'

export function composeScript(script: ScriptAndDesc, params: string[]): string {
    let output = ''
    if (script.inputs) {
        if (script.inputs.length != params.length) throw Error(`can make snippet. expected ${script.inputs.length}, found ${params.length}`)
        for (let i = 0; i < params.length; i++) {
            output += `${script.inputs[i]} := ${params[i]}\n`
        }
    }
    if (typeof script.script == 'function') output += script.script(params) + '\n'
    else output += script.script + '\n'
    return output
}


const EXTRA = `
log0 := log0(bytes)
log2 := log2(uint256,uint256,bytes)
log3 := log3(uint256,uint256,uint256,bytes)
log4 := log4(uint256,uint256,uint256,uint256,bytes)
`

const CLONES = `
cloneDeterministic := cloneDeterministic(address,bytes32,address)
predictDeterministicAddress := predictDeterministicAddress(address,bytes32,address)
var owner = STATICCALL this.owner()()
CALL cloneFactory.cloneDeterministic(this, block.timestamp, owner)
`

function UNISWAP_SWAP(params: string[]) {
//    const fromToken = params[0]
//    const toToken = params[2]
    
    return `
// INPUTS: fromToken, fromAmount, toToken, toTokenMinOutput
swapFee := 3000
CALL fromToken.approve(address,uint256)(UNISWAP_ROUTER, fromAmount)
exactInputSingle := exactInputSingle((address,address,uint24,address,uint256,uint256,uint160))
var toTokenBal = CALL UNISWAP_ROUTER.exactInputSingle(fromToken, toToken, swapFee, this, fromAmount, toTokenMinOutput, 0)
`

}



const UNISWAP_ADD_LIQUIDITY = `
mint := mint((address,address,uint24,int24,int24,uint256,uint256,uint256,uint256,address,uint256))
exactInputSingle := exactInputSingle((address,address,uint24,address,uint256,uint256,uint160))

// INPUTS:
//tokenA := weth
//amountA := 123
//tokenB := usdc
//amountB := 456

tickUpper := 887220
tickLower := -887220
fee := 3000

//CALL {value: tokenA} weth.deposit()()
CALL tokenA.approve(uniswapPositionManager, amountA)
CALL tokenB.approve(uniswapPositionManager, amountB)
var tokenId, liquidity, amount0, amount1 = CALL uniswapPositionManager.mint(tokenA, tokenB, fee, tickLower, tickUpper, amountA, amountB, 0, 0, this, block.timestamp)
var tokenOwner = STATICCALL uniswapPositionManager.ownerOf(tokenId)
if(!(tokenOwner == this)) revert
`

const TESTOKEN = `
tokenInit := init(string,address,uint256)
cloneDeterministic := cloneDeterministic(address,bytes32,address)
predictDeterministicAddress := predictDeterministicAddress(address,bytes32,address)


var salt = this + block.timestamp
var newToken = STATICCALL cloneFactory.predictDeterministicAddress(testToken, salt, 0)

//tokenSymbol := "TEST"
// one million in wei
mintAmount := 1000000000000000000000000
// who gets minted tokens
mintRecipient := this

CALL cloneFactory.cloneDeterministic(testToken, salt, 0)
CALL newToken.tokenInit(96, this, mintAmount, tokenSymbol)
`

const WRAP_WETH = `
CALL {value: amountWei} WETH.deposit()()
`

const CHECK_ERC20_BAL = `
// inputs: token, minBal
var erc20Bal = STATICCALL token.balanceOf(address)(this)
if(erc20Bal < minBal) revert
`

const CHECK_NATIVE_BAL = `
// inputs: minBal
var nativeBal = balance(this)
if(nativeBal < minBal) revert
`



const BASESCRIPTS: ScriptAndDesc[] = [
    {
        desc: "wrap ETH",
        script: WRAP_WETH,
        inputs: ["amountWei"]
    },
    {
        desc: "check native balance",
        script: CHECK_NATIVE_BAL,
        inputs: ["minBal"]
    },
    {
        desc: "check ERC20 balance",
        script: CHECK_ERC20_BAL,
        inputs: ["token", "minBal"]
    },
    {
        desc: "uniswap swap",
        script: UNISWAP_SWAP,
        inputs: ["fromToken", "fromAmount", "toToken", "toTokenMinOutput"]
    }

]
//// INPUTS: fromToken, fromAmount, toToken, toTokenMinOutput


interface Addresses {
    UNISWAP_ROUTER?: string
    UNISWAP_POSTION_MANAGER?: string
    WETH?: string
    USDC?: string
    CLONE_FACTORY?: string
    blockExplorerURL?: string
    TEST_TOKEN?: string
    TEMPLATE_INTERPRETER?: string
}

export function toBrevity(a: Addresses | undefined) {
    if (!a) return ''
    return Object.entries(a).filter((e) => { return e[1]?.toString().startsWith("0x") }).map((e) => { return e[0] + " := " + e[1] }).join("\n")
}

export const ADDRESSES_BYCHAINID = new Map<string, Addresses>()

// mainnet
ADDRESSES_BYCHAINID.set(toBeHex(1, 32), {
    CLONE_FACTORY: "0x5C199aa90E2E360Cc80D5fdfC75534E7b68c04e7",
    UNISWAP_ROUTER: "0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45",
    UNISWAP_POSTION_MANAGER: "0xC36442b4a4522E871399CD717aBDD847Ab11FE88",
    WETH: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
    USDC: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
    blockExplorerURL: "https://etherscan.io",
    TEMPLATE_INTERPRETER: "0x7825a0C45Daf9b43B70E417bd2e022860531dB83"
})

// gnosis
ADDRESSES_BYCHAINID.set(toBeHex(100, 32), {
    CLONE_FACTORY: "0xcFD06039eE4DAf792e4f7754A8D628E012B44A9C",
    blockExplorerURL: "https://gnosisscan.io",
    TEST_TOKEN: "0x20aaD28112Afed8cdDE7cACc49807D618A8C497E",
    TEMPLATE_INTERPRETER: "0xb6AA3ce7d5eAcD1a1faE7A9740a5064436946eA3"
})

// optimism
ADDRESSES_BYCHAINID.set(toBeHex(10, 32), {
    blockExplorerURL: "https://optimistic.etherscan.io"
})

// arbitrum one
ADDRESSES_BYCHAINID.set(toBeHex(42161, 32), {
    blockExplorerURL: "https://arbiscan.io"
})


//avax C chain
ADDRESSES_BYCHAINID.set(toBeHex(43114, 32), {
    blockExplorerURL: "https://snowtrace.io"
})



export function scriptsFromChainId(chainId: string | undefined) {
    /*
    if(chainId) chainId = toBeHex(chainId, 32)
        const extra = chainId ? ADDRESSES_BYCHAINID.get(chainId) : undefined
    let base = [{
        desc: "core",
        script: "//Welcome to Brevity v1. These are useful definitions:\n\n" + (extra ? toBrevity(extra) + "\n\n" : "")  + CORE + "\n//Type your script here: \n"
    }]
    */
    return BASESCRIPTS
}


