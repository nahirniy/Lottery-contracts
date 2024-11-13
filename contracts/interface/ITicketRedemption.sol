// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {IERC165} from "@openzeppelin/contracts/utils/introspection/IERC165.sol";
import {IRootsyErrors} from "./IRootsyErrors.sol";

/**
 * @title TicketRedemption contract
 * @notice TicketRedemption enables users to exchange tickets for rewards on Rootsy platform before the burn deadline.
 * @dev TicketRedemption manages reward token addresses, handles ticket redemption, and oversees redemption price and caps.
 */
interface ITicketRedemption is IERC165, IRootsyErrors {

    /**
     * @notice Emitted when tickets are redeemed for a reward.
     * @param redeemer The address of the redeemer that burned his tiсket.
     * @param ticketContract The address of the ticket contract.
     * @param ticketsCount The number of tickets redeemed.
     * @param redemptionAmount The amount of reward tokens redeemed.
     */
    event TicketRedeemed(address indexed redeemer, address ticketContract, uint ticketsCount, uint redemptionAmount);

    /**
     * @notice Emitted when the redemption price is set.
     * @param redemptionPrice The new redemption price.
     */
    event SetRedemptionPrice(uint redemptionPrice);

    /**
     * @notice Emitted when the redemption cap is set.
     * @param redemptionCap The new redemption cap.
     */
    event SetRedemptionCap(uint redemptionCap);

    /**
     * @notice Retrieves the address of the lottery contract associated with this redemption.
     * @return The address of the lottery contract.
     */
    function lottery() external view returns (address);

    /**
     * @notice Redeems(burns) tickets for a reward.
     * @param ticketContract The ticket contract address.
     * @param amountOfTicketsToBurn The number of tickets to redeem.
     * @dev It is possible to redeem if the TicketRedemption must be approved from RootsyCampaing contract.
     * @dev After burn, user receives a reward in tokens.
     * @dev Only callable if burn period hasn't ended, redemption price is set, redemption cap.
     * isn't reached, user owns an organization and the ticket is registered in the lottery.
     */
    function redeem(address ticketContract, uint amountOfTicketsToBurn) external;

     /**
     * @notice Calculates the redemption amount for the given number of tickets to burn
     * @param amountOfTicketsToBurn The number of tickets to burn for redemption
     * @return The calculated redemption amount
     */
    function getRedemptionAmount(uint amountOfTicketsToBurn) external view returns (uint);

    /**
     * @notice Sets the reward token contract address.
     * @param _rewardToken The address of the reward token contract.
     * @dev Only can be called by accounts with the DEFAULT_ADMIN_ROLE.
     * @dev Reverts if reward token is not a contract.
     */
    function setRewardToken(address _rewardToken) external;

    /**
     * @dev Sets the redemption price.
     * @param _redemptionPrice The new redemption price.
     * @dev Only can be called by accounts with the DEFAULT_ADMIN_ROLE.
     * @dev Reverts if the caller doesn't have admin role or if the redemption price is set to 0.
     */
    function setRedemptionPrice(uint _redemptionPrice) external;
    
    /**
     * @notice Sets the redemption cap.
     * @param _redemptionCap The new redemption cap. A value of 0 indicates no cap.
     * @dev Only can be called by accounts with the DEFAULT_ADMIN_ROLE.
     * @dev redemptionCap can be 0, meaning no cap
     */
    function setRedemptionCap(uint _redemptionCap) external;

    /**
     * @notice Allows the admin to withdraw tokens from the contract.
     * @param token Address of the token contract.
     * @param receiver Address to receive the withdrawn tokens.
     * @param amount Amount of tokens to withdraw.
     */
    function withdrawTokens(address token, address receiver, uint256 amount) external;

    /**
     * @notice Allows the admin to withdraw all reward tokens from the contract.
     */
    function withdrawAllTokens() external;
}
