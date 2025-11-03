import { toBeHex } from "ethers";

export interface ScriptAndDesc {
    desc: string
    script: string
    inputs?: string[]
}

//const CLONEFACTORY = '0x7F34DBB490f15A724BB6cee784cFaf351eF62e4C'

export function composeScript(script: ScriptAndDesc, params: string[]) {
    let output = ''
    if(script.inputs) {
        if(script.inputs.length != params.length) throw Error(`can make snippet. expected ${script.inputs.length}, found ${params.length}`)
        for(let i=0; i < params.length; i++) {
            output += `${script.inputs[i]} := ${params[i]}\n`
        }
    }
    output += script.script + '\n'
    return output
}

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
CALL {value: msg.value} weth.approve(uniswapRouter, 1234)

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

const DATA_RECORD = `
topicDataRecord := 0x5103b4be73294a3900dd402358b5ddc98b11ac0b4cde2542de6ea42f1b36487b
s := "hiiii"
log3 := log3(uint256,uint256,uint256,bytes)
CALL this.log3(topicDataRecord, 0, 0, 128, s)
`

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

tokenSymbol := "TEST"
// one million in wei
mintAmount := 1000000000000000000000000
// who gets minted tokens
mintRecipient := this

CALL cloneFactory.cloneDeterministic(testToken, salt, 0)
CALL newToken.tokenInit(96, this, mintAmount, tokenSymbol)
`


const BASESCRIPTS: ScriptAndDesc[] = [
    {
        desc: "sum of squares",
        script: SUMDEMO,
        inputs: ["foo", "bar"]
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
        desc: "mint ERC20",
        script: TESTOKEN
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

interface Addresses {
    uniswapRouter?: string
    uniswapPositionManager?: string
    weth?: string
    usdc?: string
    cloneFactory?: string
    blockExplorerURL?: string
    testToken?: string
    templateInterpreter?: string
}

function toBrevity(a: Addresses) {
    return Object.entries(a).filter((e) => { return e[1]?.toString().startsWith("0x") }).map((e) => { return e[0] + " := " + e[1] }).join("\n")
}

export const ADDRESSES_BYCHAINID = new Map<string, Addresses>()

// mainnet
ADDRESSES_BYCHAINID.set(toBeHex(1, 32), {
    cloneFactory: "0x5C199aa90E2E360Cc80D5fdfC75534E7b68c04e7",
    uniswapRouter: "0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45",
    uniswapPositionManager: "0xC36442b4a4522E871399CD717aBDD847Ab11FE88",
    weth: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
    usdc: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
    blockExplorerURL: "https://etherscan.io",
    templateInterpreter: "0x7825a0C45Daf9b43B70E417bd2e022860531dB83"
})

// gnosis
ADDRESSES_BYCHAINID.set(toBeHex(100, 32), {
    cloneFactory: "0xcFD06039eE4DAf792e4f7754A8D628E012B44A9C",
    blockExplorerURL: "https://gnosisscan.io",
    testToken: "0x20aaD28112Afed8cdDE7cACc49807D618A8C497E",
    templateInterpreter: "0xb6AA3ce7d5eAcD1a1faE7A9740a5064436946eA3"
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
    if(chainId) chainId = toBeHex(chainId, 32)
    const extra = chainId ? ADDRESSES_BYCHAINID.get(chainId) : undefined
    let base = [{
        desc: "core",
        script: "//Welcome to Brevity v1. These are useful definitions:\n\n" + (extra ? toBrevity(extra) + "\n\n" : "")  + CORE + "\n//Type your script here: \n"
    }]
    return base.concat(BASESCRIPTS)
}


