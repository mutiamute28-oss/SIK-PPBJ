# Auth Testing Playbook

## Step 1: MongoDB Verification
```
mongosh
use <database_name>
db.users.find({role: "admin"}).pretty()
db.users.findOne({role: "admin"}, {password_hash: 1})
```
Verify: bcrypt hash starts with `$2b$`, and indexes exist on users.email (unique), login_attempts.identifier, login_attempts.email, password_reset_tokens.expires_at (TTL), password_reset_tokens.token_hash (unique), password_reset_requests.email, password_reset_requests.created_at (TTL).

## Step 2: API Testing
```
curl -c cookies.txt -X POST http://localhost:8001/api/auth/login -H "Content-Type: application/json" -d '{"email":"admin@example.com","password":"admin123"}'
cat cookies.txt
curl -b cookies.txt http://localhost:8001/api/auth/me
```
Login returns the user object and sets access_token + refresh_token cookies. /me returns same user using those cookies.

## Step 3: Password Reset
Set FRONTEND_URL="http://localhost:3000" in /app/backend/.env and restart backend to log reset link locally.
1. Register test account.
2. Enumeration parity: forgot-password for registered vs unregistered must be byte-identical.
3. Complete reset using link from backend log. New password logs in, old fails, reused link fails.
4. Throttle: 6 requests, only first 5 create token docs, all return generic 200.
5. Lockout clearance: fail login 5x, reset, then login with new password succeeds.
Restore real https FRONTEND_URL and restart when finished.
