# Solidity API

## ILottery

Manages lottery functionality including ticket registration, initialization, running, and rewarding winners.
The lottery has 3 tiers type - jackpot, random and fixed. 
Winners are selected from registered tickets using a specific algorithm that relies on a random number generated
by the Chainlink VRF to ensure randomness, then receive a reward in their wallet.

### RegisterTicketContract

```solidity
event RegisterTicketContract(address organization, address ticketContract)
```

Emitted when a ticket contract is registered for a specific organization.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| organization | address | The address of the organization registering the ticket contract. |
| ticketContract | address | The address of the registered ticket contract. |

### LotteryInitialized

```solidity
event LotteryInitialized(uint256 organizationsCount)
```

Emitted when the lottery is initialized with a certain amount of organizations.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| organizationsCount | uint256 | The amount of organizations initialized for the lottery. |

### LotterySetup

```solidity
event LotterySetup(address rewardToken, struct ILottery.Tier[] tiers, uint256[] organizationSharesForFixedTiers)
```

Emitted when the lottery setup is completed with reward token, tiers, and organization shares for fixed tiers.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| rewardToken | address | The address of the token used as rewards. |
| tiers | struct ILottery.Tier[] | An array containing the configuration of lottery tiers. |
| organizationSharesForFixedTiers | uint256[] | An array containing the percentage shares of organizations for fixed tiers. |

### TierProcessed

```solidity
event TierProcessed(uint256 tierIndex, address organization, uint256 totalRewardAmount)
```

Emitted when a tier in the lottery is processed, indicating the total reward amount for the tier.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| tierIndex | uint256 | The index of the processed tier. |
| organization | address | The address of the organization associated with the tier if it is(used for fixed tier). |
| totalRewardAmount | uint256 | The total reward amount distributed for the tier. |

### WinnerDefined

```solidity
event WinnerDefined(address winner, uint256 lotteryTicketId, address campaignTicketContract, uint256 campaignTicketId, uint256 tierType, uint256 rewardAmount)
```

Emitted when a winner is defined for a specific lottery ticket in a tier.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| winner | address | The address of the winner. |
| lotteryTicketId | uint256 | The ID of the lottery ticket that won. |
| campaignTicketContract | address | The address of the ticket contract associated with the ticket ID that won. |
| campaignTicketId | uint256 | The ID of the parent campaign associated with the ticket that won. |
| tierType | uint256 | The type of tier in which the winner is defined. |
| rewardAmount | uint256 | The amount of reward received by the winner. |

### LotteryFinished

```solidity
event LotteryFinished()
```

Emitted when the lottery is finished, indicating that all tiers have been processed.

### CampaignTickets

Struct representing campaign tickets, containing the ticket contract address and ticket range(first and last ticket IDs).

```solidity
struct CampaignTickets {
  address campaignTicketContract;
  struct ILottery.TicketRange ticketRange;
}
```

### TicketRange

Struct representing the range of lottery tickets for a specific organization - first and last tikcet IDs.

```solidity
struct TicketRange {
  uint256 firstLotteryTicketId;
  uint256 lastLotteryTicketId;
}
```

### Tier

Struct representing a tier in the lottery, containing the tier type, winners share, winners count, and reward amount.

```solidity
struct Tier {
  enum ILottery.TierType tierType;
  uint256 winnersShare;
  uint256 winnersCount;
  uint256 rewardAmount;
}
```

### TierType

Enum representing the types of tiers in the lottery: Jackpot, Random, and Fixed.

```solidity
enum TierType {
  Jackpot,
  Random,
  Fixed
}
```

### mintDeadline

```solidity
function mintDeadline() external view returns (uint32)
```

Retrieves the deadline for minting tickets.

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | uint32 | The timestamp indicating the deadline for minting tickets. |

### burnDeadline

```solidity
function burnDeadline() external view returns (uint32)
```

Retrieves the deadline for burning tickets.

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | uint32 | The timestamp indicating the deadline for burning tickets. |

### lotteryTime

```solidity
function lotteryTime() external view returns (uint32)
```

Retrieves the timestamp indicating the time when the lottery can run.

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | uint32 | The timestamp indicating the time when the lottery can run. |

### isRegisteredTicket

```solidity
function isRegisteredTicket(address ticketAddress) external view returns (bool)
```

Mapping that contains registered addresses of tickets.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| ticketAddress | address | The address of the ticket contract. |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | bool | True if the ticket address is registered, false otherwise. |

### isOrganizationAdded

```solidity
function isOrganizationAdded(address organizationAddress) external view returns (bool)
```

Mapping that contains added organization.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| organizationAddress | address | The address of the ticket contract. |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | bool | True if the organization address is added, false otherwise. |

### organizationTicketsContracts

```solidity
function organizationTicketsContracts(address organization, uint256 ticketContractIndex) external view returns (address)
```

Mapping that contains array of ticket contracts associated with an organization address.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| organization | address | The address of the organization. |
| ticketContractIndex | uint256 | The index of the ticket in array. |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | address | tickets An array containing the addresses of ticket contracts. |

### organizationTicketsRange

```solidity
function organizationTicketsRange(address organization) external view returns (uint256 firstLotteryTicketId, uint256 lastLotteryTicketId)
```

Mapping that contains the ticket range associated with an organization.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| organization | address | The address of the organization. |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| firstLotteryTicketId | uint256 | First ticket ID that associated with its organization. |
| lastLotteryTicketId | uint256 | Last ticket ID that associated with its organization. |

### overCapWinnerAmount

```solidity
function overCapWinnerAmount(uint256 ticketId) external view returns (uint256)
```

Mapping that contains the winners who won more than the lottery cap.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| ticketId | uint256 | The ID of the ticket. |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | uint256 | The amount won by the ticket. |

### winnerAmount

```solidity
function winnerAmount(uint256 ticketId) external view returns (uint256)
```

Mapping that contains the winner amount associated with a ticket ID.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| ticketId | uint256 | The ID of the ticket. |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | uint256 | The amount won by the ticket. |

### tierWinners

```solidity
function tierWinners(uint256 tierIndex, uint256 winnerIndex) external view returns (uint256)
```

Mapping that contains array of winners associated with a tier index.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| tierIndex | uint256 | The index of the tier. |
| winnerIndex | uint256 | The index of the winner in array. |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | uint256 | winners An array containing the IDs of winners in the tier. |

### registerTicketContract

```solidity
function registerTicketContract(address _ticketContract) external
```

This function registers a ticket contract for the lottery.

_Only can be called by accounts with the REGISTRAR_ROLE.
Reverts if the ticket contract does not support the IRootsyTicket interface.
Add the organization of the ticket to all organizations_

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| _ticketContract | address | The address of the ticket contract to register. |

### setupLottery

```solidity
function setupLottery(address _rewardToken, uint256 _lotteryCap, struct ILottery.Tier[] _tiers, uint256[] _organizationSharesForFixedTiers) external
```

This function sets up the lottery with specified parameters such as reward token, tiers and shares of organizations.
Part of winners for each organization depends on its shares.
The tiers contain information about each tier, such as type, amount of winners, reward amount.

_Each element in `_tiers` is defined by its type (jackpot, random and fixed), the amount of winners and the reward amount.
Each element in the `_organizationSharesForFixedTiers` is the percentage share of an organization for fixed tiers.
Total share is 100_00 corresponds to 100% (BIPS).
This function must be called before the lottery time.
Only can be called by accounts with the DEFAULT_ADMIN_ROLE.
Reverts if the reward token is not a contract.
Reverts if the amount of organization shares for fixed tiers does not match the amount of organizations.
Reverts if there are any incorrect tier configurations or if the total organization shares don't sum up to 100%._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| _rewardToken | address | The address of the token used as rewards. |
| _lotteryCap | uint256 | Maximum amount a single winner can receive. |
| _tiers | struct ILottery.Tier[] | An array containing the configuration of lottery tiers. |
| _organizationSharesForFixedTiers | uint256[] | An array containing the percentage shares of organizations for fixed tiers. |

### initializeLottery

```solidity
function initializeLottery(uint256 organizationsCount) external
```

This function initializes the lottery by assigning ticket ranges to each organization's tickets.
This function initializes a specified number of organizations to avoid exceeding gas limits when dealing with many organizations.

_If the gas limit is exceeded when calling the function, the organization must be initialized in parts.
This function can be called when the burn deadline passed, since after that amount of tickets cannot be changed.
This function can be called if lottery hasn't been fully initialized.
Calculates the amount of winners for random tier based on the total supply of lottery tickets.
If `organizationsCount` is 0 or exceeds the remaining amount of organizations to initialize,
it automatically sets `organizationsCount` to the remaining amount of organizations._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| organizationsCount | uint256 | The amount of organizations to initialize in the lottery. |

### runLottery

```solidity
function runLottery() external
```

This function run the lottery process. 
This function makes a request for a random number. Later, winners are selected based on this random number.

_This function can be called when the lottery time reached.
This function doesn't include selecting winners or distributing rewards.
Reverts if the function was called before and the `requestRandomNumberId` was received.
Reverts if the lottery is not fully initialized with all organizations._

### rewardWinners

```solidity
function rewardWinners(uint256 tiersCount) external
```

This function rewards the winners of the lottery tiers apart from who won more than the lottery cap.
This function randomly selects winners from registered tickets based on a random number.
This function rewards a specified amoumt of tiers to avoid exceeding gas limits when dealing with many tiers.
This function rewards a specified amoumt of tiers to avoid exceeding gas limits when dealing with many tiers.

_If the gas limit is exceeded when calling the function, the tiers should be rewarded in parts.
Winners are chosen based on a random number.
Transfer tokens to winners.
Reverts if a random number is still pending or if the lottery is not yet run.
Reverts if the lottery has already been processed.
If the tier is of type `Fixed`, it distributes rewards among the winners based on their organization's shares.
If `tiersCount` is 0 or exceeds the remaining amount of tiers to initialize,
it automatically sets `tiersCount` to the remaining amount of tiers._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| tiersCount | uint256 | The number of tiers to process. |

### rewardOverCapWinners

```solidity
function rewardOverCapWinners(uint256[] lotteryTicketIds) external
```

This function rewards the over cap winners based on the provided lottery ticket IDs.

_This function only can be called by accounts with the REWARDER_ROLE._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| lotteryTicketIds | uint256[] | An array of lottery ticket IDs whose holders will receive rewards. |

### rewardOverCapWinner

```solidity
function rewardOverCapWinner(uint256 lotteryTicketId) external
```

This function rewards the over cap winner based on the provided lottery ticket ID.

_This function only can be called by accounts with the REWARDER_ROLE._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| lotteryTicketId | uint256 | lottery ticket IDs who holder will receive reward. |

### getUnderlyingTicket

```solidity
function getUnderlyingTicket(uint256 lotteryTicketId) external view returns (address, uint256)
```

Retrieves the underlying ticket information for a given lottery ticket ID.

_Uses a binary search algorithm to efficiently locate the corresponding campaign ticket contract._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| lotteryTicketId | uint256 | The ID of the lottery ticket. |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | address | The address of the ticket contract. |
| [1] | uint256 | The ticket ID within ticket contract. |

### getLotteryTicketId

```solidity
function getLotteryTicketId(address campaign, uint256 ticketId) external view returns (uint256)
```

Retrieves the lottery ticket ID for a given campaign and ticket ID.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| campaign | address | The address of the campaign contract which owns the ticket. |
| ticketId | uint256 | The ID of the ticket within the campaign that will be converted to a lottery ticket ID. |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | uint256 | lotteryTicketId The calculated lottery ticket ID which participates in the lottery. |

### getTier

```solidity
function getTier(uint256 tierIndex) external view returns (struct ILottery.Tier)
```

Retrieves information about a specific tier in the lottery.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| tierIndex | uint256 | The index of the tier to retrieve. |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | struct ILottery.Tier | Tier information including tier type, winners count, reward amount, etc. |

### getAllTiers

```solidity
function getAllTiers() external view returns (struct ILottery.Tier[])
```

Retrieves information about all tiers in the lottery.

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | struct ILottery.Tier[] | An array containing information about all tiers including tier type, winners count, reward amount, etc. |

### getAllOrganizations

```solidity
function getAllOrganizations() external view returns (address[])
```

Retrieves the addresses of all organizations participating in the lottery.

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | address[] | An array containing the addresses of all participating organizations. |

### getAllWinners

```solidity
function getAllWinners() external view returns (uint256[])
```

Retrieves all lottery winners.

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | uint256[] | An array of lottery ticket IDs that won. |

### getAllOverCapWinners

```solidity
function getAllOverCapWinners() external view returns (uint256[])
```

Retrieves all over-cap winners.

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | uint256[] | An array of lottery ticket IDs that won more than the lottery cap. |

### getTiersCount

```solidity
function getTiersCount() external view returns (uint256)
```

Retrieves the amount of tiers in the lottery.

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | uint256 | The amount of tiers in the lottery. |

### getOrganizationsCount

```solidity
function getOrganizationsCount() external view returns (uint256)
```

Retrieves the amount of organizations participating in the lottery.

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | uint256 | The amount of participating organizations. |

### getWinnersCount

```solidity
function getWinnersCount() external view returns (uint256)
```

Retrieves the count of lottery winners.

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | uint256 | The number of lottery ticket IDs that won. |

### getOverCapWinnersCount

```solidity
function getOverCapWinnersCount() external view returns (uint256)
```

Retrieves the count of over-cap winners.

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | uint256 | The number of lottery ticket IDs that won more than the lottery cap. |

### getOrganizationTicketsContracts

```solidity
function getOrganizationTicketsContracts(address organization) external view returns (address[])
```

Retrieves the addresses of all ticket contracts associated with a specific organization.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| organization | address | The address of the organization. |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | address[] | An array containing the addresses of ticket contracts associated with the organization. |

### getOrganizationSharesForFixedTiers

```solidity
function getOrganizationSharesForFixedTiers() external view returns (uint256[])
```

Retrieves the shares assigned to each organization for fixed tiers.

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | uint256[] | An array containing the shares assigned to each organization for fixed tiers. |

### getAllCampaignTickets

```solidity
function getAllCampaignTickets() external view returns (struct ILottery.CampaignTickets[])
```

Retrieves all campaign tickets stored in the lottery.

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | struct ILottery.CampaignTickets[] | An array containing all campaign tickets stored in the lottery. |

