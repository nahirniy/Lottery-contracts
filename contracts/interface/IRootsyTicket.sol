// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

import {IERC7401} from "@rmrk-team/evm-contracts/contracts/RMRK/nestable/IERC7401.sol";
import {IRootsyErc7401Base} from "./IRootsyErc7401Base.sol";

/**
 * @title RootsyTicket
 * @notice The RootsyTicket contract manages the minting and burning of ticket within the Rootsy platform.
 * @dev RootsyTicket contract allows minting tokens to specific campaigns, burning the last minted token,
 * and retrieving contract-related information.
 */
interface IRootsyTicket is IERC7401, IRootsyErc7401Base {

    /**
     * @notice Emitted when a ticket is minted to a parent campaign.
     * @param tokenId The ID of the minted ticket.
     * @param parentId The ID of the parent campaign.
     * @param campaignAddress The address of the campaign to which the ticket is minted.
     */
    event TicketMintedToCampaign(uint256 indexed tokenId, uint256 indexed parentId, address indexed campaignAddress);
    /**
     * @notice Emitted when a ticket is burned.
     * @param tokenId The ID of the burned ticket.
     * campaign The address of the campaign from which the ticket is burned.
     */
    event TicketBurned(uint256 indexed tokenId, address indexed campaign);

    /**
     * @notice Mints a token to the specified parent campaign.
     * @param parentId The ID of the parent campaign.
     * @param data Additional data to include in the minted token.
     * @return The ID of the last minted token.
     */
    function mintToCampaign(uint256 parentId, bytes memory data) external returns (uint256);

    /**
     * @notice Mints multiple tokens to the specified parent campaign.
     * @param tokenCount The number of tokens to mint.
     * @param parentId The ID of the parent campaign.
     * @param data Additional data to include in the minted tokens.
     * @return An array containing the IDs of the minted tokens.
     */
    function mintToCampaignBatch(
        uint256 tokenCount,
        uint256 parentId,
        bytes memory data
    ) external returns (uint256[] memory);

    /**
     * @notice Retrieves the ticket IDs owned by a specific user.
     * @param _owner The address of the user whose ticket IDs are to be retrieved.
     * @return An array containing the IDs of the tickets owned by the specified user.
     */
    function getUserTicketIds(address _owner) external view returns (uint256[] memory);
    /**
     * @notice Retrieves the address of the organization associated with the campaign.
     * @return The address of the organization.
     */
    function getOrganisation() external view returns (address);
    /**
     * @notice Retrieves the address of the parent campaign associated with the ticket.
     * @return The address of the campaign.
     */
    function campaign() external view returns (address);
    /**
     * @notice Burns the last minted ticket.
     * @dev Only callable by the campaign contract.
     * @dev After swapping the ticket to be burned with the last ticket in RootsyCampaign,
     * we burn the last ticket using this function.
     */
    function burnLastTicket() external;
}
