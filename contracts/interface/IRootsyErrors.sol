// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

/**
 * @title IRootsyErrors
 * @notice Interface for error messages used in Rootsy contracts.
 */
interface IRootsyErrors {
    /**
     * @notice Error when the parameter in functions is not correct.
     * @param message The error message.
     */
    error IncorrectValue(string message);
     /**
     * @notice Error when some condition for performing the function is not correct.
     * @param message The error message.
     */
    error IncorrectCondition(string message);
    /**
     * @notice Error indicating that an action already performed.
     * @param message The error message.
     */
    error ActionPerformed(string message);
    /**
     * @notice Error indicating that the interface is not supported.
     */
    error InterfaceNotSupported();
}