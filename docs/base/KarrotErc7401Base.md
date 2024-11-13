# Solidity API

## RootsyErc7401Base

Abstract contract defines provides basic ERC-7401 functionality.

_RootsyErc7401Base contract must be inherited by others._

### MINTER_ROLE

```solidity
bytes32 MINTER_ROLE
```

Сonstant that contains the MINTER role. Owner of this role can mint organization, campaigns and tickets.

### _lastTokenId

```solidity
uint256 _lastTokenId
```

Total amount of minted tokens. ID of the last ticket.

### name

```solidity
string name
```

Name of the contract.

### constructor

```solidity
constructor(address _defaultAdmin, address _minter, string _name) internal
```

Constructor function to initialize the RootsyErc7401Base contract.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| _defaultAdmin | address | The address of the admin contract that inherits this contract. |
| _minter | address | The address of the minter. |
| _name | string | The name of the contract. |

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

### totalSupply

```solidity
function totalSupply() external view returns (uint256)
```

Retrieves the total supply of tokens.

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | uint256 | The total number of tokens minted. |

### supportsInterface

```solidity
function supportsInterface(bytes4 interfaceId) public view virtual returns (bool)
```

_Returns true if this contract implements the interface defined by
`interfaceId`. See the corresponding
https://eips.ethereum.org/EIPS/eip-165#how-interfaces-are-identified[EIP section]
to learn more about how these ids are created.

This function call must use less than 30 000 gas._

