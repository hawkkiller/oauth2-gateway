OAuth2 Client
    │ 1.  /oauth2/auth?client_id…             (Hydra public :4444)
    ▼
Hydra public
    │ 2. 302 → urls.login  
    │     /self-service/login/browser?login_challenge=XYZ
    ▼
Kratos public
    │ 3. 302 → ui_url  
    │     /login?flow=ABC&login_challenge=XYZ
    ▼
Login UI (React/Next)
    │ 4. XHR → Kratos /self-service/login/flows?id=ABC  
    │ 5. XHR → Kratos /self-service/login?flow=ABC (POST creds)
    ▼
Kratos public
    │ 6. GET  → Hydra admin /requests/login?login_challenge=XYZ  
    │ 7. PUT  → Hydra admin /requests/login/accept …subject=⟨id⟩  
    │ 8. 302 → redirect_to (from Hydra)  
    ▼
Hydra public
    │ 9. /oauth2/auth?login_verifier=…  
    │10. 302 → client redirect_uri?code=…&state=…
    ▼
OAuth2 Client
    │11. Browser lands on redirect_uri with auth code
