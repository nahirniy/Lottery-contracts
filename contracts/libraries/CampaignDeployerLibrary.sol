// SPDX-License-Identifier: MIT
pragma solidity 0.8.21;

import {RootsyCampaign} from "../RootsyCampaign.sol";

/**
 * @title CampaignDeployerLibrary
 * @notice Library for deploying campaign contracts.
 * @dev This library provides a function to deploy campaign contracts with specific parameters.
 */
library CampaignDeployerLibrary {
    /**
     * @notice Deploys a new campaign contract.
     * @param defaultAdmin The address of the admin for the contract.
     * @param lowerAdmin The address that can set the ticket contract for the campaign.
     * @param minterContract The address that can mint organizations, campaigns and tickets.
     * @param campaignsCount The amount of campaigns deployed.
     * @param lottery The address of the lottery contract in that the campaign participates.
     * @param redemption The address of the redemption contract that can burn ticket.
     * @param organization The address of the parent organization contract.
     * @param campaignName The name of the campaign.
     * @return The address of the newly deployed campaign contract.
     */
    function deployCampaignContract(
        address defaultAdmin,
        address lowerAdmin,
        address minterContract,
        uint256 campaignsCount,
        address lottery,
        address redemption,
        address organization,
        string memory campaignName
    ) external returns (address) {
        return address(
            new RootsyCampaign{
                salt: keccak256(abi.encodePacked(campaignsCount))
            }(
                defaultAdmin,
                lowerAdmin,
                minterContract,
                organization,
                lottery,
                redemption,
                campaignName
            )
        );
    }
}