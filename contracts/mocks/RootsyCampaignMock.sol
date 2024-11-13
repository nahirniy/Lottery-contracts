// SPDX-License-Identifier: MIT
pragma solidity 0.8.21;

import {RootsyErc7401Base} from "../base/RootsyErc7401Base.sol";

import {IRootsyTicket} from "../interface/IRootsyTicket.sol";
import {IRootsyCampaign} from "../interface/IRootsyCampaign.sol";

contract RootsyCampaignMock is RootsyErc7401Base {
    address public lottery;
    address public ticketsContract;

    constructor(
        address _defaultAdmin,
        address _minter,
        address _lottery,
        string memory _name
    ) RootsyErc7401Base(_defaultAdmin, _minter, _name) {
        lottery = _lottery;
    }

    function mintTo(address to) external {
        _lastTokenId++;
        _safeMint(to, _lastTokenId, new bytes(0));
        _approve(msg.sender, _lastTokenId);
    }

    function burnTicket() external {
        IRootsyTicket(ticketsContract).burnLastTicket();
    }

    function setTicketContract(address _ticketsContract) public {
        ticketsContract = _ticketsContract;
    }

    function supportsInterface(
        bytes4 interfaceId
    ) public view override(RootsyErc7401Base) returns (bool) {
        return
            interfaceId == type(IRootsyCampaign).interfaceId ||
            super.supportsInterface(interfaceId);
    }
}
