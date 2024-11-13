# Solidity API

## TicketRedemption

TicketRedemption enables users to exchange tickets for rewards on Rootsy platform before the burn deadline.

_TicketRedemption manages reward token addresses, handles ticket redemption, and oversees redemption price and caps._

### redemptionPrice

```solidity
uint256 redemptionPrice
```

Price per redeemed one ticket.

### redeemed

```solidity
uint256 redeemed
```

The amount of tokens spent on ticket redemption.

### redemptionCap

```solidity
uint256 redemptionCap
```

Maximum total redemption amount of tokens allowed.

### lottery

```solidity
address lottery
```

The address of the associated lottery contract.

### rewardToken

```solidity
contract IERC20 rewardToken
```

Token contract for rewards.

### constructor

```solidity
constructor(address _defaultAdmin, address _lottery) public
```

_Constructor function to initialize the TicketRedemption contract.
Reverts if the lottery contract does not support their respective interfaces._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| _defaultAdmin | address | The address of the admin this contract. |
| _lottery | address | The address of the Lottery contract. |

### setRewardToken

```solidity
function setRewardToken(address _rewardToken) external
```

Sets the reward token contract address.

_Only can be called by accounts with the DEFAULT_ADMIN_ROLE.
Reverts if reward token is not a contract._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| _rewardToken | address | The address of the reward token contract. |

### redeem

```solidity
function redeem(address ticketContract, uint256 amountOfTicketsToBurn) external
```

Redeems(burns) tickets for a reward.

_It is possible to redeem if the TicketRedemption must be approved from RootsyCampaing contract.
After burn, user receives a reward in tokens.
Only callable if burn period hasn't ended, redemption price is set, redemption cap.
isn't reached, user owns an organization and the ticket is registered in the lottery._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| ticketContract | address | The ticket contract address. |
| amountOfTicketsToBurn | uint256 | The number of tickets to redeem. |

### setRedemptionPrice

```solidity
function setRedemptionPrice(uint256 _redemptionPrice) external
```

_Sets the redemption price.
Only can be called by accounts with the DEFAULT_ADMIN_ROLE.
Reverts if the caller doesn't have admin role or if the redemption price is set to 0._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| _redemptionPrice | uint256 | The new redemption price. |

### setRedemptionCap

```solidity
function setRedemptionCap(uint256 _redemptionCap) external
```

Sets the redemption cap.

_Only can be called by accounts with the DEFAULT_ADMIN_ROLE.
redemptionCap can be 0, meaning no cap_

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| _redemptionCap | uint256 | The new redemption cap. A value of 0 indicates no cap. |

### supportsInterface

```solidity
function supportsInterface(bytes4 interfaceId) public view returns (bool)
```

_Returns true if this contract implements the interface defined by
`interfaceId`. See the corresponding
https://eips.ethereum.org/EIPS/eip-165#how-interfaces-are-identified[EIP section]
to learn more about how these ids are created.

This function call must use less than 30 000 gas._

