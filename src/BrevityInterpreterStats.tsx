import { useState } from "react";
import { OwnedBrevityInterpreter } from "@isentropy/brevity-lang/typechain-types"
import BlockExplorerLink from "./BlockExplorerLink";
import { Filter, id, toBeHex, ZeroAddress } from "ethers";
import TokenBalance from "./TokenBalance";

function BrevityInterpreterStats(interpreter: OwnedBrevityInterpreter, chainId: string | undefined) {
  const [address, setAddress] = useState<string>();
  const [version, setVersion] = useState<bigint>();
  const [owner, setOwner] = useState<string>();
//  const [uniqueTokens, setUniqueTokens] = useState<string[]>();

  if (!version) interpreter.version().then((v) => {
    setVersion(v)
  })
  if (!owner) interpreter.owner().then((o) => {
    setOwner(o)
  })
  if (!address) interpreter.getAddress().then((a) => {
    setAddress(a)
  })
  return <div className="brevityStats">
    {version?.toString() && (
      <div>
        Brevity Version: {version.toString()}
      </div>
    )}
    {owner && (
      <div>
        Owner: {BlockExplorerLink(owner, chainId)}
      </div>
    )}
  </div>
}

export default BrevityInterpreterStats