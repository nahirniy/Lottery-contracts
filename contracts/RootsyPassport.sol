// SPDX-License-Identifier: MIT
pragma solidity 0.8.21;

import {IERC165} from "@openzeppelin/contracts/utils/introspection/IERC165.sol";
import {IERC7401} from "@rmrk-team/evm-contracts/contracts/RMRK/nestable/IERC7401.sol";
import {RMRKNestable} from "@rmrk-team/evm-contracts/contracts/RMRK/nestable/RMRKNestable.sol";

import {RootsyErc7401Base} from "./base/RootsyErc7401Base.sol";

import {IRootsyPassport} from "./interface/IRootsyPassport.sol";
import {IRootsyOrganization} from "./interface/IRootsyOrganization.sol";

/**
 * @title RootsyPassport contract
 * @dev RootsyPassport contract handles the creation and ownership of passport tokens which own organizations.
 * @dev RootsyPassport allows minting new tokens for specific addresses and ensures each address can own only one passport token.
 */
contract RootsyPassport is RootsyErc7401Base, IRootsyPassport {
    mapping(address => uint256) public ownerToken;

    /**
     * @notice Constructor function to initialize the RootsyPassport contract.
     * @param _defaultAdmin The address of the admin this contract.
     * @param _minter The address of the minter role.
     * @param _name The name of the contract.
     */
    constructor(address _defaultAdmin, address _minter, string memory _name) 
        RootsyErc7401Base(_defaultAdmin, _minter, _name) { }

    
    /// @inheritdoc IRootsyPassport
    function mintTo(
        address to,
        bytes memory data
    ) public onlyRole(MINTER_ROLE) returns (uint256) {
        if (ownerToken[to] != 0) {
            revert IncorrectCondition("Owner already has passport token");
        }

        _lastTokenId++;
        _safeMint(to, _lastTokenId, data);
        _approve(msg.sender, _lastTokenId);
        ownerToken[to] = _lastTokenId;

        emit PassportTokenMinted(to, _lastTokenId);

        return _lastTokenId;
    }

    /// @inheritdoc IERC7401
    function ownerOf(uint256 tokenId) public view override(RMRKNestable, IERC7401) returns (address owner_) {
        return super.ownerOf(tokenId);
    }

    /// @inheritdoc IERC165
    function supportsInterface(
        bytes4 interfaceId
    ) public view override(RootsyErc7401Base, IERC165) returns (bool) {
        return interfaceId == type(IRootsyPassport).interfaceId || 
            super.supportsInterface(interfaceId);
    }

    /**
     * @notice Performs check whether the child has IRootsyOrganization interface before accepting it.
     * @param childAddress The address of the child contract.
     * @dev Throws an error if the child contract does not support the IRootsyOrganization interface.
     */
    function _beforeAcceptChild(
        uint256,
        uint256,
        address childAddress,
        uint256
    ) internal virtual override {
        if (
            !IRootsyOrganization(childAddress).supportsInterface(
                type(IRootsyOrganization).interfaceId
            )
        ) {
            revert IncorrectCondition("Only organization can be child of passport");
        }
    }
}
