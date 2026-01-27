const Sign = require('./sign');
const Encrypt = require('./encrypt');
// d(crypto.generateKeyPairSync('rsa', {modulusLength: 2048, publicKeyEncoding: { type: 'spki', format: 'pem' }, privateKeyEncoding: { type: 'pkcs8', format: 'pem' }}))
//--------------------------------------------------------------

class EncryptRequest {
    static create(payload) {
        try {
            const { signData, bodyData, signPrivateKey, encryptionKey, encryptionPublicKey } = payload;

            const sign = Sign.signPayloadEncrypted(signData, signPrivateKey, encryptionKey);
            if (sign?.error) {
                return { error: 'Sign Not Generated' };
            }

            const data = Encrypt.encryptRSA(bodyData, encryptionPublicKey);
            if (!data) {
                return { error: 'Data Not Encrypted' };
            }

            return { sign: sign.data, data };
        } catch (e) {
            return { error: 'ENCRYPT REQUEST - data not created' };
        }
    }

    static verify(payload) {
        try {
            const { encryptedData, encryptedSign, appId, signPublicKey, encryptionKey, encryptionPrivateKey } = payload;

            const decryptedData = Encrypt.decryptRSA(encryptedData, encryptionPrivateKey);
            if (!decryptedData) {
                return { error: 'Body Not Decrypted' };
            }

            const verifiedSign = Sign.verifyEncryptedSignPayload({ ...decryptedData, appId }, encryptedSign, signPublicKey, encryptionKey);
            if (verifiedSign?.error) {
                return { error: verifiedSign?.error };
            }

            return decryptedData;
        } catch (e) {
            return { error: 'ENCRYPT REQUEST VERIFY - some keys are invalid or invalid sign' }
        }
    }
}
module.exports = EncryptRequest;