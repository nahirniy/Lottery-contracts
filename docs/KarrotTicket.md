# Solidity API

## RootsyTicket

The RootsyTicket contract manages the minting and burning of ticket within the Rootsy platform.

_RootsyTicket contract allows minting tokens to specific campaigns, burning the last minted token,
and retrieving contract-related information._

### campaign

```solidity
address campaign
```

Retrieves the address of the parent campaign associated with the ticket.

### constructor

```solidity
constructor(address _defaultAdmin, address _minter, address _campaign, string _name) public
```

Constructor function to initialize the RootsyTicket contract.

_Reverts if the campaign contract does not support their respective interfaces._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| _defaultAdmin | address | The address of the admin this contract. |
| _minter | address | The address of the minter role. |
| _campaign | address | The address of the RootsyCampaign contract. |
| _name | string | The name of the contract. |

### mintToCampaign

```solidity
function mintToCampaign(uint256 parentId, bytes data) public returns (uint256)
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
function mintToCampaignBatch(uint256 tokenCount, uint256 parentId, bytes data) public returns (uint256[])
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

### burnLastTicket

```solidity
function burnLastTicket() external
```

Burns the last minted ticket.

_Only callable by the campaign contract.
After swapping the ticket to be burned with the last ticket in RootsyCampaign,
we burn the last ticket using this function._

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

### getOrganisation

```solidity
function getOrganisation() public view returns (address)
```

Retrieves the address of the organization associated with the campaign.

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | address | The address of the organization. |

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

### supportsInterface

```solidity
function supportsInterface(bytes4 interfaceId) public view returns (bool)
```

_Returns true if this contract implements the interface defined by
`interfaceId`. See the corresponding
https://eips.ethereum.org/EIPS/eip-165#how-interfaces-are-identified[EIP section]
to learn more about how these ids are created.

This function call must use less than 30 000 gas._

### _mintToCampaign

```solidity
function _mintToCampaign(uint256 parentId, bytes data) internal
```

Mints a new token and assigns it to the specified parent campaign.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| parentId | uint256 | The ID of the parent campaign. |
| data | bytes | Additional data to include in the minted token. |

