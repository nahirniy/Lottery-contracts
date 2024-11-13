# Solidity API

## LotteryDeployerLibrary

Library for deploying lottery contracts.

_This library provides a function to deploy lottery contracts with specific parameters._

### deployLotteryContract

```solidity
function deployLotteryContract(address defaultAdmin, address lowerAdmin, address randomGetterContract, uint256 lotteriesCount, uint32 mintDeadline, uint32 burnDeadline, uint32 lotteryTime) external returns (address)
```

Deploys a new lottery contract.

_Reverts if _mintDeadline is greater than _burnDeadline,
 _burnDeadline is greater than _lotteryTime,
 _mintDeadline is greater than _lotteryTime._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| defaultAdmin | address | The address of the admin for the contract. |
| lowerAdmin | address | The address that can register tickets for the lottery. |
| randomGetterContract | address | randomGetter contract address to get a random number in the lottery. |
| lotteriesCount | uint256 | The number of lotteries deployed. |
| mintDeadline | uint32 | The deadline for ticket minting. |
| burnDeadline | uint32 | The deadline for ticket burning. |
| lotteryTime | uint32 | The time when the lottery will be conducted. |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | address | The address of the newly deployed lottery contract. |

