// SPDX-License-Identifier: MIT
pragma solidity 0.8.21;

import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";
import {IERC165} from "@openzeppelin/contracts/utils/introspection/IERC165.sol";
import {IRootsyFactory} from "../interface/IRootsyFactory.sol";

contract RootsyFactoryMock is AccessControl {
    mapping(address => bool) public isLottery;

    address[] public lotteries;

    constructor() {
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }

    function addToLottery(address _lottery) external onlyRole(DEFAULT_ADMIN_ROLE) {
        lotteries.push(_lottery);
        isLottery[_lottery] = true;
    }

    function supportsInterface(
        bytes4 interfaceId
    ) public view override returns (bool) {
        return
            type(IRootsyFactory).interfaceId == interfaceId ||
            super.supportsInterface(interfaceId);
    }
}
