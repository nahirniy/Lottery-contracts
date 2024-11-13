// SPDX-License-Identifier: MIT
pragma solidity 0.8.21;

import {IERC7401} from "@rmrk-team/evm-contracts/contracts/RMRK/nestable/IERC7401.sol";
import {IERC165} from "@openzeppelin/contracts/utils/introspection/IERC165.sol";
import {RMRKNestable} from "@rmrk-team/evm-contracts/contracts/RMRK/nestable/RMRKNestable.sol";

import {RootsyErc7401Base} from "./base/RootsyErc7401Base.sol";
import {RootsyCheckMintTime} from "./base/RootsyCheckMintTime.sol";

import {IRootsyCampaign} from "./interface/IRootsyCampaign.sol";
import {IRootsyTicket} from "./interface/IRootsyTicket.sol";

/**
 * @title RootsyTicket
 * @notice The RootsyTicket contract manages the minting and burning of ticket within the Rootsy platform.
 * @dev RootsyTicket contract allows minting tokens to specific campaigns, burning the last minted token,
 * and retrieving contract-related information.
 */
contract RootsyTicket is RootsyErc7401Base, RootsyCheckMintTime, IRootsyTicket {
    /// @inheritdoc IRootsyTicket
    address public campaign;

    /**
     * @notice Constructor function to initialize the RootsyTicket contract.
     * @param _defaultAdmin The address of the admin this contract.
     * @param _minter The address of the minter role.
     * @param _campaign The address of the RootsyCampaign contract.
     * @param _name The name of the contract.
     * @dev Reverts if the campaign contract does not support their respective interfaces.
     */
    constructor(
        address _defaultAdmin,
        address _minter,
        address _campaign,
        string memory _name
    ) RootsyErc7401Base(_defaultAdmin, _minter, _name) {
        if (
            !IRootsyCampaign(_campaign).supportsInterface(
                type(IRootsyCampaign).interfaceId
            )
        ) {
            revert InterfaceNotSupported();
        }
        campaign = _campaign;
    }

    /// @inheritdoc IRootsyTicket
    function mintToCampaign(
        uint256 parentId,
        bytes memory data
    )
        public
        onlyRole(MINTER_ROLE)
        notBeforeMintClosed
        returns (uint256)
    {
        _mintToCampaign(parentId, data);
        
        return _lastTokenId;
    }

    /// @inheritdoc IRootsyTicket
    function mintToCampaignBatch(
        uint256 tokenCount,
        uint256 parentId,
        bytes memory data
    )
        public
        onlyRole(MINTER_ROLE)
        notBeforeMintClosed
        returns (uint256[] memory)
    {
        uint256[] memory tokenIds = new uint256[](tokenCount);

        for (uint256 i; i < tokenCount; i++) {
            _mintToCampaign(parentId, data);
            tokenIds[i] = _lastTokenId;
        }
        return tokenIds;
    }
    
    /// @inheritdoc IRootsyTicket
    function burnLastTicket() external {
        if(msg.sender != campaign){
            revert IncorrectValue("Only Campaign can burn tickets");
        }
        uint previousLastTiketId = _lastTokenId;
        _burn(previousLastTiketId, 0);
        emit TicketBurned(previousLastTiketId, campaign);
        _lastTokenId--;
    }

    /// @inheritdoc RootsyCheckMintTime
    function getLotteryContract() public view override returns (address) {
        return IRootsyCampaign(campaign).lottery();
    }

    /// @inheritdoc IERC7401
    function ownerOf(
        uint256 tokenId
    ) public view override(RMRKNestable, IERC7401) returns (address owner_) {
        return super.ownerOf(tokenId);
    }

    /// @inheritdoc IRootsyTicket
    function getOrganisation() public view returns (address) {
        return IRootsyCampaign(campaign).organization();
    }

    /// @inheritdoc IRootsyTicket
    function getUserTicketIds(address _owner) view external returns (uint256[] memory){
        uint256 campaignId = IRootsyCampaign(campaign).getUserCampaignId(_owner);
        // code campaign contract ensures that a campaign can only have tickets in its children
        Child[] memory tickets = IRootsyCampaign(campaign).childrenOf(campaignId);

        uint256[] memory tiketIds = new uint256[](tickets.length);

        for (uint256 i; i < tickets.length; i++) {
            tiketIds[i] = tickets[i].tokenId;
        }

        return tiketIds;
    }

    /// @inheritdoc IERC165
    function supportsInterface(
        bytes4 interfaceId
    ) public view override(RootsyErc7401Base, IERC165) returns (bool) {
        return
            interfaceId == type(IRootsyTicket).interfaceId ||
            super.supportsInterface(interfaceId);
    }

    /**
     * @notice Mints a new token and assigns it to the specified parent campaign.
     * @param parentId The ID of the parent campaign.
     * @param data Additional data to include in the minted token.
     */
    function _mintToCampaign(uint parentId, bytes memory data) internal {
        _lastTokenId++;
        _nestMint(campaign, _lastTokenId, parentId, data);
        _approve(msg.sender, _lastTokenId);

        emit TicketMintedToCampaign(_lastTokenId, parentId, campaign);

    }
}
