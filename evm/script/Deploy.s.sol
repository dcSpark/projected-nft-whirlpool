// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;
/* solhint-disable no-console */

import "forge-std/Script.sol";
import "forge-std/console2.sol";

import "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";

import "../src/Hololocker.sol";

contract Deploy is Script {
    function run() external {
        vm.startBroadcast();

        uint256 lockTime = 1 minutes;
        bytes32 dummySalt = bytes32(uint256(1));
        Hololocker hololocker = new Hololocker{salt: dummySalt}(lockTime, msg.sender);
        console2.log("Hololocker implementation:", address(hololocker));

        vm.stopBroadcast();
    }
}
