# Solidity API

## IRootsyTicket

The RootsyTicket contract manages the minting and burning of ticket within the Rootsy platform.

_RootsyTicket contract allows minting tokens to specific campaigns, burning the last minted token,
and retrieving contract-related information._

### TicketMintedToCampaign

```solidity
event TicketMintedToCampaign(uint256 tokenId, uint256 parentId, address campaignAddress)
```

Emitted when a ticket is minted to a parent campaign.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| tokenId | uint256 | The ID of the minted ticket. |
| parentId | uint256 | The ID of the parent campaign. |
| campaignAddress | address | The address of the campaign to which the ticket is minted. |

### TicketBurned

```solidity
event TicketBurned(uint256 tokenId)
```

Emitted when a ticket is burned.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| tokenId | uint256 | The ID of the burned ticket. |

### mintToCampaign

```solidity
function mintToCampaign(uint256 parentId, bytes data) external returns (uint256)
```

Mints a token to the specified parent campaign.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| parentId | uint256 | The ID of the parent campaign. |
| data | bytes | Additional data to include in the minted token. |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | uint256 | The ID of the last minted token. |

### mintToCampaignBatch

```solidity
function mintToCampaignBatch(uint256 tokenCount, uint256 parentId, bytes data) external returns (uint256[])
```

Mints multiple tokens to the specified parent campaign.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| tokenCount | uint256 | The number of tokens to mint. |
| parentId | uint256 | The ID of the parent campaign. |
| data | bytes | Additional data to include in the minted tokens. |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | uint256[] | An array containing the IDs of the minted tokens. |

### getUserTicketIds

```solidity
function getUserTicketIds(address _owner) external view returns (uint256[])
```

Retrieves the ticket IDs owned by a specific user.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| _owner | address | The address of the user whose ticket IDs are to be retrieved. |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | uint256[] | An array containing the IDs of the tickets owned by the specified user. |

### getOrganisation

```solidity
function getOrganisation() external view returns (address)
```

Retrieves the address of the organization associated with the campaign.

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | address | The address of the organization. |

### campaign

```solidity
function campaign() external view returns (address)
```

Retrieves the address of the parent campaign associated with the ticket.

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | address | The address of the campaign. |

### burnLastTicket

```solidity
function burnLastTicket() external
```

Burns the last minted ticket.

_Only callable by the campaign contract.
After swapping the ticket to be burned with the last ticket in RootsyCampaign,
we burn the last ticket using this function._

