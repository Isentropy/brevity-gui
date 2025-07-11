import { ScriptAndDesc } from "./ScriptSelector";



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

const CORE=`approve := approve(address,uint256)
balanceOf := balanceOf(address)
ownerOf := ownerOf(uint256)
usdc := 0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48
withdrawAll := withdrawAll(address)
`

const UNISWAP_CONSTANTS=`
uniswapRouter := 0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45
uniswapPositionManager := 0xC36442b4a4522E871399CD717aBDD847Ab11FE88
weth := 0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2
mint := mint((address,address,uint24,int24,int24,uint256,uint256,uint256,uint256,address,uint256))
exactInputSingle := exactInputSingle((address,address,uint24,address,uint256,uint256,uint160))
`

const UNISWAP_ADD_LIQUIDITY =`
// convert half of msg.value into USDC, then add liquidity with the other with USDC 

// INPUTS:
//toToken := usdc

tickUpper := 887220
tickLower := -887220
fee := 3000

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
export const SCRIPTS: ScriptAndDesc[] = [
    {
        desc: "core",
        script: CORE + "\n// Welcome to Brevity v1. Type your script here: \n"
    },
    {
        desc: "tutorial comments",
        script: TUTORIAL

        },
    {
        desc: "uniswap constants",
        script: UNISWAP_CONSTANTS
    },

    {
        desc: "uniswap add liquidity",
        script: UNISWAP_ADD_LIQUIDITY
    }
]
