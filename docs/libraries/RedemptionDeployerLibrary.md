# Solidity API

## RedemptionDeployerLibrary

Library for deploying redemption contracts.

_This library provides a function to deploy redemption contracts with specific parameters._

### deployRedemtionContract

```solidity
function deployRedemtionContract(address defaultAdmin, address lottery, uint256 redemptionsCount) external returns (address)
```

Deploys a new redemption contract.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| defaultAdmin | address | The address of the admin for the contract. |
| lottery | address | The address of the associated lottery contract. |
| redemptionsCount | uint256 | The number of redemptions contracts deployed. |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | address | The address of the newly deployed redemption contract. |

