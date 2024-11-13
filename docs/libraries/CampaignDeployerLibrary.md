# Solidity API

## CampaignDeployerLibrary

Library for deploying campaign contracts.

_This library provides a function to deploy campaign contracts with specific parameters._

### deployCampaignContract

```solidity
function deployCampaignContract(address defaultAdmin, address lowerAdmin, address minterContract, uint256 campaignsCount, address lottery, address organization, string campaignName) external returns (address)
```

Deploys a new campaign contract.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| defaultAdmin | address | The address of the admin for the contract. |
| lowerAdmin | address | The address that can set the ticket contract for the campaign. |
| minterContract | address | The address that can mint organizations, campaigns and tickets. |
| campaignsCount | uint256 | The amount of campaigns deployed. |
| lottery | address | The address of the lottery contract in that the campaign participates. |
| organization | address | The address of the parent organization contract. |
| campaignName | string | The name of the campaign. |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | address | The address of the newly deployed campaign contract. |

