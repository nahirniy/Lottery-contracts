// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

import {IERC165} from "@openzeppelin/contracts/utils/introspection/IERC165.sol";
import {IRootsyErrors} from "./IRootsyErrors.sol";

/**
 * @title RootsyFactory contract
 * @notice The RootsyFactory contract serves as a factory for various contracts 
 * such as organizations, campaigns, lotteries, redemption and tickets.
 * @dev RootsyFactory manages the deployment process and keeps track of deployed contracts.
*/
interface IRootsyFactory is IERC165, IRootsyErrors {

    /**
     * @notice Emitted when the minter contract address is updated.
     * @param minterContract The new address of the minter contract.
     */
    event MinterContractUpdated(address indexed minterContract);
    /**
     * @notice Emitted when the randomGetter contract address is updated.
     * @param randomGetterContract The new address of the randomGetter contract.
     */
    event RandomGetterContractUpdated(address indexed randomGetterContract);
    /**
     * @notice Emitted when the RootsyPassport contract address is set.
     * @param passportContract The address of the passport contract.
     */
    event PassportContractSet(address indexed passportContract);
    /**
     * @notice Emitted when a lottery contract is deployed.
     * @param lotteryContract The address of the deployed lottery contract.
     */
    event LotteryContractDeployed(address indexed lotteryContract);
    /**
     * @notice Emitted when a redemption contract is deployed.
     * @param redemptionContract The address of the deployed redemption contract.
     */
    event RedemptionContractDeployed(address indexed redemptionContract);
    /**
     * @notice Emitted when an organization contract is deployed.
     * @param organizationContract The address of the deployed organization contract.
     */
    event OrganizationContractDeployed(address indexed organizationContract);
    /**
     * @notice Emitted when a campaign contract is deployed.
     * @param campaignContract The address of the deployed campaign contract.
     * @param organization The address of the organization associated with the campaign.
     */
    event CampaignContractDeployed(address indexed campaignContract, address indexed organization);
    /**
     * @notice Emitted when a ticket contract is deployed.
     * @param ticketContract The address of the deployed ticket contract.
     * @param campaign The address of the campaign associated with the ticket.
     */
    event TicketContractDeployed(address indexed ticketContract, address indexed campaign);
    /**
     * @notice Emitted when an organization is enabled.
     * @param organization The address of the enabled organization.
     */
    event EnableOrganization(address indexed organization);
    /**
     * @notice Emitted when an organization is disabled.
     * @param organization The address of the disabled organization.
     */
    event DisabledOrganization(address indexed organization);
    
    /**
     * @notice Retrieves address of the passport contract, which can mint tokens that owns organizations.
     * @return RootsyPassport contract address.
     */
    function passportContract() external returns(address);
    /**
     * @notice Checks if an address is an organization.
     * @param organization The address to check.
     * @return A boolean indicating whether the address is an organization.
     */
    function isOrganization(address organization) external view returns (bool);
    /**
     * @notice Checks if an address is a lottery contract.
     * @param lottery The address to check.
     * @return A boolean indicating whether the address is a lottery contract.
     */
    function isLottery(address lottery) external view returns (bool);
    /**
     * @notice Retrieves the organization associated with a campaign contract.
     * @param campaign The address of the campaign contract.
     * @return organization The address of the organization associated with the campaign.
     */
    function campaignOrganization(address campaign) external view returns (address organization);
    /**
     * @notice Retrieves the campaign associated with a ticket contract.
     * @param ticketContract The address of the ticket contract.
     * @return campaign The address of the campaign associated with the ticket contract.
     */
    function ticketsCampaign(address ticketContract) external view returns (address campaign);

    /**
     * @notice Retrieves the addresses of all deployed lottery contracts.
     * @return An array containing the addresses of all deployed lottery contracts.
     */
    function getAllLotteries() external view returns (address[] memory);
    /**
     * @notice Retrieves the addresses of all deployed redemption contracts.
     * @return An array containing the addresses of all deployed redemption contracts.
     */
    function getAllRedemptions() external view returns (address[] memory);
    /**
     * @notice Retrieves the addresses of all deployed organization contracts.
     * @return An array containing the addresses of all deployed organization contracts.
     */
    function getAllOrganizations() external view returns (address[] memory);
    /**
     * @notice Retrieves the addresses of all deployed campaign contracts.
     * @return An array containing the addresses of all deployed campaign contracts.
     */
    function getAllCampaigns() external view returns (address[] memory);
    /**
     * @notice Retrieves the addresses of all deployed ticket contracts.
     * @return An array containing the addresses of all deployed ticket contracts.
     */
    function getAllTickets() external view returns (address[] memory);

    /**
     * @notice Returns the amount of deployed lottery contracts.
     * @return The amount of deployed lottery contracts.
     */
    function getLotteriesCount() external view returns (uint256);

    /**
     * @notice Returns the amount of deployed redemption contracts.
     * @return The amount of deployed redemption contracts.
     */
    function getRedemptionsCount() external view returns (uint256);

    /**
     * @notice Returns the amount of deployed organization contracts.
     * @return The amount of deployed organization contracts.
     */
    function getOrganizationsCount() external view returns (uint256);

    /**
     * @notice Returns the amount of deployed campaign contracts.
     * @return The amount of deployed campaign contracts.
     */
    function getCampaignsCount() external view returns (uint256);

    /**
     * @notice Returns the amount of deployed ticket contracts.
     * @return The amount of deployed ticket contracts.
     */
    function getTicketsCount() external view returns (uint256);

    /**
     * @notice Enables an organization if they are returned in the project.
     * @dev Only can be called by accounts with the DEFAULT_ADMIN_ROLE.
     * @param organization The address of the organization to be enabled.
     * @dev If the organization is already enabled, reverts with an error message.
     */
    function enableOrganization(address organization) external;
    /**
     * @notice Disables an organization if they leave the project.
     * @dev Only can be called by accounts with the DEFAULT_ADMIN_ROLE.
     * @param organization The address of the organization to be disabled.
     * @dev If the organization is Non Rootsy or already disabled, reverts with an error message.
     */
    function disableOrganization(address organization) external;
    /**
     * @notice Sets the minter contract address for ticket minting.
     * @dev Only can be called by accounts with the DEFAULT_ADMIN_ROLE.
     * @param _minterContract The address of the minter contract to be set.
     * @dev Reverts if the minter contract does not support the required interface.
     */
    function setMinterContract(address _minterContract) external;
    /**
     * @notice Sets the randomGetter contract address to get a random number in the lottery.
     * @dev Only can be called by accounts with the DEFAULT_ADMIN_ROLE.
     * @param _randomGetterContract The address of the randomGetter contract to be set.
     * @dev Reverts if the randomGetter contract does not support the required interface.
     */
    function setRandomGetterContract(address _randomGetterContract) external;
    /**
     * @notice Sets the RootsyPassport contract, which can mint tokens that owns organizations.
     * @dev Only can be called by accounts with the DEFAULT_ADMIN_ROLE.
     * @param _passportContract The address of the RootsyPassport contract to be set.
     * @dev Reverts if the RootsyPassport is already set.
     * @dev Reverts if the RootsyPassport contract does not support the required interface.
     */
    function setPassportContract(address _passportContract) external;

    /**
     * @notice Deploys a new lottery and redemption contract.
     * @dev Only can be called by accounts with the DEPLOYER_ROLE.
     * @param defaultAdmin The address of the admin for the contracts.
     * @param mintDeadline The deadline for ticket minting.
     * @param burnDeadline The deadline for ticket burning.
     * @param lotteryTime The time when the lottery will be conducted.
     * @return deployedLottery The address of the newly deployed lottery contract.
     * @return deployedRedemption The address of the newly deployed redemption contract.
     * @dev Reverts if mintDeadline is greater than burnDeadline,
     *  burnDeadline is greater than lotteryTime,
     *  mintDeadline is greater than lotteryTime.
     */
    function deployLotteryAndRedemptionContract(
        address defaultAdmin,
        uint32 mintDeadline,
        uint32 burnDeadline,
        uint32 lotteryTime
    ) external returns (address deployedLottery, address deployedRedemption);

    /**
     * @notice Deploys a new organization contract.
     * @param defaultAdmin The address of the admin for the contract.
     * @param organizationName The name of the organization.
     * @return deployedOrganization The address of the newly deployed organization contract.
     */
    function deployOrganizationContract(
        address defaultAdmin,
        string memory organizationName
    ) external returns (address deployedOrganization);

    /**
     * @notice Deploys a new campaign and ticket contract.
     * @dev Only can be called by accounts with the DEPLOYER_ROLE.
     * @param defaultAdmin The address of the admin for the contracts.
     * @param lottery The address of the lottery contract.
     * @param redemption The address of the redemption contract that can burn ticket.
     * @param organization The address of the parent organization contract.
     * @param campaignName The name of the campaign.
     * @return deplyedCampaign The address of the newly deployed campaign contract.
     * @return deployedTicket The address of the newly deployed ticket contract.
     */
    function deployCampaignAndTicketContract(
        address defaultAdmin,
        address lottery,
        address redemption,
        address organization,
        string memory campaignName
    ) external returns (address deplyedCampaign, address deployedTicket);

    /**
     * @notice Deploys an organization contract and multiple campaigns that are linked to the organization and corresponding ticket contracts.
     * @dev Only can be called by accounts with the DEPLOYER_ROLE.
     * @param defaultAdmin The address of the admin for the contracts.
     * @param lottery The address of the lottery contract.
     * @param redemption The address of the redemption contract that can burn ticket.
     * @param organizationName The name of the organization.
     * @param campaignNames An array of campaign names to be deployed.
     * @return deployedOrganization The address of the newly deployed organization contract.
     * @return deployedCampaigns An array containing the addresses of the newly deployed campaign contracts.
     * @return deployedTickets An array containing the addresses of the newly deployed ticket contracts.
     */
    function deployOrganizationAndCampaigns(
        address defaultAdmin,
        address lottery,
        address redemption,
        string memory organizationName,
        string[] memory campaignNames
    ) external returns (
        address deployedOrganization,
        address[] memory deployedCampaigns,
        address[] memory deployedTickets
    );
}
