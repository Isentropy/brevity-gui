import { toBeHex } from "ethers";
import { ScriptAndDesc } from "./ScriptSelector";

//const CLONEFACTORY = '0x7F34DBB490f15A724BB6cee784cFaf351eF62e4C'


const TUTORIAL = `/*
Welcome to Brevity v1. Remember: The only data type is byte32! Example commands:

Define a pre-processor symbol. These are string substitions:

uniswapRouter := 0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45
approve := approve(address,uint256)
exactInputSingle := exactInputSingle((address,address,uint24,address,uint256,uint256,uint160))
tickUpper := 887220

These two are equivilant. Everything is a UINT in Brevity under the hood

tickLower := -887220
tickLower := 0x0000000000000000FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF2764C

Put a new word on the memStack:
var x = 1 + 1

STATICCALL does not change state. write it to named place on memstack:
var tokenOwner = STATICCALL uniswapPositionManager.ownerOf(tokenId)

CALL changes state:
CALL {"value": "msg.value"} weth.approve(uniswapRouter, 1234)

Define Jump point
#myGotoLine

Flow control:
if(!(tokenOwner == this)) revert
if(!(tokenOwner == this)) goto myGotoLine
if(!(tokenOwner == this)) return

*/
`

const CORE = `approve := approve(address,uint256)
balanceOf := balanceOf(address)
transfer := transfer(address,uint256)
log1 := log1(uint256,bytes)
ownerOf := ownerOf(uint256)
`

const EXTRA = `
log0 := log0(bytes)
log2 := log2(uint256,uint256,bytes)
log3 := log3(uint256,uint256,uint256,bytes)
log4 := log4(uint256,uint256,uint256,uint256,bytes)
`

const SUMDEMO = `
// sum squares from 1 to 10
var sum = 0
var i = 0
iMax := 10
#loopStart
if(i > iMax) goto loopEnd
sum += i*i
i += 1
goto loopStart
#loopEnd

// emit a log event with the sum and 0 data
CALL this.log1(sum,64,0)`

const CLONES = `
cloneDeterministic := cloneDeterministic(address,bytes32,address)
predictDeterministicAddress := predictDeterministicAddress(address,bytes32,address)
var owner = STATICCALL this.owner()()
CALL cloneFactory.cloneDeterministic(this, block.timestamp, owner)
`

const UNISWAP_SWAP = `
// INPUTS:
//fromToken := usdc
//fromAmount := 123
//toToken
//toTokenMinOutput := 456
swapFee := 3000
exactInputSingle := exactInputSingle((address,address,uint24,address,uint256,uint256,uint160))

var toTokenBal = CALL uniswapRouter.exactInputSingle(fromToken, toToken, swapFee, this, fromAmount, toTokenMinOutput, 0)
`

const UNISWAP_ADD_LIQUIDITY = `
// INPUTS:
//toToken := usdc

mint := mint((address,address,uint24,int24,int24,uint256,uint256,uint256,uint256,address,uint256))

tickUpper := 887220
tickLower := -887220

CALL {"value": "msg.value"} weth.deposit()()

var wethAmt = STATICCALL weth.balanceOf(this)
// convert half to USDC and put half as liquidity
wethAmt /= 2
CALL weth.approve(uniswapRouter, wethAmt)
var toTokenBal = CALL uniswapRouter.exactInputSingle(weth, toToken, fee, this, wethAmt, 1, 0)
CALL weth.approve(uniswapPositionManager, wethAmt)
CALL toToken.approve(uniswapPositionManager, toTokenBal)
var tokenId, liquidity, amount0, amount1 = CALL uniswapPositionManager.mint(toToken, weth, fee, tickLower, tickUpper, toTokenBal, wethAmt, 0, 0, this, block.timestamp)
var tokenOwner = STATICCALL uniswapPositionManager.ownerOf(tokenId)
if(!(tokenOwner == this)) revert
`
interface Addresses {
    uniswapRouter?: string
    uniswapPositionManager?: string
    weth?: string
    usdc?: string
    cloneFactory?: string
}

function toBrevity(a: Addresses) {
    return Object.entries(a).filter((e) => { return e[1] }).map((e) => { return e[0] + " := " + e[1] }).join("\n")
}

export const ADDRESSES_MAINNET: Addresses = {
    uniswapRouter: "0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45",
    uniswapPositionManager: "0xC36442b4a4522E871399CD717aBDD847Ab11FE88",
    weth: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
    usdc: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48"
}



export const ADDRESSES_GNOSIS: Addresses = {
    cloneFactory: "0x7F34DBB490f15A724BB6cee784cFaf351eF62e4C"
}

const BASESCRIPTS: ScriptAndDesc[] = [
    {
        desc: "sum of squares",
        script: SUMDEMO
    },
    {
        desc: "tutorial comments",
        script: TUTORIAL
    },
    {
        desc: "clone me",
        script: CLONES
    },
    {
        desc: "uniswap swap",
        script: UNISWAP_SWAP
    },
    {
        desc: "uniswap add liquidity",
        script: UNISWAP_ADD_LIQUIDITY
    }

]


export const ADDRESSES_BYCHAINID = new Map<string, Addresses>()
ADDRESSES_BYCHAINID.set("0x0000000000000000000000000000000000000000000000000000000000000001", ADDRESSES_MAINNET)
ADDRESSES_BYCHAINID.set("0x0000000000000000000000000000000000000000000000000000000000000064", ADDRESSES_GNOSIS)


export function scriptsFromChainId(chainId: string | undefined) {
    if(chainId) chainId = toBeHex(chainId, 32)
    const extra = chainId ? ADDRESSES_BYCHAINID.get(chainId) : undefined
    let base = [{
        desc: "core",
        script: "//Welcome to Brevity v1. These are useful definitions:\n\n" + (extra ? toBrevity(extra) + "\n\n" : "")  + CORE + "\n//Type your script here: \n"
    }]
    return base.concat(BASESCRIPTS)
}


