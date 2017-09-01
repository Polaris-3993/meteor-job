author: Ivan Cherviakov <cherviakov.ivan@gmail.com>

Workflow:
Client app authorize and obtain token data. Token data saved locally. With token data name, email and id obtained (or maybe we should decode id_token?).
After this id ,clientAppId and user email sent to server and go through verification code by node google-auth-library. Server generate random token, save 
it with clientAppId in user data. Then send to client app, so client app send every request with this token verifying it is still authorized by same user.
If new user arrive with same clientAppId token data deleted and generated as result of new authentication. ClientAppIds may be lost so if last use of such
id happened more than 6 month ago id with all info related to it (like token) deleted.

Questions:
1. Offline workOffline
