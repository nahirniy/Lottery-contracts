// SPDX-License-Identifier: MIT
pragma solidity 0.8.21;

import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";
import {Address} from "@openzeppelin/contracts/utils/Address.sol";
import {IERC165} from "@openzeppelin/contracts/utils/introspection/IERC165.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

import {IRootsyPassport} from "./interface/IRootsyPassport.sol";
import {IRootsyOrganization} from "./interface/IRootsyOrganization.sol";
import {IRootsyCampaign} from "./interface/IRootsyCampaign.sol";
import {IRootsyTicket} from "./interface/IRootsyTicket.sol";
import {ILottery} from "./interface/ILottery.sol";
import {ITicketRedemption} from "./interface/ITicketRedemption.sol";

/**
 * @title TicketRedemption contract
 * @notice TicketRedemption enables users to exchange tickets for rewards on Rootsy platform before the burn deadline.
 * @dev TicketRedemption manages reward token addresses, handles ticket redemption, and oversees redemption price and caps.
 */
contract TicketRedemption is ITicketRedemption, AccessControl {
    using SafeERC20 for IERC20;

    /// @notice Price per redeemed one ticket.
    uint public redemptionPrice;
    /// @notice The amount of tokens spent on ticket redemption.
    uint public redeemed;
    /// @notice Maximum total redemption amount of tokens allowed.
    uint public redemptionCap;

    /// @notice The address of the associated lottery contract.
    address public lottery;

    /// @notice Token contract for rewards.
    IERC20 public rewardToken;

    /**
     * @dev Constructor function to initialize the TicketRedemption contract.
     * @param _defaultAdmin The address of the admin this contract.
     * @param _lottery The address of the Lottery contract.
     * @dev Reverts if the lottery contract does not support their respective interfaces.
     */
    constructor(address _defaultAdmin, address _lottery) {
        if (
            !ILottery(_lottery).supportsInterface(
                type(ILottery).interfaceId
            )
        ) {
            revert InterfaceNotSupported();
        }

        lottery = _lottery;
        
        _setupRole(DEFAULT_ADMIN_ROLE, _defaultAdmin);
    }

    /// @inheritdoc ITicketRedemption
    function redeem(address ticketContract, uint amountOfTicketsToBurn) external {
        address campaignAddress = IRootsyTicket(ticketContract).campaign();
        address organizationAddress = IRootsyCampaign(campaignAddress).organization();
        address passportAddress = IRootsyOrganization(organizationAddress).passport();
        uint32 burnDeadline = ILottery(lottery).burnDeadline();

        if (block.timestamp > burnDeadline) {
            revert IncorrectCondition("Burn period already finished");
        }
        if (redemptionPrice == 0) {
            revert IncorrectValue("Redemption price not set");
        }
        uint redemptionAmount = getRedemptionAmount(amountOfTicketsToBurn);
        uint passportId = IRootsyPassport(passportAddress).ownerToken(msg.sender);
        if (passportId == 0) {
            revert IncorrectValue("User is not an owner of any passport");
        }
        bool isRegisteredTicket = ILottery(lottery).isRegisteredTicket(ticketContract);
        if (!isRegisteredTicket) {
            revert IncorrectValue("The ticket is not registered");
        }

        uint organizationId = IRootsyOrganization(organizationAddress).ownerToken(passportId);
        uint campaignId = IRootsyCampaign(campaignAddress).ownerToken(organizationId);
        IRootsyCampaign(campaignAddress).burnTicketBatch(campaignId, amountOfTicketsToBurn);
        IERC20(rewardToken).safeTransfer(msg.sender, redemptionAmount);
        redeemed += redemptionAmount;
        emit TicketRedeemed(msg.sender, ticketContract, amountOfTicketsToBurn, redemptionAmount);
    }

    /// @inheritdoc ITicketRedemption
    function getRedemptionAmount(uint amountOfTicketsToBurn) public view returns (uint) {
        uint redemptionAmount = amountOfTicketsToBurn * redemptionPrice;
        if (redemptionCap > 0 && redeemed + redemptionAmount > redemptionCap) {
            revert IncorrectValue("Redemption cap reached");
        }
        return redemptionAmount;
    }

    /// @inheritdoc ITicketRedemption
    function setRewardToken(address _rewardToken) external onlyRole(DEFAULT_ADMIN_ROLE)  {
        if (Address.isContract(_rewardToken) == false) {
            revert IncorrectValue("Reward token is not a contract");
        }

        rewardToken = IERC20(_rewardToken);
    }

    /// @inheritdoc ITicketRedemption
    function setRedemptionPrice(uint _redemptionPrice) external onlyRole(DEFAULT_ADMIN_ROLE) {
        if (_redemptionPrice == 0) {
            revert IncorrectValue("Redemption price can't be 0");
        }
        redemptionPrice = _redemptionPrice;
        emit SetRedemptionPrice(_redemptionPrice);
    }

    /// @inheritdoc ITicketRedemption
    function setRedemptionCap(uint _redemptionCap) external onlyRole(DEFAULT_ADMIN_ROLE) {
        //redemptionCap can be 0, meaning no cap
        redemptionCap = _redemptionCap;
        emit SetRedemptionCap(_redemptionCap);
    }

    /// @inheritdoc ITicketRedemption
    function withdrawTokens(address token, address receiver, uint256 amount) external onlyRole(DEFAULT_ADMIN_ROLE) {
        IERC20(token).safeTransfer(receiver, amount);
    }

    /// @inheritdoc ITicketRedemption
    function withdrawAllTokens() external onlyRole(DEFAULT_ADMIN_ROLE) {
        uint256 balance = IERC20(rewardToken).balanceOf(address(this));
        rewardToken.safeTransfer(msg.sender, balance);
    }

    /// @inheritdoc IERC165
    function supportsInterface(
        bytes4 interfaceId
    ) public view override(AccessControl, IERC165) returns (bool) {
        return interfaceId == type(ITicketRedemption).interfaceId || 
            super.supportsInterface(interfaceId);
    }
}
