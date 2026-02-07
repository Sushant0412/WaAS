// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title IGroth16Verifier
 * @dev Interface for the auto-generated Groth16 verifier
 */
interface IGroth16Verifier {
    function verifyProof(
        uint[2] calldata _pA,
        uint[2][2] calldata _pB,
        uint[2] calldata _pC,
        uint[4] calldata _pubSignals
    ) external view returns (bool);
}

/**
 * @title WhitelistRegistry
 * @dev On-chain registry for verified event whitelist approvals using ZK proofs
 */
contract WhitelistRegistry {
    // The Groth16 verifier contract
    IGroth16Verifier public verifier;
    
    // Admin address (deployer)
    address public admin;
    
    // Mapping: eventId => nullifier => isVerified
    // Nullifier prevents double-verification of the same approval
    mapping(uint256 => mapping(uint256 => bool)) public verifiedApprovals;
    
    // Mapping: eventId => commitment => exists
    // Stores all valid commitment hashes for an event
    mapping(uint256 => mapping(uint256 => bool)) public commitments;
    
    // Mapping: eventId => total verified count
    mapping(uint256 => uint256) public eventVerifiedCount;
    
    // Events
    event ApprovalVerified(
        uint256 indexed eventId,
        uint256 nullifier,
        uint256 commitment,
        uint256 timestamp
    );
    
    event VerifierUpdated(address oldVerifier, address newVerifier);

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can call this");
        _;
    }

    constructor(address _verifier) {
        verifier = IGroth16Verifier(_verifier);
        admin = msg.sender;
    }

    /**
     * @dev Verify a ZK proof and register the approval on-chain
     * @param _pA Proof element A
     * @param _pB Proof element B
     * @param _pC Proof element C
     * @param _pubSignals The 4 public signals from proof [commitment, nullifier, eventId, expectedNullifier]
     */
    function verifyAndRegister(
        uint[2] calldata _pA,
        uint[2][2] calldata _pB,
        uint[2] calldata _pC,
        uint[4] calldata _pubSignals
    ) external returns (bool) {
        uint256 _commitment = _pubSignals[0];
        uint256 _nullifier = _pubSignals[1];
        uint256 _eventId = _pubSignals[2];
        
        // Check nullifier hasn't been used
        require(
            !verifiedApprovals[_eventId][_nullifier],
            "Approval already verified"
        );
        
        // Verify the proof
        bool isValid = verifier.verifyProof(_pA, _pB, _pC, _pubSignals);
        require(isValid, "Invalid ZK proof");
        
        // Register the approval
        verifiedApprovals[_eventId][_nullifier] = true;
        commitments[_eventId][_commitment] = true;
        eventVerifiedCount[_eventId]++;
        
        emit ApprovalVerified(_eventId, _nullifier, _commitment, block.timestamp);
        
        return true;
    }

    /**
     * @dev Check if a nullifier has been used for an event
     */
    function isNullifierUsed(uint256 _eventId, uint256 _nullifier) 
        external 
        view 
        returns (bool) 
    {
        return verifiedApprovals[_eventId][_nullifier];
    }

    /**
     * @dev Check if a commitment exists for an event
     */
    function hasCommitment(uint256 _eventId, uint256 _commitment) 
        external 
        view 
        returns (bool) 
    {
        return commitments[_eventId][_commitment];
    }

    /**
     * @dev Get the count of verified approvals for an event
     */
    function getVerifiedCount(uint256 _eventId) external view returns (uint256) {
        return eventVerifiedCount[_eventId];
    }

    /**
     * @dev Update the verifier contract (admin only)
     */
    function updateVerifier(address _newVerifier) external onlyAdmin {
        address oldVerifier = address(verifier);
        verifier = IGroth16Verifier(_newVerifier);
        emit VerifierUpdated(oldVerifier, _newVerifier);
    }

    /**
     * @dev Transfer admin rights
     */
    function transferAdmin(address _newAdmin) external onlyAdmin {
        require(_newAdmin != address(0), "Invalid admin address");
        admin = _newAdmin;
    }
}
