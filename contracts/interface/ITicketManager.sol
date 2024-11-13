// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

import {IERC165} from "@openzeppelin/contracts/utils/introspection/IERC165.sol";
import {IRootsyErrors} from "./IRootsyErrors.sol";

/**
 * @title TicketManager contract
 * @notice The TicketManager contract manages the creation and transfer of tickets for campaigns on the Rootsy platform. 
 * @dev TicketManager ensures that tickets are minted and transferred for end owners within specified campaigns.
 */
interface ITicketManager is IERC165, IRootsyErrors {

    /**
    * @notice Mints tickets for multiple end owners in batches.
    * @param endOwners An array of end owners to whom tickets will be minted.
    * @param campaigns An array of campaign addresses for which tickets are being minted.
    * @param ticketsCounts An array specifying the number of tickets to mint for each end owner.
    * @return ticketsTokenIds An array of arrays containing the token IDs of the minted tickets for each end owner.
    * @dev Reverts if the length of `endOwners`, `campaigns`, and `ticketsCounts` do not match.
    */
    function mintTicketsBatch(
        address[] memory endOwners,
        address[] memory campaigns,
        uint256[] memory ticketsCounts
    ) external returns (uint256[][] memory ticketsTokenIds);

    /**
     * @notice Mints tickets for a specific end owner in a campaign.
     * @param endOwner The address of the end owner who will receive the tickets.
     * @param campaign The address of the campaign for which tickets are being minted.
     * @param ticketsCount The number of tickets to mint.
     * @return ticketsTokenIds An array containing the token IDs of the minted tickets.
     * @dev If any organization is found for the endOwner, we will mint it for him.
     * @dev If any campaign is found for the endOwner, we will mint it for him.
     */
    function mintTickets(
        address endOwner,
        address campaign,
        uint256 ticketsCount
    ) external returns (uint256[] memory ticketsTokenIds);

    /**
     * @notice Transfers tickets in batch to multiple recipients for different campaigns
     * @param recipient An array of recipient to whom tickets will be transferred.
     * @param campaigns An array of campaign addresses for which tickets are being transferred.
     * @param ticketsCounts Array of ticket counts to be transferred to each recipient for each campaign.
     * @dev Reverts if the length of `recipient`, `campaigns`, and `ticketsCounts` do not match.
     */
    function transferTicketsBatch(
        address[] memory recipient,
        address[] memory campaigns,
        uint256[] memory ticketsCounts
    ) external;

    /**
     * @notice Transfers tickets to a recipient for a specific campaign
     * @param recipient The address of the recipient who will receive the tickets.
     * @param campaign The address of the campaign for which tickets are being transferred.
     * @param ticketCounts Number of tickets to be transferred.
     */
    function transferTickets(
        address recipient,
        address campaign,
        uint256 ticketCounts
    ) external;
}
