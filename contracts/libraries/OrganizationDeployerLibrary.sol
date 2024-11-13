// SPDX-License-Identifier: MIT
pragma solidity 0.8.21;

import {RootsyOrganization} from "../RootsyOrganization.sol";

/**
 * @title OrganizationDeployerLibrary
 * @notice Library for deploying organization contracts.
 * @dev This library provides a function to deploy organization contracts with specific parameters.
 */
library OrganizationDeployerLibrary {
    /**
     * @notice Deploys a new organization contract.
     * @param defaultAdmin The address of the admin for the contract.
     * @param minter The address that can mint organizations, campaigns and tickets.
     * @param organizationsCount The number of organizations deployed so far.
     * @param organizationName The name of the organization.
     * @return The address of the newly deployed organization contract.
     */
    function deployOrganizationContract(
        address defaultAdmin,
        address minter,
        address passportContract,
        uint256 organizationsCount,
        string memory organizationName
    ) external returns (address) {
        address newOrganization = address(
            new RootsyOrganization{
                salt: keccak256(abi.encodePacked(organizationsCount))
            }(defaultAdmin, minter, passportContract, organizationName)
        );
        return newOrganization;
    }
}