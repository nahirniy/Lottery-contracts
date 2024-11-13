// SPDX-License-Identifier: MIT
pragma solidity 0.8.21;

import {Lottery} from "../Lottery.sol";

/**
 * @title LotteryDeployerLibrary
 * @notice Library for deploying lottery contracts.
 * @dev This library provides a function to deploy lottery contracts with specific parameters.
 */
library LotteryDeployerLibrary {
    /**
     * @notice Deploys a new lottery contract.
     * @param defaultAdmin The address of the admin for the contract.
     * @param lowerAdmin The address that can register tickets for the lottery.
     * @param randomGetterContract randomGetter contract address to get a random number in the lottery.
     * @param lotteriesCount The number of lotteries deployed.
     * @param mintDeadline The deadline for ticket minting.
     * @param burnDeadline The deadline for ticket burning.
     * @param lotteryTime The time when the lottery will be conducted.
     * @return The address of the newly deployed lottery contract.
     * @dev Reverts if _mintDeadline is greater than _burnDeadline,
     *  _burnDeadline is greater than _lotteryTime,
     *  _mintDeadline is greater than _lotteryTime.
     */
    function deployLotteryContract(
        address defaultAdmin,
        address lowerAdmin,
        address randomGetterContract,
        uint256 lotteriesCount,
        uint32 mintDeadline,
        uint32 burnDeadline,
        uint32 lotteryTime
    ) external returns (address) {
        return address(
            new Lottery{salt: keccak256(abi.encodePacked(lotteriesCount))}(
                defaultAdmin,
                lowerAdmin,
                randomGetterContract,
                mintDeadline,
                burnDeadline,
                lotteryTime
            )
        );
    }
}