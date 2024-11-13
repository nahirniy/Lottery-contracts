// SPDX-License-Identifier: MIT
pragma solidity 0.8.21;

import {TicketRedemption} from "../TicketRedemption.sol";

/**
 * @title RedemptionDeployerLibrary
 * @notice Library for deploying redemption contracts.
 * @dev This library provides a function to deploy redemption contracts with specific parameters.
 */
library RedemptionDeployerLibrary {
    /**
     * @notice Deploys a new redemption contract.
     * @param defaultAdmin The address of the admin for the contract.
     * @param lottery The address of the associated lottery contract.
     * @param redemptionsCount The number of redemptions contracts deployed.
     * @return The address of the newly deployed redemption contract.
     */
    function deployRedemtionContract(
        address defaultAdmin,
        address lottery,
        uint256 redemptionsCount
    ) external returns (address) {
        return address(
            new TicketRedemption{salt: keccak256(abi.encodePacked(redemptionsCount))}(
                defaultAdmin,
                lottery
            )
        );
    }
}
