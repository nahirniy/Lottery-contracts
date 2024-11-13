# Solidity API

## IRandomGetter

RandomGetter gets random numbers for lotteries using chainlink VRF.
RandomGetter contract must be has enough link token, since we pay a link token for getting a random number.

_We use one RandomGetter contract for all lotteries, avoiding the
need to send the link token to the balance of each contract separately._

### RequestSent

```solidity
event RequestSent(uint256 requestId, uint32 numWord)
```

Emitted when a request for a random number is sent.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| requestId | uint256 | The ID of request that is done. |
| numWord | uint32 | The number of random words requested. |

### RequestFulfilled

```solidity
event RequestFulfilled(uint256 requestId, uint256 randomWord)
```

Emitted when a request for a random number is fulfilled.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| requestId | uint256 | The ID of request that is done. |
| randomWord | uint256 | The generated random number. |

### requestIds

```solidity
function requestIds(address lotteryAddress) external view returns (uint256)
```

Retrieves the request ID associated with the given lottery address.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| lotteryAddress | address | The address of the lottery. |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | uint256 | The associated request ID. |

### randomNumbersByRequestId

```solidity
function randomNumbersByRequestId(uint256 requestId) external view returns (uint256)
```

Retrieves the random number associated with the given request ID.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| requestId | uint256 | The ID of the request. |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | uint256 | The associated random number. |

### requestRandomNumber

```solidity
function requestRandomNumber() external returns (uint256)
```

Requests a random number for the calling lottery contract
after that calls the VRF that returns the requestId. With this requestId we can get a random number.

_Only can be called callable by the lottery contract itself.
Reverts if the lottery contract already has random number request is pending._

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | uint256 | requestId The unique identifier for the random number request. |

### getRandomNumber

```solidity
function getRandomNumber(uint256 requestId) external view returns (uint256)
```

Retrieves the random number associated with the given request ID.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| requestId | uint256 | The unique identifier for the random number request. |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | uint256 | random The generated random number. |

### getRandomNumber

```solidity
function getRandomNumber(address lottery) external view returns (uint256)
```

Retrieves the random number associated with the given lottery contract address.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| lottery | address | The address of the lottery contract. |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | uint256 | random The generated random number. |

### withdraw

```solidity
function withdraw(address token, uint256 amount) external
```

Allows the admin of this contract to withdraw tokens from the contract.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| token | address | The address of the token to withdraw. |
| amount | uint256 | The amount of tokens to withdraw. |

