// SPDX-License-Identifier: MIT
pragma solidity 0.8.21;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract RewardTokenMintableMock is ERC20 {
    constructor() ERC20("RewardToken", "RT") {
        _mint(msg.sender, 1000000 ether);
    }

    function mint(uint amount) external {
        _mint(msg.sender, amount);
    }

    function mint1e18(uint amount) external {
        _mint(msg.sender, amount * 1 ether);
    }
}