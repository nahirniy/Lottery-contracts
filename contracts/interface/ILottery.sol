// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

import {IERC165} from "@openzeppelin/contracts/utils/introspection/IERC165.sol";
import {IRootsyErrors} from "./IRootsyErrors.sol";

/**
 * @title Lottery contract
 * @notice Manages lottery functionality including ticket registration, initialization, running, and rewarding winners.
 * @notice The lottery has 3 tiers type - jackpot, random and fixed. 
 * @notice Winners are selected from registered tickets using a specific algorithm that relies on a random number generated
 * by the Chainlink VRF to ensure randomness, then receive a reward in their wallet.
 */
interface ILottery is IERC165, IRootsyErrors {
    
    /**
     * @notice Emitted when a ticket contract is registered for a specific organization.
     * @param organization The address of the organization registering the ticket contract.
     * @param ticketContract The address of the registered ticket contract.
     */
    event RegisterTicketContract(address indexed organization, address indexed ticketContract);
    /**
     * @notice Emitted when the lottery is initialized with a certain amount of organizations.
     * @param organizationsCount The amount of organizations initialized for the lottery.
     */
    event LotteryInitialized(uint indexed organizationsCount);
    /**
     * @notice Emitted when the lottery setup is completed with reward token, tiers, and organization shares for fixed tiers.
     * @param rewardToken The address of the token used as rewards.
     * @param tiers An array containing the configuration of lottery tiers.
     * @param organizationSharesForFixedTiers An array containing the percentage shares of organizations for fixed tiers.
     */
    event LotterySetup(address indexed rewardToken, Tier[] tiers, uint[] organizationSharesForFixedTiers);
    /**
     * @notice Emitted when a tier in the lottery is processed, indicating the total reward amount for the tier.
     * @param tierIndex The index of the processed tier.
     * @param organization The address of the organization associated with the tier if it is(used for fixed tier).
     * @param totalRewardAmount The total reward amount distributed for the tier.
     */
    event TierProcessed(uint indexed tierIndex, address indexed organization, uint256 totalRewardAmount);
    /**
     * @notice Emitted when a winner is defined for a specific lottery ticket in a tier.
     * @param winner The address of the winner.
     * @param lotteryTicketId The ID of the lottery ticket that won.
     * @param campaignTicketContract The address of the ticket contract associated with the ticket ID that won.
     * @param campaignTicketId The ID of the parent campaign associated with the ticket that won.
     * @param tierType The type of tier in which the winner is defined.
     * @param rewardAmount The amount of reward received by the winner.
     */
    event WinnerDefined(address indexed winner, uint256 indexed lotteryTicketId, address campaignTicketContract, uint256 indexed campaignTicketId, uint256 tierType, uint256 rewardAmount);
    /**
     * @notice Emitted when the lottery is finished, indicating that all tiers have been processed.
     */
    event LotteryFinished();

    
    /**
     * @notice Struct representing campaign tickets, containing the ticket contract address and ticket range(first and last ticket IDs).
     */
    struct CampaignTickets {
        address campaignTicketContract; // address of the ticket contract
        TicketRange ticketRange; // TicketRange struct that contains first and last tikcet IDs
    }

    /**
     * @notice Struct representing the range of lottery tickets for a specific organization - first and last tikcet IDs. 
     */
    struct TicketRange {
        uint256 firstLotteryTicketId; // first ticket ID that associated with its organization
        uint256 lastLotteryTicketId; // last ticket ID that associated with its organization
    }

    /**
     * @notice Struct representing a tier in the lottery, containing the tier type, winners share, winners count, and reward amount.
     */
    struct Tier {
        TierType tierType; // tier type can be Jackpot, Random, Fixed
        uint256 winnersShare; // in percents for random tier
        uint256 winnersCount; // amount of winner
        uint256 rewardAmount; // amount of reward for each user
    }

    /**
     * @notice Enum representing the types of tiers in the lottery: Jackpot, Random, and Fixed.
     */
    enum TierType {
        Jackpot,
        Random,
        Fixed
    }
    
    /**
     * @notice Retrieves the deadline for minting tickets.
     * @return The timestamp indicating the deadline for minting tickets.
     */
    function mintDeadline() external view returns (uint32);
    /**
     * @notice Retrieves the deadline for burning tickets.
     * @return The timestamp indicating the deadline for burning tickets.
     */
    function burnDeadline() external view returns (uint32);
    /**
     * @notice Retrieves the timestamp indicating the time when the lottery can run.
     * @return The timestamp indicating the time when the lottery can run.
     */
    function lotteryTime() external view returns (uint32);
    
    
    /**
    * @notice Mapping that contains registered addresses of tickets.
    * @param ticketAddress The address of the ticket contract.
    * @return True if the ticket address is registered, false otherwise.
    */
    function isRegisteredTicket(address ticketAddress) external view returns (bool);
    /**
    * @notice Mapping that contains added organization.
    * @param organizationAddress The address of the ticket contract.
    * @return True if the organization address is added, false otherwise.
    */
    function isOrganizationAdded(address organizationAddress) external view returns (bool);
    /**
     * @notice Mapping that contains array of ticket contracts associated with an organization address.
     * @param organization The address of the organization.
     * @param ticketContractIndex The index of the ticket in array.
     * @return tickets An array containing the addresses of ticket contracts.
     */
    function organizationTicketsContracts(address organization, uint256 ticketContractIndex) external view returns (address);
    /**
     * @notice Mapping that contains the ticket range associated with an organization.
     * @param organization The address of the organization.
     * @return firstLotteryTicketId First ticket ID that associated with its organization.
     * @return lastLotteryTicketId Last ticket ID that associated with its organization.
     */
    function organizationTicketsRange(address organization) external view returns (uint256 firstLotteryTicketId, uint256 lastLotteryTicketId);
    /**
     * @notice Mapping that contains the winners who won more than the lottery cap.
     * @param ticketId The ID of the ticket.
     * @return The amount won by the ticket.
     */
    function overCapWinnerAmount(uint256 ticketId) external view returns (uint256);
    /**
     * @notice Mapping that contains the winner amount associated with a ticket ID.
     * @param ticketId The ID of the ticket.
     * @return The amount won by the ticket.
     */
    function winnerAmount(uint256 ticketId) external view returns (uint256);
    /**
     * @notice Mapping that contains array of winners associated with a tier index.
     * @param tierIndex The index of the tier.
     * @param winnerIndex The index of the winner in array.
     * @return winners An array containing the IDs of winners in the tier.
     */
    function tierWinners(uint256 tierIndex, uint256 winnerIndex) external view returns (uint256);

    /**
     * @notice This function registers a ticket contract for the lottery.
     * @param _ticketContract The address of the ticket contract to register.
     * @dev Only can be called by accounts with the REGISTRAR_ROLE.
     * @dev Reverts if the ticket contract does not support the IRootsyTicket interface.
     * @dev Add the organization of the ticket to all organizations
     */
    function registerTicketContract(address _ticketContract) external;

    /**
     * @notice This function sets up the lottery with specified parameters such as reward token, tiers and shares of organizations.
     * @notice Part of winners for each organization depends on its shares.
     * @notice The tiers contain information about each tier, such as type, amount of winners, reward amount.
     * @param _lotteryCap Maximum amount a single winner can receive.
     * @param _rewardToken The address of the token used as rewards.
     * @param _tiers An array containing the configuration of lottery tiers.
     * @param _organizationSharesForFixedTiers An array containing the percentage shares of organizations for fixed tiers.
     * @dev Each element in `_tiers` is defined by its type (jackpot, random and fixed), the amount of winners and the reward amount.
     * @dev Each element in the `_organizationSharesForFixedTiers` is the percentage share of an organization for fixed tiers.
     * @dev Total share is 100_00 corresponds to 100% (BIPS).
     * @dev This function must be called before the lottery time.
     * @dev Only can be called by accounts with the DEFAULT_ADMIN_ROLE.
     * @dev Reverts if the reward token is not a contract.
     * @dev Reverts if the amount of organization shares for fixed tiers does not match the amount of organizations.
     * @dev Reverts if there are any incorrect tier configurations or if the total organization shares don't sum up to 100%.
     */
    function setupLottery(
        address _rewardToken,
        uint _lotteryCap,
        Tier[] memory _tiers,
        uint256[] memory _organizationSharesForFixedTiers
    ) external;

    /**
     * @notice This function initializes the lottery by assigning ticket ranges to each organization's tickets.
     * @notice This function initializes a specified number of organizations to avoid exceeding gas limits when dealing with many organizations.
     * @param organizationsCount The amount of organizations to initialize in the lottery.
     * @dev If the gas limit is exceeded when calling the function, the organization must be initialized in parts.
     * @dev This function can be called when the burn deadline passed, since after that amount of tickets cannot be changed.
     * @dev This function can be called if lottery hasn't been fully initialized.
     * @dev Calculates the amount of winners for random tier based on the total supply of lottery tickets.
     * @dev If `organizationsCount` is 0 or exceeds the remaining amount of organizations to initialize,
     * it automatically sets `organizationsCount` to the remaining amount of organizations.
     */
    function initializeLottery(uint256 organizationsCount) external;

    /**
     * @notice This function run the lottery process. 
     * @notice This function makes a request for a random number. Later, winners are selected based on this random number.
     * @dev This function can be called when the lottery time reached.
     * @dev This function doesn't include selecting winners or distributing rewards.
     * @dev Reverts if the function was called before and the `requestRandomNumberId` was received.
     * @dev Reverts if the lottery is not fully initialized with all organizations.
     */
    function runLottery() external;

    /**
     * @notice This function rewards the winners of the lottery tiers apart from who won more than the lottery cap.
     * @notice This function randomly selects winners from registered tickets based on a random number.
     * @notice This function rewards a specified amoumt of tiers to avoid exceeding gas limits when dealing with many tiers.
     * @notice This function rewards a specified amoumt of tiers to avoid exceeding gas limits when dealing with many tiers.
     * @param tiersCount The number of tiers to process.
     * @dev If the gas limit is exceeded when calling the function, the tiers should be rewarded in parts.
     * @dev Winners are chosen based on a random number.
     * @dev Transfer tokens to winners.
     * @dev Reverts if a random number is still pending or if the lottery is not yet run.
     * @dev Reverts if the lottery has already been processed.
     * @dev If the tier is of type `Fixed`, it distributes rewards among the winners based on their organization's shares.
     * @dev If `tiersCount` is 0 or exceeds the remaining amount of tiers to initialize,
     * it automatically sets `tiersCount` to the remaining amount of tiers.
    */
    function rewardWinners(uint256 tiersCount) external;

    /**
     * @notice This function rewards the over cap winners based on the provided lottery ticket IDs.
     * @dev This function only can be called by accounts with the REWARDER_ROLE.
     * @param lotteryTicketIds An array of lottery ticket IDs whose holders will receive rewards.
     */
    function rewardOverCapWinners(uint256[] memory lotteryTicketIds) external;

    /**
     * @notice This function rewards the over cap winner based on the provided lottery ticket ID.
     * @dev This function only can be called by accounts with the REWARDER_ROLE.
     * @param lotteryTicketId lottery ticket IDs who holder will receive reward.
     */
    function rewardOverCapWinner(uint256 lotteryTicketId) external;

    /**
     * @notice Allows the admin to withdraw tokens from the contract.
     * @param token Address of the token contract.
     * @param receiver Address to receive the withdrawn tokens.
     * @param amount Amount of tokens to withdraw.
     */
    function withdrawTokens(address token, address receiver, uint256 amount) external;

    /**
     * @notice Allows the admin to withdraw all reward tokens from the contract.
     */
    function withdrawAllTokens() external;

    /**
     * @notice Retrieves the underlying ticket information for a given lottery ticket ID.
     * @param lotteryTicketId The ID of the lottery ticket.
     * @return The address of the ticket contract.
     * @return The ticket ID within ticket contract.
     * @dev Uses a binary search algorithm to efficiently locate the corresponding campaign ticket contract.
     */
    function getUnderlyingTicket(uint256 lotteryTicketId) external view returns (address, uint256);
    /**
     * @notice Retrieves the lottery ticket ID for a given campaign and ticket ID.
     * @param campaign The address of the campaign contract which owns the ticket.
     * @param ticketId The ID of the ticket within the campaign that will be converted to a lottery ticket ID.
     * @return lotteryTicketId The calculated lottery ticket ID which participates in the lottery.
     */
    function getLotteryTicketId(address campaign, uint256 ticketId) external view returns (uint256);
    /**
     * @notice Returns the array of winners for a given tier.
     * @param tierId The ID of the tier for which to retrieve winners.
     * @return The array of winners for the given tier.
     */
    function getTierWinners(uint256 tierId) external view returns (uint256[] memory);
    /**
     * @notice Retrieves information about a specific tier in the lottery.
     * @param tierIndex The index of the tier to retrieve.
     * @return Tier information including tier type, winners count, reward amount, etc.
     */
    function getTier(uint256 tierIndex) external view returns (Tier memory);
    /**
     * @notice Retrieves information about all tiers in the lottery.
     * @return An array containing information about all tiers including tier type, winners count, reward amount, etc.
     */
    function getAllTiers() external view returns (Tier[] memory);
    /**
     * @notice Retrieves the addresses of all organizations participating in the lottery.
     * @return An array containing the addresses of all participating organizations.
     */
    function getAllOrganizations() external view returns (address[] memory);
    /**
     * @notice Retrieves all lottery winners.
     * @return An array of lottery ticket IDs that won.
     */
    function getAllWinners() external view returns (uint256[] memory);
    /**
     * @notice Retrieves all over-cap winners.
     * @return An array of lottery ticket IDs that won more than the lottery cap.
     */
    function getAllOverCapWinners() external view returns (uint256[] memory);
    /**
     * @notice Retrieves the amount of tiers in the lottery.
     * @return The amount of tiers in the lottery.
     */
    function getTiersCount() external view returns (uint256);
    /**
     * @notice Retrieves the amount of organizations participating in the lottery.
     * @return The amount of participating organizations.
     */
    function getOrganizationsCount() external view returns (uint256);
    /**
     * @notice Retrieves the count of lottery winners.
     * @return The number of lottery ticket IDs that won.
     */
    function getWinnersCount() external view returns (uint256);
    /**
     * @notice Retrieves the count of over-cap winners.
     * @return The number of lottery ticket IDs that won more than the lottery cap.
     */
    function getOverCapWinnersCount() external view returns (uint256);
    /**
     * @notice Retrieves the addresses of all ticket contracts associated with a specific organization.
     * @param organization The address of the organization.
     * @return An array containing the addresses of ticket contracts associated with the organization.
     */
    function getOrganizationTicketsContracts(address organization) external view returns (address[] memory);
    /**
     * @notice Retrieves the shares assigned to each organization for fixed tiers.
     * @return An array containing the shares assigned to each organization for fixed tiers.
     */
    function getOrganizationSharesForFixedTiers() external view returns (uint256[] memory);
    /**
     * @notice Retrieves all campaign tickets stored in the lottery.
     * @return An array containing all campaign tickets stored in the lottery.
     */
    function getAllCampaignTickets() external view returns (CampaignTickets[] memory);
}
