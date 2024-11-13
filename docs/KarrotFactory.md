# Solidity API

## RootsyFactory

The RootsyFactory contract serves as a factory for various contracts 
such as organizations, campaigns, lotteries, redemption and tickets.

_RootsyFactory manages the deployment process and keeps track of deployed contracts._

### DEPLOYER_ROLE

```solidity
bytes32 DEPLOYER_ROLE
```

Сonstant that contains the DEPLOYER role. Owner of this role can deploy contracts.

### minterContract

```solidity
address minterContract
```

Address of the minterContract that can mint passport, organization, campaigns and tickets. Expected to be the TicketManager contract.

### randomGetterContract

```solidity
address randomGetterContract
```

Address of the randomGetterContract providing random numbers. Expected to be the RandomGetter contract.

### passportContract

```solidity
address passportContract
```

Retrieves address of the passport contract, which can mint tokens that owns organizations.

### lotteries

```solidity
address[] lotteries
```

Stores addresses of deployed lottery contracts.

### redemptions

```solidity
address[] redemptions
```

Stores addresses of deployed redemption contracts.

### organizations

```solidity
address[] organizations
```

Stores addresses of deployed organization contracts.

### campaigns

```solidity
address[] campaigns
```

Stores addresses of deployed campaign contracts.

### tickets

```solidity
address[] tickets
```

Stores addresses of deployed ticket contracts.

### isOrganization

```solidity
mapping(address => bool) isOrganization
```

Checks if an address is an organization.

### isLottery

```solidity
mapping(address => bool) isLottery
```

Checks if an address is a lottery contract.

### campaignOrganization

```solidity
mapping(address => address) campaignOrganization
```

Retrieves the organization associated with a campaign contract.

### ticketsCampaign

```solidity
mapping(address => address) ticketsCampaign
```

Retrieves the campaign associated with a ticket contract.

### withSetupPassportContract

```solidity
modifier withSetupPassportContract()
```

The modifier checks whether the RootsyPassport contract is set when the function is called.

### withSetupMinterContract

```solidity
modifier withSetupMinterContract()
```

The modifier checks whether the TicketMinter contract is set when the function is called.

### withSetupRandomGetterContract

```solidity
modifier withSetupRandomGetterContract()
```

The modifier checks whether the randomGetter contract is set when the function is called.

### constructor

```solidity
constructor(address _deployer) public
```

Constructor function to initialize the RootsyFactory contract.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| _deployer | address | The address of the deployer role. |

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
function deployLotteryAndRedemptionContract(address defaultAdmin, uint32 mintDeadline, uint32 burnDeadline, uint32 lotteryTime) public returns (address deployedLottery, address deployedRedemption)
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
function deployOrganizationContract(address defaultAdmin, string organizationName) public returns (address deployedOrganization)
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
function deployCampaignAndTicketContract(address defaultAdmin, address lottery, address organization, string campaignName) public returns (address deplyedCampaign, address deployedTicket)
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

### supportsInterface

```solidity
function supportsInterface(bytes4 interfaceId) public view returns (bool)
```

_Returns true if this contract implements the interface defined by
`interfaceId`. See the corresponding
https://eips.ethereum.org/EIPS/eip-165#how-interfaces-are-identified[EIP section]
to learn more about how these ids are created.

This function call must use less than 30 000 gas._

