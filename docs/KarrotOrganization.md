# Solidity API

## RootsyOrganization

The RootsyOrganization contract handles the creation and ownership of organization tokens in Rootsy.

_RootsyOrganization allows minting new tokens for specific parent passport and ensures each passport can own only one organization token._

### passport

```solidity
address passport
```

Retrieves address of the passport contract, which can mint tokens that owns organizations.

### ownerToken

```solidity
mapping(uint256 => uint256) ownerToken
```

Returns the organization token ID of the specified parent passport ID.

### constructor

```solidity
constructor(address _defaultAdmin, address _minter, address _passport, string _name) public
```

Constructor function to initialize the RootsyOrganization contract.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| _defaultAdmin | address | The address of the admin this contract. |
| _minter | address | The address of the minter role. |
| _passport | address | The address of the passport contract that is the parent of this organization. |
| _name | string | The name of the contract. |

### mintToPassport

```solidity
function mintToPassport(uint256 parentId, bytes data) public returns (uint256 mintedTokenId)
```

Mints a new organization token to the specified parent passport.

_Reverts if the parent passport already owns an organization token._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| parentId | uint256 | The ID of the parent passport. |
| data | bytes | Additional data to include in the minted token. |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| mintedTokenId | uint256 | The ID of the newly minted token. |

### getUserOrganizationId

```solidity
function getUserOrganizationId(address _owner) external view returns (uint256)
```

Retrieves the organization ID associated with a specific user.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| _owner | address | The address of the owner who has a passport token that owns this organization. |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | uint256 | The organization ID associated with the specified user. |

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

Performs check whether the child has IRootsyCampaign interface before accepting it.

_Throws an error if the child contract does not support the IRootsyCampaign interface._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| childAddress | address | The address of the child contract. |


