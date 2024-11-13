# Solidity API

## TicketDeployerLibrary

Library for deploying ticket contracts.

_This library provides a function to deploy ticket contracts with specific parameters._

### deployTicket

```solidity
function deployTicket(address defaultAdmin, address minterContract, uint256 ticketsCount, address campaign, string campaignName) external returns (address)
```

Deploys a new ticket contract.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| defaultAdmin | address | The address of the admin for the contract. |
| minterContract | address | The address that can mint organizations, campaigns and tickets. |
| ticketsCount | uint256 | The amount of ticket contracts deployed. |
| campaign | address | The address of the associated campaign contract. |
| campaignName | string | The name of the campaign. |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | address | The address of the newly deployed ticket contract. |

