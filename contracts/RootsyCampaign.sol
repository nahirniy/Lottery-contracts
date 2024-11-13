// SPDX-License-Identifier: MIT
pragma solidity 0.8.21;

import {IERC165} from "@openzeppelin/contracts/utils/introspection/IERC165.sol";
import {IERC7401} from "@rmrk-team/evm-contracts/contracts/RMRK/nestable/IERC7401.sol";
import {RMRKNestable} from "@rmrk-team/evm-contracts/contracts/RMRK/nestable/RMRKNestable.sol";

import {RootsyCheckMintTime} from "./base/RootsyCheckMintTime.sol";
import {RootsyErc7401Base} from "./base/RootsyErc7401Base.sol";

import {IRootsyOrganization} from "./interface/IRootsyOrganization.sol";
import {ILottery} from "./interface/ILottery.sol";
import {IRootsyTicket} from "./interface/IRootsyTicket.sol";
import {IRootsyCampaign} from "./interface/IRootsyCampaign.sol";
import {ITicketRedemption} from "./interface/ITicketRedemption.sol";

/**
 * @title RootsyCampaign contract
 * @notice The RootsyCampaign contract manages the creation and ownership of campaign tokens within the Rootsy platform.
 * @dev RootsyCampaign allows minting campaign tokens for specific organizations, setting ticket contracts,
 * burning tickets, and retrieving campaign-related information.
 */
contract RootsyCampaign is 
    RootsyErc7401Base,
    RootsyCheckMintTime,
    IRootsyCampaign
{
    /// @notice Сonstant that contains the LOWER_ADMIN role. Owner of this role can set the contract ticket.
    bytes32 public constant LOWER_ADMIN_ROLE = keccak256("LOWER_ADMIN");

    /// @inheritdoc IRootsyCampaign
    address public lottery;
    /// @notice The address of the associated redemption contract that can burn ticket.
    address public redemption;
    /// @inheritdoc IRootsyCampaign
    address public organization;
    /// @inheritdoc IRootsyCampaign
    address public ticketsContract;

    /// @inheritdoc IRootsyCampaign
    mapping(uint256 => uint256) public ownerToken;
    /// @inheritdoc IRootsyCampaign
    mapping(uint256 => uint256) public organizationToCampaign;

    /**
     * @notice Constructor function to initialize the RootsyCampaign contract.
     * @param _defaultAdmin The address of the admin this contract.
     * @param _lowerAdmin The address of the lower admin role that can set the contract ticket. Expected to be the RootsyFacotry contract.
     * @param _minter The address of the minter role that can mint campaign to the organization.
     * @param _organization The address of the RootsyOrganization contract that is the parent of this RootsyCampaign.
     * @param _lottery The address of the Lottery contract.
     * @param _redemption The address of the Redemption contract that can burn ticket.
     * @param _name The name of the contract.
     * @dev Reverts if the organization or lottery contracts do not support their respective interfaces.
     */
    constructor(
        address _defaultAdmin,
        address _lowerAdmin,
        address _minter,
        address _organization,
        address _lottery,
        address _redemption,
        string memory _name
    ) RootsyErc7401Base(_defaultAdmin, _minter, _name) {
        if (
            !IRootsyOrganization(_organization).supportsInterface(type(IRootsyOrganization).interfaceId) ||
            !ILottery(_lottery).supportsInterface(type(ILottery).interfaceId) ||
            !ITicketRedemption(_redemption).supportsInterface(type(ITicketRedemption).interfaceId)
        ) {
            revert InterfaceNotSupported();
        }

        organization = _organization;
        lottery = _lottery;
        redemption = _redemption;

        _setupRole(LOWER_ADMIN_ROLE, _lowerAdmin);
    }

    /// @inheritdoc IRootsyCampaign
    function mintToOrganization(
        uint256 parentId,
        bytes memory data
    ) public onlyRole(MINTER_ROLE) notBeforeMintClosed returns (uint256 mintedTokenId) {
        if (organizationToCampaign[parentId] != 0) {
            revert IncorrectCondition("Organization already has this campaign");
        }

        mintedTokenId = ++_lastTokenId;
        _nestMint(organization, mintedTokenId, parentId, data);
        organizationToCampaign[parentId] = mintedTokenId;
        ownerToken[parentId] = mintedTokenId;
        _approve(msg.sender, mintedTokenId);
        emit CampaignTokenMintedToOrganization(mintedTokenId, msg.sender, parentId);
    }

    /// @inheritdoc IRootsyCampaign
    function setTicketContract(
        address _ticketsContract
    ) public {
        if (!hasRole(LOWER_ADMIN_ROLE, msg.sender) && !hasRole(DEFAULT_ADMIN_ROLE, msg.sender)) {
            revert MissingAdminRole(msg.sender);
        }
        if (
            !IRootsyTicket(_ticketsContract).supportsInterface(
                type(IRootsyTicket).interfaceId
            )
        ) {
            revert InterfaceNotSupported();
        }
        emit TicketContractSet(_ticketsContract, msg.sender);

        ticketsContract = _ticketsContract;
    }

    /// @inheritdoc IRootsyCampaign
    function burnTicket() external {
        uint campaignId = getUserCampaignId(msg.sender);
        _burnTicket(campaignId);
    }

    /// @inheritdoc IRootsyCampaign
    function burnTicketBatch(uint256 amountOfTicketsToBurn) public {
        uint campaignId = getUserCampaignId(msg.sender);
        burnTicketBatch(campaignId, amountOfTicketsToBurn);
    }

    /// @inheritdoc IRootsyCampaign
    function burnTicket(uint campaignId) public {
        _burnTicket(campaignId);
    }

    /// @inheritdoc IRootsyCampaign
    function burnTicketBatch(uint campaignId, uint256 amountOfTicketsToBurn) public {
        //this check doesn't give 100% guarantee that the user is trying to burn the correct amount of tickets
        //as _activeChildren may have not only tickets in case of manual child accepting.
        //If this scenario happens the contract will revert with panic code 0x11 
        //that is also a desired behaviour
        if (amountOfTicketsToBurn > _activeChildren[campaignId].length) {
            revert IncorrectValue("Not enough tickets to burn");
        }
        for(uint i; i < amountOfTicketsToBurn; i++) {
            _burnTicket(campaignId);
        }
    }

    /// @inheritdoc IRootsyCampaign
    function transferTicket(uint256 toCampaignId) public {
        uint256 fromCampaignId = getUserCampaignId(msg.sender);
        _transferTicket(fromCampaignId, toCampaignId);
    }

    /// @inheritdoc IRootsyCampaign
    function transferTicketBatch(
        uint256 toCampaignId,
        uint256 amountOfTicketsToTransfer
    ) public {
        uint256 fromCampaignId = getUserCampaignId(msg.sender);
        transferTicketBatch(fromCampaignId, toCampaignId, amountOfTicketsToTransfer);
    }

    /// @inheritdoc IRootsyCampaign
    function transferTicket(uint256 fromCampaignId, uint256 toCampaignId) public {
        _transferTicket(fromCampaignId, toCampaignId);
    }

    /// @inheritdoc IRootsyCampaign
    function transferTicketBatch(
        uint256 fromCampaignId,
        uint256 toCampaignId,
        uint256 amountOfTicketsToTransfer
    ) public {
        if (amountOfTicketsToTransfer > _activeChildren[fromCampaignId].length) {
            revert IncorrectValue("Not enough tickets to transfer");
        }
        for(uint256 i; i < amountOfTicketsToTransfer; i++) {
            _transferTicket(fromCampaignId, toCampaignId);
        }
    }

    /// @inheritdoc IERC7401
    function ownerOf(
        uint256 tokenId
    ) public view override(RMRKNestable, IERC7401) returns (address owner_) {
        return super.ownerOf(tokenId);
    }

    /// @inheritdoc RootsyCheckMintTime
    function getLotteryContract() public view override returns (address) {
        return lottery;
    }

    /// @inheritdoc IRootsyCampaign
    function getUserCampaignId(address _owner) public view returns (uint256) {
        uint256 organizationId = IRootsyOrganization(organization).getUserOrganizationId(_owner);
        return ownerToken[organizationId];
    }

    /// @inheritdoc IERC165
    function supportsInterface(
        bytes4 interfaceId
    ) public view override(RootsyErc7401Base, IERC165) returns (bool) {
        return interfaceId == type(IRootsyCampaign).interfaceId || 
            super.supportsInterface(interfaceId);
    }

    /**
     * @notice Performs check whether the child is a ticket before accepting it
     * @param childAddress The address of the child contract.
     * @dev Ensures that only the ticket contract can be accepted as a child of the campaign.
     */
    function _beforeAcceptChild(
        uint256,
        uint256,
        address childAddress,
        uint256
    ) internal virtual override {
        if (childAddress != ticketsContract)
            revert IncorrectCondition("Only ticket can be child of campaign");
    }

    /**
     * @notice Burns a ticket associated with the given campaign ID.
     * @param campaignId The ID of the campaign owning the ticket to be burned.
     * @dev Reverts if the caller is not redemption contract, approved or the owner of the ticket.
     * @dev Transfers the burning ticket to the owner of the last ticket ID.
     * Transfers the last ticket ID to the burning campaign parent id.
     * Burns the last ticket ID.
     */
    function _burnTicket(uint256 campaignId) private {
        if(!_isApprovedOrOwner(msg.sender, campaignId) && msg.sender != redemption) {
            revert IncorrectCondition("Sender must be the owner, approved, or redemption contract");
        }

        Child[] storage campaignTickets = _activeChildren[campaignId];
        uint256 ticketIdToBurn = campaignTickets[campaignTickets.length - 1].tokenId;
        uint lastTiketId = IRootsyTicket(ticketsContract).totalSupply(); //last token id == total supply

        uint lastTiketOwnerId;
        if (lastTiketId != ticketIdToBurn) { //meaning that we are burning not the last ticket id
            (, lastTiketOwnerId, ) = IRootsyTicket(ticketsContract).directOwnerOf(lastTiketId);
        } else {
            lastTiketOwnerId = campaignId;
        }

        uint256 lastTiketIndexInChildren = 
            _findTiketIndex(lastTiketId, _activeChildren[lastTiketOwnerId]);

        //transfer the burning ticket from children of the burning campaign to the owner of the last ticket id
        _transferChild(
            campaignId,
            address(this),
            lastTiketOwnerId,
            campaignTickets.length - 1, 
            ticketsContract,
            ticketIdToBurn,
            false,
            new bytes(0)
        );
        _acceptChild(
            lastTiketOwnerId,
            _pendingChildren[lastTiketOwnerId].length - 1,
            ticketsContract,
            ticketIdToBurn
        );

        //transfer the last ticket id from the owner of the last ticket id to the burning campaign
        _transferChild(
            lastTiketOwnerId,
            address(this),
            campaignId,
            lastTiketIndexInChildren,
            ticketsContract,
            lastTiketId,
            false,
            new bytes(0)
        );

        _pendingChildren[campaignId].pop();
 
        IRootsyTicket(ticketsContract).burnLastTicket();
    }

    /**
     * @notice Transfers a ticket from one campaign to another.
     * @dev This function can only be called by an approved user or the direct owner of the fromCampaignId.
     * @param fromCampaignId The ID of the campaign to transfer the ticket from.
     * @param toCampaignId The ID of the campaign to transfer the ticket to.
     */
    function _transferTicket(
        uint256 fromCampaignId,
        uint256 toCampaignId
    ) private {
        if(!_isApprovedOrOwner(msg.sender, fromCampaignId)) {
            revert IncorrectCondition("User is not aprroved or owner");
        }
        Child[] storage fromCampaignTickets = _activeChildren[fromCampaignId];
        uint256 ticketIdToTransfer = fromCampaignTickets[fromCampaignTickets.length - 1].tokenId;

        uint256 tiketIndex = _findTiketIndex(ticketIdToTransfer, _activeChildren[fromCampaignId]);

        _transferChild(
            fromCampaignId,
            address(this),
            toCampaignId,
            tiketIndex,
            ticketsContract,
            ticketIdToTransfer,
            false,
            new bytes(0)
        );
        _acceptChild(
            toCampaignId,
            _pendingChildren[toCampaignId].length - 1,
            ticketsContract,
            ticketIdToTransfer
        );
    }

    /**
     * @notice Finds the index of a ticket in the provided list of children.
     * @param ticketId The ID of the ticket to find.
     * @param tickets The list of children containing tickets.
     * @return The index of the ticket in the list.
     */
    function _findTiketIndex(uint256 ticketId, Child[] memory tickets) private view returns (uint256) {
        for (uint256 i = 0; i < tickets.length; i++) {
            if (tickets[i].tokenId == ticketId && tickets[i].contractAddress == ticketsContract) {
                return i;
            }
        }
        //there is no way to get here as the last ticket id must be in the children of the campaign
    }
}
