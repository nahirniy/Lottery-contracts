# Solidity API

## RandomGetter

RandomGetter gets random numbers for lotteries using chainlink VRF.
RandomGetter contract must be has enough link token, since we pay a link token for getting a random number.

_We use one RandomGetter contract for all lotteries, avoiding the
need to send the link token to the balance of each contract separately._

### callbackGasLimit

```solidity
uint32 callbackGasLimit
```

Gas limit for callback fulfillRandomWords function execution.

### numWords

```solidity
uint32 numWords
```

Amount of random numbers that will be received.

### requestConfirmations

```solidity
uint16 requestConfirmations
```

Minimum amount of confirmations during the request.

### factory

```solidity
contract IRootsyFactory factory
```

Address of the RootsyFactory contract.

### requestIds

```solidity
mapping(address => uint256) requestIds
```

Retrieves the request ID associated with the given lottery address.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |

### randomNumbersByRequestId

```solidity
mapping(uint256 => uint256) randomNumbersByRequestId
```

Retrieves the random number associated with the given request ID.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |

### onlyLottery

```solidity
modifier onlyLottery()
```

The modifier checks whether the function is called from the lottery contract.

### constructor

```solidity
constructor(address _link, address _vrfWrapper, address _factory, address _defaultAdmin) public
```

Constructor function to initialize the RandomGetter contract.

_Reverts if the factory contract does not support their respective interfaces._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| _link | address | The address of the LINK token contract. |
| _vrfWrapper | address | The address of the VRF wrapper contract. |
| _factory | address | The address of the RootsyFactory contract. |
| _defaultAdmin | address | The address of the admin this contract. |

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
function getRandomNumber(uint256 requestId) external view returns (uint256 random)
```

Retrieves the random number associated with the given request ID.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| requestId | uint256 | The unique identifier for the random number request. |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| random | uint256 | random The generated random number. |

### getRandomNumber

```solidity
function getRandomNumber(address lottery) external view returns (uint256 random)
```

Retrieves the random number associated with the given lottery contract address.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| lottery | address | The address of the lottery contract. |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| random | uint256 | random The generated random number. |

### withdraw

```solidity
function withdraw(address token, uint256 amount) public
```

Allows the admin of this contract to withdraw tokens from the contract.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| token | address | The address of the token to withdraw. |
| amount | uint256 | The amount of tokens to withdraw. |

### supportsInterface

```solidity
function supportsInterface(bytes4 interfaceId) public view returns (bool)
```

_Returns true if this contract implements the interface defined by
`interfaceId`. See the corresponding
https://eips.ethereum.org/EIPS/eip-165#how-interfaces-are-identified[EIP section]
to learn more about how these ids are created.

This function call must use less than 30 000 gas._

### fulfillRandomWords

```solidity
function fulfillRandomWords(uint256 _requestId, uint256[] randomWords) internal
```

Fulfills the requested random words.

_Overrides the internal function in the VRFConsumerBase contract._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| _requestId | uint256 | The ID of the request. |
| randomWords | uint256[] | The array of random words to fulfill. |

