# Solidity API

## OrganizationDeployerLibrary

Library for deploying organization contracts.

_This library provides a function to deploy organization contracts with specific parameters._

### deployOrganizationContract

```solidity
function deployOrganizationContract(address defaultAdmin, address minter, address passportContract, uint256 organizationsCount, string organizationName) external returns (address)
```

Deploys a new organization contract.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| defaultAdmin | address | The address of the admin for the contract. |
| minter | address | The address that can mint organizations, campaigns and tickets. |
| passportContract | address |  |
| organizationsCount | uint256 | The number of organizations deployed so far. |
| organizationName | string | The name of the organization. |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | address | The address of the newly deployed organization contract. |

