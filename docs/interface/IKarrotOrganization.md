# Solidity API

## IRootsyOrganization

The RootsyOrganization contract handles the creation and ownership of organization tokens in Rootsy.

_RootsyOrganization allows minting new tokens for specific parent passport and ensures each passport can own only one organization token._

### OrganizationTokenMintedToPassport

```solidity
event OrganizationTokenMintedToPassport(uint256 tokenId, address minter, uint256 passportTokenParentId)
```

Emitted when a organization token is minted to parent passport.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| tokenId | uint256 | The ID of the newly minted organization token. |
| minter | address | The address that minted the organization token. |
| passportTokenParentId | uint256 | The ID of the parent passport token associated with the campaign token. |

### passport

```solidity
function passport() external returns (address)
```

Retrieves address of the passport contract, which can mint tokens that owns organizations.

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | address | RootsyPassport contract address. |

### mintToPassport

```solidity
function mintToPassport(uint256 parentId, bytes data) external returns (uint256)
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
| [0] | uint256 | The ID of the newly minted token. |

### ownerToken

```solidity
function ownerToken(uint256 tokenId) external view returns (uint256)
```

Returns the organization token ID of the specified parent passport ID.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| tokenId | uint256 | The ID of the parent passport token. |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | uint256 | The organization token ID. |

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

