// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IVerifier {
    function verifyProof(
        bytes calldata proof,
        bytes32 root,
        bytes32 nullifierHash
    ) external view returns (bool);
}

contract ZKEventAccess {
    struct EventData {
        bytes32 merkleRoot;
        address creator;
    }

    mapping(uint256 => EventData) public events;
    mapping(bytes32 => bool) public nullifierUsed;
    IVerifier public verifier;

    event EventCreated(uint256 eventId, bytes32 merkleRoot, address creator);
    event AccessGranted(uint256 eventId, address caller, bytes32 nullifier);

    constructor(address _verifier) {
        verifier = IVerifier(_verifier);
    }

    function createEvent(uint256 eventId, bytes32 merkleRoot) external {
        require(events[eventId].creator == address(0), "Event already exists");

        events[eventId] = EventData({
            merkleRoot: merkleRoot,
            creator: msg.sender
        });

        emit EventCreated(eventId, merkleRoot, msg.sender);
    }

    function updateEventRoot(uint256 eventId, bytes32 newRoot) external {
        require(msg.sender == events[eventId].creator, "Not event creator");
        events[eventId].merkleRoot = newRoot;
    }

    function proveAccess(
        uint256 eventId,
        bytes calldata proof,
        bytes32 nullifierHash
    ) external {
        require(!nullifierUsed[nullifierHash], "Nullifier already used");

        bytes32 root = events[eventId].merkleRoot;
        require(root != bytes32(0), "Event does not exist");

        bool ok = verifier.verifyProof(proof, root, nullifierHash);
        require(ok, "Invalid ZK proof");

        nullifierUsed[nullifierHash] = true;

        emit AccessGranted(eventId, msg.sender, nullifierHash);
    }
}
