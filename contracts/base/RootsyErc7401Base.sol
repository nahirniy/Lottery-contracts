// SPDX-License-Identifier: MIT
pragma solidity 0.8.21;

import {RMRKNestable} from "@rmrk-team/evm-contracts/contracts/RMRK/nestable/RMRKNestable.sol";
import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";
import {IRootsyErc7401Base} from "../interface/IRootsyErc7401Base.sol";

/**
 * @title RootsyErc7401Base
 * @notice Abstract contract defines provides basic ERC-7401 functionality.
 * @dev RootsyErc7401Base contract must be inherited by others.
 */
abstract contract RootsyErc7401Base is RMRKNestable, AccessControl, IRootsyErc7401Base {
    /// @notice Сonstant that contains the MINTER role. Owner of this role can mint organization, campaigns and tickets.
    bytes32 public constant MINTER_ROLE = keccak256("MINTER");
    /// @notice Total amount of minted tokens. ID of the last ticket.
    uint256 internal _lastTokenId;
    /// @notice Name of the contract.
    string public name;

    /**
     * @notice Constructor function to initialize the RootsyErc7401Base contract.
     * @param _defaultAdmin The address of the admin contract that inherits this contract.
     * @param _minter The address of the minter.
     * @param _name The name of the contract.
     */
    constructor(address _defaultAdmin, address _minter, string memory _name) {
        name = _name;
        _setupRole(DEFAULT_ADMIN_ROLE, _defaultAdmin);
        _setupRole(MINTER_ROLE, _minter);
    }

    /// @inheritdoc IRootsyErc7401Base
    function isApprovedOrOwner(address spender, uint256 tokenId) external view returns (bool) {
        return _isApprovedOrOwner(spender, tokenId);
    }

    /// @inheritdoc IRootsyErc7401Base
    function totalSupply() external view returns (uint256) {
        return _lastTokenId;
    }

    /// @inheritdoc RMRKNestable
    function supportsInterface(
        bytes4 interfaceId
    ) public view virtual override(AccessControl, RMRKNestable) returns (bool) {
        return  
            AccessControl.supportsInterface(interfaceId) || 
            RMRKNestable.supportsInterface(interfaceId);
    }
}