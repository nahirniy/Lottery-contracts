# Solidity API

## ITicketRedemption

TicketRedemption enables users to exchange tickets for rewards on Rootsy platform before the burn deadline.

_TicketRedemption manages reward token addresses, handles ticket redemption, and oversees redemption price and caps._

### TicketRedeemed

```solidity
event TicketRedeemed(address redeemer, address ticketContract, uint256 ticketsCount, uint256 redemptionAmount)
```

Emitted when tickets are redeemed for a reward.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| redeemer | address | The address of the redeemer that burned his tiсket. |
| ticketContract | address | The address of the ticket contract. |
| ticketsCount | uint256 | The number of tickets redeemed. |
| redemptionAmount | uint256 | The amount of reward tokens redeemed. |

### SetRedemptionPrice

```solidity
event SetRedemptionPrice(uint256 redemptionPrice)
```

Emitted when the redemption price is set.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| redemptionPrice | uint256 | The new redemption price. |

### SetRedemptionCap

```solidity
event SetRedemptionCap(uint256 redemptionCap)
```

Emitted when the redemption cap is set.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| redemptionCap | uint256 | The new redemption cap. |

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

