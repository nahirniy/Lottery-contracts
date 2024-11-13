# Solidity API

## ITicketManager

The TicketManager contract manages the creation and transfer of tickets for campaigns on the Rootsy platform.

_TicketManager ensures that tickets are minted and transferred for end owners within specified campaigns._

### mintTicketsBatch

```solidity
function mintTicketsBatch(address[] endOwners, address[] campaigns, uint256[] ticketsCounts) external returns (uint256[][] ticketsTokenIds)
```

Mints tickets for multiple end owners in batches.

_Reverts if the length of `endOwners`, `campaigns`, and `ticketsCounts` do not match._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| endOwners | address[] | An array of end owners to whom tickets will be minted. |
| campaigns | address[] | An array of campaign addresses for which tickets are being minted. |
| ticketsCounts | uint256[] | An array specifying the number of tickets to mint for each end owner. |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| ticketsTokenIds | uint256[][] | An array of arrays containing the token IDs of the minted tickets for each end owner. |

### mintTickets

```solidity
function mintTickets(address endOwner, address campaign, uint256 ticketsCount) external returns (uint256[] ticketsTokenIds)
```

Mints tickets for a specific end owner in a campaign.

_If any organization is found for the endOwner, we will mint it for him.
If any campaign is found for the endOwner, we will mint it for him._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| endOwner | address | The address of the end owner who will receive the tickets. |
| campaign | address | The address of the campaign for which tickets are being minted. |
| ticketsCount | uint256 | The number of tickets to mint. |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| ticketsTokenIds | uint256[] | An array containing the token IDs of the minted tickets. |

### transferTicketsBatch

```solidity
function transferTicketsBatch(address[] recipient, address[] campaigns, uint256[] ticketsCounts) external
```

Transfers tickets in batch to multiple recipients for different campaigns

_Reverts if the length of `recipient`, `campaigns`, and `ticketsCounts` do not match._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| recipient | address[] | An array of recipient to whom tickets will be transferred. |
| campaigns | address[] | An array of campaign addresses for which tickets are being transferred. |
| ticketsCounts | uint256[] | Array of ticket counts to be transferred to each recipient for each campaign. |

### transferTickets

```solidity
function transferTickets(address recipient, address campaign, uint256 ticketCounts) external
```

Transfers tickets to a recipient for a specific campaign

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| recipient | address | The address of the recipient who will receive the tickets. |
| campaign | address | The address of the campaign for which tickets are being transferred. |
| ticketCounts | uint256 | Number of tickets to be transferred. |

