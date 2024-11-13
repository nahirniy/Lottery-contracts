// SPDX-License-Identifier: MIT
pragma solidity 0.8.21;

import {IERC7401} from "@rmrk-team/evm-contracts/contracts/RMRK/nestable/IERC7401.sol";
import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";
import {IERC165} from "@openzeppelin/contracts/utils/introspection/IERC165.sol";

import {IRootsyPassport} from "./interface/IRootsyPassport.sol";
import {IRootsyOrganization} from "./interface/IRootsyOrganization.sol";
import {IRootsyCampaign} from "./interface/IRootsyCampaign.sol";
import {IRootsyTicket} from "./interface/IRootsyTicket.sol";
import {IRootsyFactory} from "./interface/IRootsyFactory.sol";
import {ITicketManager} from "./interface/ITicketManager.sol";

/**
 * @title TicketManager contract
 * @notice The TicketManager contract manages the creation and transfer of tickets for campaigns on the Rootsy platform. 
 * @dev TicketManager ensures that tickets are minted and transferred for end owners within specified campaigns.
 */
contract TicketManager is
    ITicketManager,
    AccessControl
{
    /// @notice Сonstant that contains the MINTER role. Owner of this role can mint organization, campaigns and tickets.
    bytes32 public constant MINTER_ROLE = keccak256("MINTER");

    /// @notice Address of the RootsyFactory contract.
    IRootsyFactory public factory;

    /**
     * @notice Constructor function to initialize the TicketMinter contract.
     * @param _defaultAdmin The address of the admin this contract.
     * @param _minter The address of the minter role.
     * @param _factory The address of the RootsyFactory contract.
     * @dev Reverts if the factory contract does not support their respective interfaces.
     */
    constructor(address _defaultAdmin, address _minter, address _factory) {
        if (
            !IRootsyFactory(_factory).supportsInterface(
                type(IRootsyFactory).interfaceId
            )
        ) {
            revert InterfaceNotSupported();
        }
        _setupRole(DEFAULT_ADMIN_ROLE, _defaultAdmin);
        _setupRole(MINTER_ROLE, _minter);
        factory = IRootsyFactory(_factory);
    }

    /// @inheritdoc ITicketManager
    function mintTicketsBatch(
        address[] memory endOwners,
        address[] memory campaigns,
        uint256[] memory ticketsCounts
    )
        public
        returns (uint256[][] memory ticketsTokenIds)
    {
        if (endOwners.length != ticketsCounts.length || endOwners.length != campaigns.length) {
            revert IncorrectValue("endOwners, campaigns, and ticketsCounts length mismatch");
        }
        ticketsTokenIds = new uint256[][](endOwners.length);
        for (uint i; i < endOwners.length; i++) {
            uint256[] memory userTicketsTokenIds = mintTickets(endOwners[i], campaigns[i], ticketsCounts[i]);
            ticketsTokenIds[i] = userTicketsTokenIds;
        }
    }

    /// @inheritdoc ITicketManager
    function mintTickets(
        address endOwner,
        address campaign,
        uint256 ticketsCount
    )
        public
        onlyRole(MINTER_ROLE)
        returns (uint256[] memory ticketsTokenIds)
    {
        uint256 campaignTokenId = _mintTokens(endOwner, campaign);
        address ticket = _getTicketFromCampaign(campaign);

        ticketsTokenIds = _mintTicketToCampaignAndAccept(
            ticket,
            campaign,
            ticketsCount,
            campaignTokenId
        );
    }

    /// @inheritdoc ITicketManager
    function transferTicketsBatch(
        address[] memory recipient,
        address[] memory campaigns,
        uint256[] memory ticketsCounts
    )
        public
    {   
        if (recipient.length != ticketsCounts.length || recipient.length != campaigns.length) {
            revert IncorrectValue("recipient, campaigns, and ticketsCounts length mismatch");
        }

        for (uint256 i; i < recipient.length; i++) {
            transferTickets(recipient[i], campaigns[i], ticketsCounts[i]);
        }
    }

    /// @inheritdoc ITicketManager
    function transferTickets(
        address recipient,
        address campaign,
        uint256 ticketCounts
    )
        public
    {
        uint256 fromCampaignId =  IRootsyCampaign(campaign).getUserCampaignId(msg.sender);
        uint256 toCampaignId = _mintTokens(recipient, campaign);

        IRootsyCampaign(campaign).transferTicketBatch(fromCampaignId, toCampaignId, ticketCounts);
    }

    /**
     * @notice Retrieves the organization address associated with a campaign from the factory contract.
     * @param campaign The address of the campaign.
     * @return organization The address of the organization associated with the campaign.
     * @dev Reverts if any organization is found for the provided campaign.
     */
    function _getOrganizationFromFactory(
        address campaign
    ) private view returns (address) {
        address organization = factory.campaignOrganization(campaign);
        if (organization == address(0)) {
            revert IncorrectValue("No organization found for campaign");
        }
        return organization;
    }

    /**
     * @notice Retrieves the ticket contract address associated with a campaign.
     * @param campaign The address of the campaign.
     * @return The address of the ticket contract associated with the campaign.
     */
    function _getTicketFromCampaign(
        address campaign
    ) private view returns (address) {
        address ticket = IRootsyCampaign(campaign).ticketsContract();
        // There is no need to check if ticket == address(0) because this is an impossible scenario.
        return ticket;
    }

    /**
     * @notice Finds the token ID a organization.
     * @param passportChildren The list of children tokens owned by the passport.
     * @param organization The address of the organization.
     * @return organizationTokenId The token ID associated with the campaign, or 0 if not found.
     */
    function _getOrganizationTokenId(
        IERC7401.Child[] memory passportChildren,
        address organization
    ) private pure returns (uint256) {
        uint256 organizationTokenId;

        if (passportChildren.length != 0) {
            for (uint256 i = 0; i < passportChildren.length; i++) {
                if (passportChildren[i].contractAddress == organization) {
                    organizationTokenId = passportChildren[i].tokenId;
                    break;
                }
            }
        }

        return organizationTokenId;
    }

    /**
     * @notice Finds the token ID a campaign.
     * @param organizationChildren The list of children tokens owned by the organization.
     * @param campaign The address of the campaign.
     * @return campaignTokenId The token ID associated with the campaign, or 0 if not found.
     */
    function _getCampaignTokenId(
        IERC7401.Child[] memory organizationChildren,
        address campaign
    ) private pure returns (uint256) {
        uint256 campaignTokenId;

        if (organizationChildren.length != 0) {
            for (uint256 i = 0; i < organizationChildren.length; i++) {
                if (organizationChildren[i].contractAddress == campaign) {
                    campaignTokenId = organizationChildren[i].tokenId;
                    break;
                }
            }
        }

        return campaignTokenId;
    }

    /**
     * @notice Mints the necessary tokens (passport, organization and campaign) for the specified endOwner.
     * @param endOwner The address of the end owner.
     * @param campaign The address of the campaign contract.
     * @return campaignTokenId The token ID associated with specified endOwner.
     */
    function _mintTokens(
        address endOwner,
        address campaign
    )
        private
        returns (uint256 campaignTokenId)
    {
        address passport = factory.passportContract();
        address organization = _getOrganizationFromFactory(campaign);

        uint256 passportTokenId = IRootsyPassport(passport).ownerToken(endOwner);
        if (passportTokenId == 0) {
            passportTokenId = IRootsyPassport(passport).mintTo(
                endOwner,
                new bytes(0)
            );
        }

        IERC7401.Child[] memory passportChildren = 
            IRootsyPassport(passport).childrenOf(passportTokenId);

        uint256 organizationTokenId = _getOrganizationTokenId(passportChildren, organization);
        if (organizationTokenId == 0) {
            organizationTokenId = _mintOrganizationToPassportAndAccept(
                organization,
                passport,
                passportTokenId
            );
        }

        IERC7401.Child[] memory organizationChildren = 
            IRootsyOrganization(organization).childrenOf(organizationTokenId);

        campaignTokenId = _getCampaignTokenId(organizationChildren, campaign);
        if (campaignTokenId == 0) {
            campaignTokenId = _mintCampaignToOrganizationAndAccept(
                campaign,
                organization,
                organizationTokenId
            );
        }
    }

    function _mintOrganizationToPassportAndAccept(
        address organization,
        address passport,
        uint256 passportTokenId
    ) private returns (uint256 organizationTokenId) {
        organizationTokenId = IRootsyOrganization(organization).mintToPassport(
            passportTokenId,
            new bytes(0)
        );

        IERC7401.Child[] memory pendingChildren = IRootsyPassport(passport)
            .pendingChildrenOf(passportTokenId);

        IRootsyPassport(passport).acceptChild(
            passportTokenId,
            pendingChildren.length - 1,
            organization,
            organizationTokenId
        );
    }

    /**
     * @notice Mints the campaign token to the organization and accepts it as a child.
     * @param campaign The address of the campaign contract.
     * @param organization The address of the organization contract.
     * @param organizationTokenId The ID of the organization token.
     * @return campaignTokenId The token ID associated with the minted campaign.
     */
    function _mintCampaignToOrganizationAndAccept(
        address campaign,
        address organization,
        uint256 organizationTokenId
    ) private returns (uint256 campaignTokenId) {
        campaignTokenId = IRootsyCampaign(campaign).mintToOrganization(
            organizationTokenId,
            new bytes(0)
        );

        IERC7401.Child[] memory pendingChildren = IRootsyOrganization(organization)
            .pendingChildrenOf(organizationTokenId);

        IRootsyOrganization(organization).acceptChild(
            organizationTokenId,
            pendingChildren.length - 1,
            campaign,
            campaignTokenId
        );
    }

    /**
     * @notice Mints tickets to the campaign and accepts them as children.
     * @param ticket The address of the ticket contract.
     * @param campaign The address of the campaign contract.
     * @param ticketsCount The number of tickets to mint.
     * @param campaignTokenId The ID of the campaign token.
     * @return ticketsTokenIds An array containing the IDs of the minted tickets.
     */
    function _mintTicketToCampaignAndAccept(
        address ticket,
        address campaign,
        uint256 ticketsCount,
        uint256 campaignTokenId
    ) private returns (uint256[] memory) {
        uint256[] memory ticketsTokenIds = new uint256[](ticketsCount);

        IERC7401.Child[] memory pendingChildren = IRootsyCampaign(campaign)
            .pendingChildrenOf(campaignTokenId);

        for (uint256 i = 0; i < ticketsCount; i++) {
            uint256 ticketTokenId = IRootsyTicket(ticket).mintToCampaign(
                campaignTokenId,
                new bytes(0)
            );

            IRootsyCampaign(campaign).acceptChild(
                campaignTokenId,
                pendingChildren.length,
                ticket,
                ticketTokenId
            );
            ticketsTokenIds[i] = ticketTokenId;
        }
        return ticketsTokenIds;
    }

    /**
     * @notice Checks if the contract supports a given interface.
     * @param interfaceId The interface identifier.
     * @return A boolean indicating whether the contract supports the interface.
     */
    function supportsInterface(
        bytes4 interfaceId
    )
        public
        view
        override(AccessControl, IERC165)
        returns (bool)
    {
        return 
            type(ITicketManager).interfaceId == interfaceId ||
            super.supportsInterface(interfaceId);
    }
}
