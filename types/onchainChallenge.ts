// // Solana-specific imports
// // import { PublicKey } from '@solana/web3.js';
// // import { BN } from '@project-serum/anchor';

// /**
//  * Represents a challenge stored on-chain
//  * Only essential data needed for verification and financial operations is stored
//  */
// export interface OnchainChallenge {
//   // Unique identifiers
//   id: string;                         // Unique challenge ID (corresponds to off-chain ID)
//   offchainId: string;                 // Reference to Firestore ID
  
//   // Core challenge data
//   name: string;                       // Challenge name
//   creator: PublicKey;                 // Creator's wallet address
//   startTimestamp: BN;                 // Challenge start time (unix timestamp)
//   endTimestamp: BN;                   // Challenge end time (unix timestamp)
//   duration: number;                   // Duration in days
  
//   // Financial data
//   stakeCurrency: 'USDC' | 'SOL';      // Staking currency type
//   stakeAmount: BN;                    // Amount to stake (in smallest unit, e.g., lamports)
//   stakeTokenMint: PublicKey;          // Token mint address (null if SOL)
//   stakeTreasury: PublicKey;           // Treasury account holding the stakes
  
//   // Challenge parameters
//   metricType: string;                 // Type of fitness metric being tracked
//   targetValue: BN;                    // Target value to achieve
//   measurementUnit: string;            // Unit of measurement
  
//   // Status tracking
//   status: ChallengeStatus;            // Current challenge status
//   participantCount: number;           // Number of participants
//   successfulCount: number;            // Number of successful participants
  
//   // Flags
//   isSettled: boolean;                 // Whether rewards have been distributed
//   isSponsored: boolean;               // Whether this is a sponsored challenge
// }

// /**
//  * Represents a participant in a challenge
//  */
// export interface OnchainParticipant {
//   wallet: PublicKey;                  // Participant's wallet address
//   challengeId: string;                // Challenge ID
//   joinedAt: BN;                       // When participant joined
//   stakeAmount: BN;                    // Amount staked
//   dailyCompletionStatus: boolean[];   // Array tracking daily completion
//   hasCompleted: boolean;              // Whether participant completed the challenge
//   rewardClaimed: boolean;             // Whether participant claimed rewards
//   badgeIssued: boolean;               // Whether NFT badge was issued
// }

// /**
//  * Challenge status enum
//  */
// export enum ChallengeStatus {
//   Inactive = 0,
//   Active = 1,
//   Completed = 2,
//   Settled = 3,
//   Cancelled = 4
// }

// /**
//  * Challenge creation parameters
//  */
// export interface CreateChallengeParams {
//   name: string;
//   offchainId: string;
//   duration: number;
//   stakeCurrency: 'USDC' | 'SOL';
//   stakeAmount: number;
//   metricType: string;
//   targetValue: number;
//   measurementUnit: string;
//   isSponsored: boolean;
// }

// /**
//  * Challenge activation parameters
//  */
// export interface ActivateChallengeParams {
//   challengeId: string;
// }

// /**
//  * Join challenge parameters
//  */
// export interface JoinChallengeParams {
//   challengeId: string;
// }

// /**
//  * Daily metrics submission
//  */
// export interface SubmitMetricsParams {
//   challengeId: string;
//   metricValue: number;
//   dayIndex: number;
// }

// /**
//  * Challenge settlement parameters
//  */
// export interface SettleChallengeParams {
//   challengeId: string;
// }