#!/bin/bash

# Configuration
AUTH_URL="http://auth.learny.local/api/oauth2/auth"
REDIRECT_URI="http://127.0.0.1:5555/callback" # Redirect to UI after login
CLIENT_ID="19c0216a-0b1a-4486-96a2-37ebc44d0339"
SCOPE="openid%20offline"

# Generate PKCE values
# These should be generated by the authenticating application
STATE=$(openssl rand -hex 16)
CODE_CHALLENGE=$(openssl rand -hex 32)
CODE_VERIFIER=$(openssl rand -hex 32)

# Construct OAuth2 authorization URL with PKCE
AUTH_URL="${AUTH_URL}?client_id=${CLIENT_ID}\
&response_type=code\
&scope=${SCOPE}\
&state=${STATE}\
&code_challenge=${CODE_CHALLENGE}\
&code_challenge_method=S256\
&prompt=login\
&redirect_uri=${REDIRECT_URI}"

# Output the generated URL
echo "${AUTH_URL}"
