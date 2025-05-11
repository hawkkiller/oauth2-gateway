#!/bin/bash

AUTH_URL="http://127.0.0.1:4444/oauth2/auth"
REDIRECT_URI="http://127.0.0.1:5555/callback" # This should be the redirect to your app; gateway handles this only for example purposes
CLIENT_ID="19c0216a-0b1a-4486-96a2-37ebc44d0339"
SCOPE="openid%20offline"

# Generate random state, codeChallenge and codeVerifier
# The app that authenticates with the gateway generates these
STATE=$(openssl rand -hex 16)
CODE_CHALLENGE=$(openssl rand -hex 32)
CODE_VERIFIER=$(openssl rand -hex 32)

# Generate auth URL
AUTH_URL="${AUTH_URL}?client_id=${CLIENT_ID}&response_type=code&scope=${SCOPE}&state=${STATE}&code_challenge=${CODE_CHALLENGE}&code_challenge_method=S256&redirect_uri=${REDIRECT_URI}"

echo "${AUTH_URL}"
