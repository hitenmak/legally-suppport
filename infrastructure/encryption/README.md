private key used for generate sign
public key used for verify sign
https://it-tools.tech/rsa-key-pair-generator


___________________________________________
--- ENCRYPTION & SIGN ---
___________________________________________

___________________________________________
-- GENERATE KEYS -- 14 keys
    ..........................................
    #ApiToken (2)
        : use for basic authentication

    - generate two random string 100 char key (AA-API-TOKEN, AB-API-TOKEN) 
    - (Prefix: BTx..., ATx...)
    - wallet server: (AA-API-TOKEN && AB-API-TOKEN)
        AA-API-TOKEN -> send request
        received request -> AB-API-TOKEN verify

    - api server: (AB-API-TOKEN && AA-API-TOKEN)
        AB-API-TOKEN -> send request
        received request -> AA-API-TOKEN verify


    ..........................................
    #AppId (2)
        : used for generate signature

    - generate two random string 150 char key (AA-APP-ID, AB-APP-ID)
    - (Prefix: BAx..., AAx...)
    - wallet server: (AA-APP-ID)
        AA-APP-ID add in generate sign -> send request
        received request -> AB-APP-ID add in verify sign

    - api server: (AB-APP-ID)
        AB-APP-ID add in generate sign -> send request
        received request -> AA-APP-ID add in verify sign


    ..........................................
    #ApiKey (2)
        : used for encryption signature

    - generate two random string 200 char key (AA-API-KEY, AB-API-KEY)
    - (Prefix: BKx..., AKx...)
    - wallet server: (AA-API-KEY)
        AA-API-KEY encrypt signature -> send request
        received request -> AB-API-KEY decrypt signature

    - api server: (AB-API-KEY)
        AB-API-KEY encrypt signature -> send request
        received request -> AA-API-KEY decrypt signature


    ..........................................
    #Sign (2x2)
        : usd for generate signature

    - generate two RSA key pair (16384 bits) (SA-PRIVATE-KEY, SA-PUBLIC-KEY) (SB-PRIVATE-KEY, SB-PUBLIC-KEY)
    - wallet server: (SA-PRIVATE-KEY && SB-PUBLIC-KEY)
            generate sign using SA-PRIVATE-KEY -> send request
            received request -> verify sign using SB-PUBLIC-KEY

    - api server: (SB-PRIVATE-KEY && SA-PUBLIC-KEY)
            generate sign using SB-PRIVATE-KEY -> send request
            received request -> verify sign using SA-PUBLIC-KEY

    ..........................................
    #Encryption (2x2)
        : used for body encryption

    - generate two RSA key pair (16384 bits) (EA-PUBLIC-KEY, EA-PRIVATE-KEY) (EB-PUBLIC-KEY, EB-PRIVATE-KEY)
    - wallet server: (EA-PUBLIC-KEY && EB-PRIVATE-KEY)
            encrypt sign/data using EA-PUBLIC-KEY -> send request
            received request -> decrypt sign/data using EB-PRIVATE-KEY

    - api server: (EB-PUBLIC-KEY && EA-PRIVATE-KEY)
            encrypt sign/data using EB-PUBLIC-KEY -> send request
            received request -> decrypt sign/data using EA-PRIVATE-KEY



___________________________________________
-- SEND REQUEST --
    - prepare payload
        1: prepare sign payload sorted to a-z {appId: AA-APP-ID, nonce, recvWindow, timestamp}
        2: prepare body with required params {nonce, recvWindow, timestamp, ...}
        :payload is ready

    - generate sign
        3: generate sign with SA-PRIVATE-KEY
        4: encrypt generated sign with AA-API-KEY
        :signature is ready

    - encrypt body
        5: encrypt body with EA-PUBLIC-KEY
        :body is ready

    - send request
        6: set headers {sign: 'encrypted sign', token: AA-API-TOKEN}
        7: set body {data: 'encrypted body data'}
        : request sent

___________________________________________
-- RECEIVED REQUEST --
    - verify token
        1: verify token in header with AB-API-TOKEN

    - decrypt body
        2: decrypt body data using EB-PRIVATE-KEY
        :body is decrypted

    - verify sign
        3: decrypt sign using AB-API-KEY
        4: verify sign using SB-PUBLIC-KEY {appId: AB-APP-ID, nonce, recvWindow, timestamp}
        : sign is verified

    - validation sign
        5: check recvWindow timestamp is expired or not
        6: check nonce is not used
        :request received


___________________________________________
___________________________________________