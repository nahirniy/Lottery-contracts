# Solidity API

## IRootsyFactory

The RootsyFactory contract serves as a factory for various contracts 
such as organizations, campaigns, lotteries, redemption and tickets.

_RootsyFactory manages the deployment process and keeps track of deployed contracts._

### MinterContractUpdated

```solidity
event MinterContractUpdated(address minterContract)
```

Emitted when the minter contract address is updated.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| minterContract | address | The new address of the minter contract. |

### RandomGetterContractUpdated

```solidity
event RandomGetterContractUpdated(address randomGetterContract)
```

Emitted when the randomGetter contract address is updated.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| randomGetterContract | address | The new address of the randomGetter contract. |

### PassportContractSet

```solidity
event PassportContractSet(address passportContract)
```

Emitted when the RootsyPassport contract address is set.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| passportContract | address | The address of the passport contract. |

### LotteryContractDeployed

```solidity
event LotteryContractDeployed(address lotteryContract)
```

Emitted when a lottery contract is deployed.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| lotteryContract | address | The address of the deployed lottery contract. |

### RedemptionContractDeployed

```solidity
event RedemptionContractDeployed(address redemptionContract)
```

Emitted when a redemption contract is deployed.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| redemptionContract | address | The address of the deployed redemption contract. |

### OrganizationContractDeployed

```solidity
event OrganizationContractDeployed(address organizationContract)
```

Emitted when an organization contract is deployed.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| organizationContract | address | The address of the deployed organization contract. |

### CampaignContractDeployed

```solidity
event CampaignContractDeployed(address campaignContract, address organization)
```

Emitted when a campaign contract is deployed.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| campaignContract | address | The address of the deployed campaign contract. |
| organization | address | The address of the organization associated with the campaign. |

### TicketContractDeployed

```solidity
event TicketContractDeployed(address ticketContract, address campaign)
```

Emitted when a ticket contract is deployed.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| ticketContract | address | The address of the deployed ticket contract. |
| campaign | address | The address of the campaign associated with the ticket. |

### EnableOrganization

```solidity
event EnableOrganization(address organization)
```

Emitted when an organization is enabled.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| organization | address | The address of the enabled organization. |

### DisabledOrganization

```solidity
event DisabledOrganization(address organization)
```

Emitted when an organization is disabled.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| organization | address | The address of the disabled organization. |

### passportContract

```solidity
function passportContract() external returns (address)
```

Retrieves address of the passport contract, which can mint tokens that owns organizations.

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | address | RootsyPassport contract address. |

### isOrganization

```solidity
function isOrganization(address organization) external view returns (bool)
```

Checks if an address is an organization.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| organization | address | The address to check. |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | bool | A boolean indicating whether the address is an organization. |

### isLottery

```solidity
function isLottery(address lottery) external view returns (bool)
```

Checks if an address is a lottery contract.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| lottery | address | The address to check. |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | bool | A boolean indicating whether the address is a lottery contract. |

### campaignOrganization

```solidity
function campaignOrganization(address campaign) external view returns (address organization)
```

Retrieves the organization associated with a campaign contract.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| campaign | address | The address of the campaign contract. |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| organization | address | The address of the organization associated with the campaign. |

### ticketsCampaign

```solidity
function ticketsCampaign(address ticketContract) external view returns (address campaign)
```

Retrieves the campaign associated with a ticket contract.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| ticketContract | address | The address of the ticket contract. |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| campaign | address | The address of the campaign associated with the ticket contract. |

### getAllLotteries

```solidity
function getAllLotteries() external view returns (address[])
```

Retrieves the addresses of all deployed lottery contracts.

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | address[] | An array containing the addresses of all deployed lottery contracts. |

### getAllRedemptions

```solidity
function getAllRedemptions() external view returns (address[])
```

Retrieves the addresses of all deployed redemption contracts.

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | address[] | An array containing the addresses of all deployed redemption contracts. |

### getAllOrganizations

```solidity
function getAllOrganizations() external view returns (address[])
```

Retrieves the addresses of all deployed organization contracts.

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | address[] | An array containing the addresses of all deployed organization contracts. |

### getAllCampaigns

```solidity
function getAllCampaigns() external view returns (address[])
```

Retrieves the addresses of all deployed campaign contracts.

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | address[] | An array containing the addresses of all deployed campaign contracts. |

### getAllTickets

```solidity
function getAllTickets() external view returns (address[])
```

Retrieves the addresses of all deployed ticket contracts.

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | address[] | An array containing the addresses of all deployed ticket contracts. |

### getLotteriesCount

```solidity
function getLotteriesCount() external view returns (uint256)
```

Returns the amount of deployed lottery contracts.

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | uint256 | The amount of deployed lottery contracts. |

### getRedemptionsCount

```solidity
function getRedemptionsCount() external view returns (uint256)
```

Returns the amount of deployed redemption contracts.

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | uint256 | The amount of deployed redemption contracts. |

### getOrganizationsCount

```solidity
function getOrganizationsCount() external view returns (uint256)
```

Returns the amount of deployed organization contracts.

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | uint256 | The amount of deployed organization contracts. |

### getCampaignsCount

```solidity
function getCampaignsCount() external view returns (uint256)
```

Returns the amount of deployed campaign contracts.

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | uint256 | The amount of deployed campaign contracts. |

### getTicketsCount

```solidity
function getTicketsCount() external view returns (uint256)
```

Returns the amount of deployed ticket contracts.

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | uint256 | The amount of deployed ticket contracts. |

### enableOrganization

```solidity
function enableOrganization(address organization) external
```

Enables an organization if they are returned in the project.

_Only can be called by accounts with the DEFAULT_ADMIN_ROLE.
If the organization is already enabled, reverts with an error message._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| organization | address | The address of the organization to be enabled. |

### disableOrganization

```solidity
function disableOrganization(address organization) external
```

Disables an organization if they leave the project.

_Only can be called by accounts with the DEFAULT_ADMIN_ROLE.
If the organization is Non Rootsy or already disabled, reverts with an error message._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| organization | address | The address of the organization to be disabled. |

### setMinterContract

```solidity
function setMinterContract(address _minterContract) external
```

Sets the minter contract address for ticket minting.

_Only can be called by accounts with the DEFAULT_ADMIN_ROLE.
Reverts if the minter contract does not support the required interface._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| _minterContract | address | The address of the minter contract to be set. |

### setRandomGetterContract

```solidity
function setRandomGetterContract(address _randomGetterContract) external
```

Sets the randomGetter contract address to get a random number in the lottery.

_Only can be called by accounts with the DEFAULT_ADMIN_ROLE.
Reverts if the randomGetter contract does not support the required interface._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| _randomGetterContract | address | The address of the randomGetter contract to be set. |

### setPassportContract

```solidity
function setPassportContract(address _passportContract) external
```

Sets the RootsyPassport contract, which can mint tokens that owns organizations.

_Only can be called by accounts with the DEFAULT_ADMIN_ROLE.
Reverts if the RootsyPassport is already set.
Reverts if the RootsyPassport contract does not support the required interface._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| _passportContract | address | The address of the RootsyPassport contract to be set. |

### deployLotteryAndRedemptionContract

```solidity
function deployLotteryAndRedemptionContract(address defaultAdmin, uint32 mintDeadline, uint32 burnDeadline, uint32 lotteryTime) external returns (address deployedLottery, address deployedRedemption)
```

Deploys a new lottery and redemption contract.

_Only can be called by accounts with the DEPLOYER_ROLE.
Reverts if mintDeadline is greater than burnDeadline,
 burnDeadline is greater than lotteryTime,
 mintDeadline is greater than lotteryTime._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| defaultAdmin | address | The address of the admin for the contracts. |
| mintDeadline | uint32 | The deadline for ticket minting. |
| burnDeadline | uint32 | The deadline for ticket burning. |
| lotteryTime | uint32 | The time when the lottery will be conducted. |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| deployedLottery | address | The address of the newly deployed lottery contract. |
| deployedRedemption | address | The address of the newly deployed redemption contract. |

### deployOrganizationContract

```solidity
function deployOrganizationContract(address defaultAdmin, string organizationName) external returns (address deployedOrganization)
```

Deploys a new organization contract.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| defaultAdmin | address | The address of the admin for the contract. |
| organizationName | string | The name of the organization. |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| deployedOrganization | address | The address of the newly deployed organization contract. |

### deployCampaignAndTicketContract

```solidity
function deployCampaignAndTicketContract(address defaultAdmin, address lottery, address organization, string campaignName) external returns (address deplyedCampaign, address deployedTicket)
```

Deploys a new campaign and ticket contract.

_Only can be called by accounts with the DEPLOYER_ROLE._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| defaultAdmin | address | The address of the admin for the contracts. |
| lottery | address | The address of the lottery contract. |
| organization | address | The address of the parent organization contract. |
| campaignName | string | The name of the campaign. |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| deplyedCampaign | address | The address of the newly deployed campaign contract. |
| deployedTicket | address | The address of the newly deployed ticket contract. |

### deployOrganizationAndCampaigns

```solidity
function deployOrganizationAndCampaigns(address defaultAdmin, address lottery, string organizationName, string[] campaignNames) external returns (address deployedOrganization, address[] deployedCampaigns, address[] deployedTickets)
```

Deploys an organization contract and multiple campaigns that are linked to the organization and corresponding ticket contracts.

_Only can be called by accounts with the DEPLOYER_ROLE._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| defaultAdmin | address | The address of the admin for the contracts. |
| lottery | address | The address of the lottery contract. |
| organizationName | string | The name of the organization. |
| campaignNames | string[] | An array of campaign names to be deployed. |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| deployedOrganization | address | The address of the newly deployed organization contract. |
| deployedCampaigns | address[] | An array containing the addresses of the newly deployed campaign contracts. |
| deployedTickets | address[] | An array containing the addresses of the newly deployed ticket contracts. |

