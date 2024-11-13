// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

import {IERC7401} from "@rmrk-team/evm-contracts/contracts/RMRK/nestable/IERC7401.sol";
import {IRootsyErc7401Base} from "./IRootsyErc7401Base.sol";

/**
 * @title RootsyPassport contract
 * @dev RootsyPassport contract handles the creation and ownership of passport tokens which own organizations.
 * @dev RootsyPassport allows minting new tokens for specific addresses and ensures each address can own only one passport token.
 */
interface IRootsyPassport is IERC7401, IRootsyErc7401Base {

    /**
     * @dev Event emitted when a passport token is minted.
     * @param to The address the token is minted to.
     * @param tokenId The ID of the minted token.
     */
    event PassportTokenMinted(address indexed to, uint256 indexed tokenId);

    /**
     * @notice Get the token ID owned by an address.
     * @param owner The address to query.
     * @return tokenId The token ID owned by the address.
     */
    function ownerToken(address owner) external view returns (uint256);

    /**
     * @notice Mint a new passport token to a specified address.
     * @param to The address to mint the token to.
     * @param data Additional data to include in the minted token.
     * @return tokenId The ID of the minted token.
     */
    function mintTo(address to, bytes memory data) external returns(uint256);
}