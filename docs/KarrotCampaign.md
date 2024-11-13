# Solidity API

## RootsyCampaign

The RootsyCampaign contract manages the creation and ownership of campaign tokens within the Rootsy platform.

_RootsyCampaign allows minting campaign tokens for specific organizations, setting ticket contracts,
burning tickets, and retrieving campaign-related information._

### LOWER_ADMIN_ROLE

```solidity
bytes32 LOWER_ADMIN_ROLE
```

Сonstant that contains the LOWER_ADMIN role. Owner of this role can set the contract ticket.

### lottery

```solidity
address lottery
```

Retrieves the address of the lottery contract associated with this campaign.


### organization

```solidity
address organization
```

Retrieves the address of the parent organization contract associated with this campaign.

### ticketsContract

```solidity
address ticketsContract
```

Retrieves the address of the ticket contract associated with this campaign.

### ownerToken

```solidity
mapping(uint256 => uint256) ownerToken
```

Returns the camapign token ID of the specified parent organization ID.

### organizationToCampaign

```solidity
mapping(uint256 => uint256) organizationToCampaign
```

Returns the camapign token ID of the specified parent organization ID.

_Used to prevent duplicate campaign tokens within organizations._

### constructor

```solidity
constructor(address _defaultAdmin, address _lowerAdmin, address _minter, address _organization, address _lottery, string _name) public
```

Constructor function to initialize the RootsyCampaign contract.

_Reverts if the organization or lottery contracts do not support their respective interfaces._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| _defaultAdmin | address | The address of the admin this contract. |
| _lowerAdmin | address | The address of the lower admin role that can set the contract ticket. Expected to be the RootsyFacotry contract. |
| _minter | address | The address of the minter role that can mint campaign to the organization. |
| _organization | address | The address of the RootsyOrganization contract that is the parent of this RootsyCampaign. |
| _lottery | address | The address of the Lottery contract. |
| _name | string | The name of the contract. |

### mintToOrganization

```solidity
function mintToOrganization(uint256 parentId, bytes data) public returns (uint256 mintedTokenId)
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
| mintedTokenId | uint256 | mintedTokenId The ID of the newly minted token. |

### setTicketContract

```solidity
function setTicketContract(address _ticketsContract) public
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

### burnTicketBatch

```solidity
function burnTicketBatch(uint256 amountOfTicketsToBurn) public
```

Burns a batch of tickets for the current campaign.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| amountOfTicketsToBurn | uint256 | The number of tickets to burn. |

### burnTicket

```solidity
function burnTicket(uint256 campaignId) public
```

Burns the user's ticket for the specified campaign.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| campaignId | uint256 | The ID of the campaign to burn the ticket for. |

### burnTicketBatch

```solidity
function burnTicketBatch(uint256 campaignId, uint256 amountOfTicketsToBurn) public
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
function transferTicket(uint256 toCampaignId) public
```

Transfers a ticket from the campaign associated with the sender to the specified campaign.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| toCampaignId | uint256 | The ID of the campaign to transfer the ticket to. |

### transferTicketBatch

```solidity
function transferTicketBatch(uint256 toCampaignId, uint256 amountOfTicketsToTransfer) public
```

Transfers a batch of tickets from the campaign associated with the sender to the specified campaign.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| toCampaignId | uint256 | The ID of the campaign to transfer the tickets to. |
| amountOfTicketsToTransfer | uint256 | The number of tickets to transfer. |

### transferTicket

```solidity
function transferTicket(uint256 fromCampaignId, uint256 toCampaignId) public
```

Transfers a ticket from the specified campaign to another specified campaign.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| fromCampaignId | uint256 | The ID of the campaign to transfer the ticket from. |
| toCampaignId | uint256 | The ID of the campaign to transfer the ticket to. |

### transferTicketBatch

```solidity
function transferTicketBatch(uint256 fromCampaignId, uint256 toCampaignId, uint256 amountOfTicketsToTransfer) public
```

Transfers a batch of tickets from the specified campaign to another specified campaign.

_Reverts if the number of tickets to transfer exceeds the available tickets in the fromCampaignId._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| fromCampaignId | uint256 | The ID of the campaign to transfer the tickets from. |
| toCampaignId | uint256 | The ID of the campaign to transfer the tickets to. |
| amountOfTicketsToTransfer | uint256 | The number of tickets to transfer. |

### ownerOf

```solidity
function ownerOf(uint256 tokenId) public view returns (address owner_)
```

Used to retrieve the *root* owner of a given token.

_The *root* owner of the token is an externally owned account (EOA). If the given token is child of another
 NFT, this will return an EOA address. Otherwise, if the token is owned by an EOA, this EOA will be returned._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| tokenId | uint256 | ID of the token for which the *root* owner has been retrieved |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| owner_ | address | The *root* owner of the token |

### getLotteryContract

```solidity
function getLotteryContract() public view returns (address)
```

This function to retrieve the address of the Lottery contract.

_This function must be implemented by contracts inheriting from RootsyCheckMintTime._

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | address | Address of the Lottery contract. |

### getUserCampaignId

```solidity
function getUserCampaignId(address _owner) public view returns (uint256)
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

### supportsInterface

```solidity
function supportsInterface(bytes4 interfaceId) public view returns (bool)
```

_Returns true if this contract implements the interface defined by
`interfaceId`. See the corresponding
https://eips.ethereum.org/EIPS/eip-165#how-interfaces-are-identified[EIP section]
to learn more about how these ids are created.

This function call must use less than 30 000 gas._

### _beforeAcceptChild

```solidity
function _beforeAcceptChild(uint256, uint256, address childAddress, uint256) internal virtual
```

Performs check whether the child is a ticket before accepting it

_Ensures that only the ticket contract can be accepted as a child of the campaign._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| childAddress | address | The address of the child contract. |

### _burnTicket

```solidity
function _burnTicket(uint256 campaignId) internal
```

Burns a ticket associated with the given campaign ID.

_Reverts if the caller is not approved or the owner of the ticket.
Transfers the burning ticket to the owner of the last ticket ID.
Transfers the last ticket ID to the burning campaign parent id.
Burns the last ticket ID._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| campaignId | uint256 | The ID of the campaign owning the ticket to be burned. |

