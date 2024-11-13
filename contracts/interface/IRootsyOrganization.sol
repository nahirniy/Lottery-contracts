// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

import {IERC165} from "@openzeppelin/contracts/utils/introspection/IERC165.sol";
import {IERC7401} from "@rmrk-team/evm-contracts/contracts/RMRK/nestable/IERC7401.sol";
import {IRootsyErc7401Base} from "./IRootsyErc7401Base.sol";

/**
 * @title RootsyOrganization contract
 * @notice The RootsyOrganization contract handles the creation and ownership of organization tokens in Rootsy.
 * @dev RootsyOrganization allows minting new tokens for specific parent passport and ensures each passport can own only one organization token.
 */
interface IRootsyOrganization is IERC7401, IRootsyErc7401Base {

    /**
     * @notice Emitted when a organization token is minted to parent passport.
     * @param tokenId The ID of the newly minted organization token.
     * @param minter The address that minted the organization token.
     * @param passportTokenParentId The ID of the parent passport token associated with the campaign token.
     */
    event OrganizationTokenMintedToPassport(uint256 indexed tokenId, address indexed minter, uint256 indexed passportTokenParentId);

    /**
     * @notice Retrieves address of the passport contract, which can mint tokens that owns organizations.
     * @return RootsyPassport contract address.
     */
    function passport() external returns(address);

    /**
     * @notice Mints a new organization token to the specified parent passport.
     * @param parentId The ID of the parent passport.
     * @param data Additional data to include in the minted token.
     * @return The ID of the newly minted token.
     * @dev Reverts if the parent passport already owns an organization token.
     */
    function mintToPassport(uint256 parentId, bytes memory data) external returns (uint256);

    /**
     * @notice Returns the organization token ID of the specified parent passport ID.
     * @param tokenId The ID of the parent passport token.
     * @return The organization token ID.
     */
    function ownerToken(uint256 tokenId) external view returns (uint256);

    /**
     * @notice Retrieves the organization ID associated with a specific user.
     * @param _owner The address of the owner who has a passport token that owns this organization.
     * @return The organization ID associated with the specified user.
     */
    function getUserOrganizationId(address _owner) external view returns (uint256);
}
