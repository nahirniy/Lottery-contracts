// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

import {IERC165} from "@openzeppelin/contracts/utils/introspection/IERC165.sol";
import {IRootsyErrors} from "./IRootsyErrors.sol";

/**
 * @title RandomGetter contract
 * @notice RandomGetter gets random numbers for lotteries using chainlink VRF.
 * @notice RandomGetter contract must be has enough link token, since we pay a link token for getting a random number.
 * @dev We use one RandomGetter contract for all lotteries, avoiding the
 * need to send the link token to the balance of each contract separately.
 */
interface IRandomGetter is IERC165, IRootsyErrors {
    /**
     * @notice Emitted when a request for a random number is sent.
     * @param requestId The ID of request that is done.
     * @param numWord The number of random words requested.
     */
    event RequestSent(uint256 requestId, uint32 numWord);
    /**
     * @notice Emitted when a request for a random number is fulfilled.
     * @param requestId The ID of request that is done.
     * @param randomWord The generated random number.
     */
    event RequestFulfilled(uint256 requestId, uint256 randomWord);

    /**
     * @notice Retrieves the request ID associated with the given lottery address.
     * @param lotteryAddress The address of the lottery.
     * @return The associated request ID.
     */
    function requestIds(address lotteryAddress) external view returns (uint);

    /**
     * @notice Retrieves the random number associated with the given request ID.
     * @param requestId The ID of the request.
     * @return The associated random number.
     */
    function randomNumbersByRequestId(uint256 requestId) external view returns (uint256);

    /**
     * @notice Requests a random number for the calling lottery contract
     * after that calls the VRF that returns the requestId. With this requestId we can get a random number.
     * @dev Only can be called callable by the lottery contract itself.
     * @return requestId The unique identifier for the random number request.
     * @dev Reverts if the lottery contract already has random number request is pending.
     */
    function requestRandomNumber() external returns (uint256);

    /**
     * @notice Retrieves the random number associated with the given request ID.
     * @param requestId The unique identifier for the random number request.
     * @return random The generated random number.
     */
    function getRandomNumber(uint256 requestId) external view returns (uint256);

    /**
     * @notice Retrieves the random number associated with the given lottery contract address.
     * @param lottery The address of the lottery contract.
     * @return random The generated random number.
     */
    function getRandomNumber(address lottery) external view returns (uint256);

    /**
     * @notice Allows the admin of this contract to withdraw tokens from the contract.
     * @param token The address of the token to withdraw.
     * @param amount The amount of tokens to withdraw.
     */
    function withdraw(address token, uint256 amount) external;
}