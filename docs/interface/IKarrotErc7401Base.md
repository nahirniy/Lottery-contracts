# Solidity API

## IRootsyErc7401Base

Interface for IRootsyErc7401Base that defines provides basic ERC-7401 functionality.

### totalSupply

```solidity
function totalSupply() external view returns (uint256)
```

Retrieves the total supply of tokens.

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | uint256 | The total number of tokens minted. |

### name

```solidity
function name() external view returns (string)
```

Retrieves the name of the contract.

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | string | The name of the contract. |

### isApprovedOrOwner

```solidity
function isApprovedOrOwner(address spender, uint256 tokenId) external view returns (bool)
```

Checks if the spender is approved or the owner of the token.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| spender | address | The address being checked. |
| tokenId | uint256 | The ID of the token. |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | bool | A boolean indicating whether the spender is approved or the owner of the token. |

