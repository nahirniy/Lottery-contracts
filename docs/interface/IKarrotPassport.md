# Solidity API

## IRootsyPassport

_RootsyPassport contract handles the creation and ownership of passport tokens which own organizations.
RootsyPassport allows minting new tokens for specific addresses and ensures each address can own only one passport token._

### PassportTokenMinted

```solidity
event PassportTokenMinted(address to, uint256 tokenId)
```

_Event emitted when a passport token is minted._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| to | address | The address the token is minted to. |
| tokenId | uint256 | The ID of the minted token. |

### ownerToken

```solidity
function ownerToken(address owner) external view returns (uint256)
```

Get the token ID owned by an address.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| owner | address | The address to query. |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | uint256 | tokenId The token ID owned by the address. |

### mintTo

```solidity
function mintTo(address to, bytes data) external returns (uint256)
```

Mint a new passport token to a specified address.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| to | address | The address to mint the token to. |
| data | bytes | Additional data to include in the minted token. |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | uint256 | tokenId The ID of the minted token. |

