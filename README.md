OAuth2 Client
    │ 1.  /oauth2/auth?client_id…             (Hydra public :4444)
    ▼
Hydra public
    │ 2. 302 → urls.login  
    │     /login?login_challenge=XYZ
    ▼
Auth Gateway
    │ 3. XHR → Kratos /self-service/login/browser (GET login flow) 
    │ 4. XHR → Kratos /self-service/login (PUT email)
    │ 5. XHR → Kratos /self-service/login (PUT code)
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
