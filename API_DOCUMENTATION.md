# Authentication API Documentation

## Overview
This API provides comprehensive authentication with multi-device session management and Two-Factor Authentication (2FA).

**Architecture**: Stateless JWT with session validation
**Session Storage**: MongoDB with automatic expiry
**2FA**: Email-based OTP verification

## Authentication Endpoints

### 1. User Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response (No 2FA)**:
```json
{
  "requiresTwoFactor": false,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "userId",
    "email": "user@example.com",
    "name": "User Name"
  }
}
```

**Response (2FA Enabled)**:
```json
{
  "requiresTwoFactor": true,
  "sessionId": "sess_1234567890_abc123",
  "message": "2FA code sent to your email"
}
```

### 2. Verify 2FA
```http
POST /auth/verify-2fa
Content-Type: application/json

{
  "sessionId": "sess_1234567890_abc123",
  "otp": "123456"
}
```

**Response**:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "userId",
    "email": "user@example.com",
    "name": "User Name"
  }
}
```

### 3. Toggle 2FA (Enable/Disable)
```http
POST /auth/toggle-2fa
Authorization: Bearer <token>
Content-Type: application/json

{
  "otp": "123456"
}
```

**Response**:
```json
{
  "twoFactorEnabled": true,
  "message": "2FA enabled successfully"
}
```

## Session Management Endpoints

### 4. Get Active Sessions
```http
GET /auth/sessions
Authorization: Bearer <token>
```

**Response**:
```json
[
  {
    "sessionId": "sess_1234567890_abc123",
    "deviceInfo": "Chrome on Windows",
    "ipAddress": "192.168.1.100",
    "lastAccessedAt": "2024-01-15T10:30:00Z",
    "createdAt": "2024-01-15T09:00:00Z"
  }
]
```

### 5. Logout Current Device
```http
POST /auth/logout
Authorization: Bearer <token>
```

**Response**:
```json
{
  "message": "Logged out successfully"
}
```

### 6. Logout All Devices
```http
POST /auth/logout-all
Authorization: Bearer <token>
```

**Response**:
```json
{
  "message": "Logged out from all devices"
}
```

### 7. Logout Specific Device
```http
DELETE /auth/sessions/:sessionId
Authorization: Bearer <token>
```

**Response**:
```json
{
  "message": "Logged out successfully"
}
```

## Authentication Headers

For protected routes, include the JWT token in the Authorization header:
```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Device Information

When logging in, you can optionally include device information in headers:
```http
X-Device-Info: Chrome on Windows 11
```

## Error Responses

**401 Unauthorized**:
```json
{
  "statusCode": 401,
  "message": "Invalid credentials",
  "error": "Unauthorized"
}
```

**400 Bad Request**:
```json
{
  "statusCode": 400,
  "message": ["email must be an email"],
  "error": "Bad Request"
}
```

## Security Features

1. **Session Validation**: Every request validates the session is active
2. **Automatic Expiry**: Sessions expire after 7 days of inactivity
3. **Multi-Device Support**: Users can be logged in on multiple devices
4. **2FA Protection**: Optional email-based two-factor authentication
5. **Device Tracking**: Track login devices and IP addresses
6. **Session Management**: Users can view and terminate specific sessions

## Usage with Guards

Use `JwtAuthGuard` to protect routes:

```typescript
@UseGuards(JwtAuthGuard)
@Get('protected')
async getProtectedData(@CurrentUser() user: any) {
  return { userId: user.userId, email: user.email };
}
```