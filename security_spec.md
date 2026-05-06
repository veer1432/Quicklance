# Security Specification for Quiklance

## Data Invariants
1. A user can only read and write their own profile, except for admins who can read all and update status/remarks.
2. Experts can update their own profile details like bio, rate, etc.
3. Sessions can only be created by clients, and only if they have sufficient balance (logic in app, but rules should restrict).
4. Only participants of a chat room can read/write messages in it.
5. Clients can only see active experts.

## The Dirty Dozen Payloads (to be blocked)
1. **Identity Spoofing**: Attempting to create a user profile for a different UID.
2. **Role Escalation**: A client attempting to set their role to 'admin'.
3. **Ghost Verification**: A user setting their status to 'active' without admin review.
4. **Balance Injection**: A user updating their own `walletBalance`.
5. **Unauthorized Eavesdropping**: Reading messages from a chat room you aren't part of.
6. **Session Hijacking**: Modifying a session you aren't a client or expert of.
7. **Rate Manipulation**: Setting a negative `hourlyRate`.
8. **Rating Spoofing**: Directly updating your own `rating`.
9. **Spamming Messages**: Sending 1MB+ strings as chat messages.
10. **ID Poisoning**: Using extremely long strings as document IDs.
11. **Invisible Admin**: Attempting to read `/admins/` collection as a regular user.
12. **Status Shortcutting**: Moving a session from 'pending' directly to 'completed' without 'active' (if enforced in rules).

## Test Runner (Conceptual)
All above payloads should return PERMISSION_DENIED.
