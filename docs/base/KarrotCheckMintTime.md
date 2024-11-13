# Solidity API

## RootsyCheckMintTime

Abstract contract that has a modifier to check if the current block timestamp is before the minting period ends.

_RootsyCheckMintTime contract must be inherited by others._

### MintTimeEnded

```solidity
error MintTimeEnded()
```

Error message to be reverted when the minting period has ended.

### notBeforeMintClosed

```solidity
modifier notBeforeMintClosed()
```

Modifier to ensure that the current block timestamp is before the minting period ends.

_Reverts with MintTimeEnded error if the minting period has ended._

### getLotteryContract

```solidity
function getLotteryContract() public view virtual returns (address)
```

This function to retrieve the address of the Lottery contract.

_This function must be implemented by contracts inheriting from RootsyCheckMintTime._

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | address | Address of the Lottery contract. |

