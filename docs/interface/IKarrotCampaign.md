# Solidity API

## IRootsyCampaign

The RootsyCampaign contract manages the creation and ownership of campaign tokens within the Rootsy platform.

_RootsyCampaign allows minting campaign tokens for specific organizations, setting ticket contracts,
burning tickets, and retrieving campaign-related information._

### MissingAdminRole

```solidity
error MissingAdminRole(address caller)
```

Error emitted when an account lacks admin role permissions.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| caller | address | The address of the account that attempted an action without sufficient permissions. |

### CampaignTokenMintedToOrganization

```solidity
event CampaignTokenMintedToOrganization(uint256 tokenId, address minter, uint256 organizationTokenParentId)
```

Emitted when a campaign token is minted to parent organization.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| tokenId | uint256 | The ID of the newly minted campaign token. |
| minter | address | The address that minted the campaign token. |
| organizationTokenParentId | uint256 | The ID of the parent organization associated with the campaign token. |

### TicketContractSet

```solidity
event TicketContractSet(address ticketsContract, address setter)
```

Emitted when the ticket contract address is set for the campaign.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| ticketsContract | address | The address of the ticket contract. |
| setter | address | The address that set the ticket contract. |

### organization

```solidity
function organization() external view returns (address)
```

Retrieves the address of the parent organization contract associated with this campaign.

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | address | The address of the organization contract that is the parent of this campaign. |

### lottery

```solidity
function lottery() external view returns (address)
```

Retrieves the address of the lottery contract associated with this campaign.

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | address | The address of the lottery contract in that the campaign participates. |

### ticketsContract

```solidity
function ticketsContract() external view returns (address)
```

Retrieves the address of the ticket contract associated with this campaign.

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | address | The address of the ticket contract associated with the campaign token. |

### ownerToken

```solidity
function ownerToken(uint256 tokenId) external view returns (uint256)
```

Returns the camapign token ID of the specified parent organization ID.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| tokenId | uint256 | The ID of the organization token. |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | uint256 | The camapign token ID. |

### organizationToCampaign

```solidity
function organizationToCampaign(uint256 organizationId) external view returns (uint256)
```

Returns the camapign token ID of the specified parent organization ID.

_Used to prevent duplicate campaign tokens within organizations._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| organizationId | uint256 | The ID of the organization. |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | uint256 | The associated campaign ID. |

### mintToOrganization

```solidity
function mintToOrganization(uint256 parentId, bytes data) external returns (uint256)
```

Mints a new campaign token to the specified parent organization.

_Reverts if the parent organization already has the campaign token._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| parentId | uint256 | The ID of the parent organization. |
| data | bytes | Additional data to include in the minted token. |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | uint256 | mintedTokenId The ID of the newly minted token. |

### setTicketContract

```solidity
function setTicketContract(address _ticketsContract) external
```

Sets the ticket contract address.

_Reverts if the sender does not have the required admin role.
Reverts if the ticket contract does not support the IRootsyTicket interface._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| _ticketsContract | address | The address of the ticket contract to set. |

### burnTicket

```solidity
function burnTicket() external
```

Burns the user's ticket for the current campaign.

_Retrieves the campaign ID for the user and calls _burnTicket.
Transfers the burning ticket to the owner of the last ticket ID.
Transfers the last ticket ID to the burning campaign.
The owner of the last ticket loses it, but received the burning ticket.
We swap the ticket to be burned with the last ticket, then burn the last one.
Due this swap approach user's ticket ID(s) may change and it's expected behaviour,
since it does not change the chance of winning lottery_

### burnTicket

```solidity
function burnTicket(uint256 campaignId) external
```

Burns the user's ticket for the specified campaign.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| campaignId | uint256 | The ID of the campaign to burn the ticket for. |

### burnTicketBatch

```solidity
function burnTicketBatch(uint256 amountOfTicketsToBurn) external
```

Burns a batch of tickets for the current campaign.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| amountOfTicketsToBurn | uint256 | The number of tickets to burn. |

### burnTicketBatch

```solidity
function burnTicketBatch(uint256 campaignId, uint256 amountOfTicketsToBurn) external
```

Burns a batch of tickets for the specified campaign.

_Reverts if the specified amount exceeds the available campaign tickets._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| campaignId | uint256 | The ID of the campaign to burn tickets for. |
| amountOfTicketsToBurn | uint256 | The number of tickets to burn. |

### transferTicket

```solidity
function transferTicket(uint256 toCampaignId) external
```

Transfers a ticket from the campaign associated with the sender to the specified campaign.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| toCampaignId | uint256 | The ID of the campaign to transfer the ticket to. |

### transferTicketBatch

```solidity
function transferTicketBatch(uint256 toCampaignId, uint256 amountOfTicketsToTransfer) external
```

Transfers a batch of tickets from the campaign associated with the sender to the specified campaign.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| toCampaignId | uint256 | The ID of the campaign to transfer the tickets to. |
| amountOfTicketsToTransfer | uint256 | The number of tickets to transfer. |

### transferTicket

```solidity
function transferTicket(uint256 fromCampaignId, uint256 toCampaignId) external
```

Transfers a ticket from the specified campaign to another specified campaign.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| fromCampaignId | uint256 | The ID of the campaign to transfer the ticket from. |
| toCampaignId | uint256 | The ID of the campaign to transfer the ticket to. |

### transferTicketBatch

```solidity
function transferTicketBatch(uint256 fromCampaignId, uint256 toCampaignId, uint256 amountOfTicketsToTransfer) external
```

Transfers a batch of tickets from the specified campaign to another specified campaign.

_Reverts if the number of tickets to transfer exceeds the available tickets in the fromCampaignId._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| fromCampaignId | uint256 | The ID of the campaign to transfer the tickets from. |
| toCampaignId | uint256 | The ID of the campaign to transfer the tickets to. |
| amountOfTicketsToTransfer | uint256 | The number of tickets to transfer. |

### getUserCampaignId

```solidity
function getUserCampaignId(address _owner) external view returns (uint256)
```

Retrieves the campaign ID associated with a specific user.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| _owner | address | The address of the user whose campaign ID is to be retrieved. |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | uint256 | The campaign ID associated with the specified user. |

