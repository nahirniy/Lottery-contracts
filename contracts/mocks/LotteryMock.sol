// SPDX-License-Identifier: MIT
pragma solidity 0.8.21;

import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";
import {IRandomGetter} from "../interface/IRandomGetter.sol";

contract LotteryMock is AccessControl {
    uint256 public requestRandomNumberId;
    uint256 public randomSalt;

    address randomGetter;

    constructor() {
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }

    function setupLottery(address _randomGetter) external onlyRole(DEFAULT_ADMIN_ROLE) {
        randomGetter = _randomGetter;
    }

    function runLottery() external onlyRole(DEFAULT_ADMIN_ROLE) {
        requestRandomNumberId = IRandomGetter(randomGetter).requestRandomNumber();
    }

    function rewardWinners() external onlyRole(DEFAULT_ADMIN_ROLE) {
        randomSalt = IRandomGetter(randomGetter).getRandomNumber(requestRandomNumberId);
    }
}