const crypto = require('crypto');

const Encrypt = require('./encrypt');
const NonceManager = require('./nonce-manager');

const ALGORITHM = 'RSA-SHA256';
const nonceManager = new NonceManager();
//--------------------------------------------------------------

class Sign {
    // Helpers
    static sortKeys(obj) {
        return Object.fromEntries(
            Object.entries(obj).sort(([keyA], [keyB]) => keyA.localeCompare(keyB))
        );
    }
    // Helpers

    // Sign
    static sign(payload, privateKey) {
        try {
            const sign = crypto.createSign(ALGORITHM);
            sign.update(JSON.stringify(payload));
            const signData = sign.sign(privateKey, 'base64');
            if (!signData) {
                return { data: null, error: 'SIGN - sign is not generated' };
            }
            return { data: signData };
        } catch (e) {
            return { data: null, error: 'SIGN - sign is not generated' };
        }
    }

    static verifySign(payload, signature, publicKey) {
        try {
            const verify = crypto.createVerify(ALGORITHM);
            verify.update(JSON.stringify(payload));
            const isValid = verify.verify(publicKey, signature, 'base64')
            if (!isValid) {
                return { status: false, error: 'VERIFY SIGN - key are invalid or invalid sign' };
            }
            return { status: true };
        } catch (e) {
            return { status: false, error: 'VERIFY SIGN - key are invalid or invalid sign' }
        }
    }
    // Sign

    // Sign Payload
    static signPayload(payload, privateKey) {
        try {
            const signPayload = this.sortKeys({
                appId: payload.appId,
                nonce: payload.nonce,
                recvWindow: payload.recvWindow,
                timestamp: payload.timestamp,
            });
            return this.sign(signPayload, privateKey);
        } catch (e) {
            return { data: null, error: 'SIGN PAYLOAD - sign payload not generated' };
        }
    }

    static verifySignPayload(signPayload, signature, publicKey) {
        try {
            const verificationPayload = this.sortKeys({
                appId: signPayload.appId,
                nonce: signPayload.nonce,
                recvWindow: signPayload.recvWindow,
                timestamp: signPayload.timestamp,
            });

            const verifySign = this.verifySign(verificationPayload, signature, publicKey);
            if (verifySign?.error) {
                return verifySign;
            }

            // verify receiving window
            if ((Date.now() - (+signPayload.timestamp)) > (+signPayload.recvWindow)) {
                return { status: false, error: 'Signature Expired' };
            }

            // verify nonce
            const nonceRes = nonceManager.verifyNonce(signPayload.nonce);
            if (nonceRes.error) {
                return nonceRes;
            }

            return { status: true };
        } catch (e) {
            return { status: false, error: 'VERIFY SIGN PAYLOAD - some keys are invalid or invalid sign' };
        }
    }
    // Sign Payload

    // Encrypted Sign Payload
    static signPayloadEncrypted(payload, signPrivateKey, encryptionKey) {
        try {
            const sign = this.signPayload(payload, signPrivateKey);
            if (sign.error) {
                return { data: null, error: sign.error };
            }
            const encryptedSign = Encrypt.encrypt(sign.data, encryptionKey);
            if (!encryptedSign) {
                return { data: null, error: 'SIGN PAYLOAD ENCRYPTED - encrypted sign payload not generated' };
            }
            return { data: encryptedSign };
        } catch (e) {
            return { data: null, error: 'SIGN PAYLOAD ENCRYPTED - encrypted sign payload not generated' };
        }
    }

    static verifyEncryptedSignPayload(signPayload, encryptedSignature, signPublicKey, encryptionKey) {
        try {
            const signature = Encrypt.decrypt(encryptedSignature, encryptionKey);
            if (!signature) {
                return { status: false, error: 'VERIFY ENCRYPTED SIGN PAYLOAD - signature is not decrypted' };
            }
            return this.verifySignPayload(signPayload, signature, signPublicKey);
        } catch (e) {
            return { status: false, error: 'VERIFY ENCRYPTED SIGN PAYLOAD - some keys are invalid or invalid sign' }
        }
    }
    // Encrypted Sign Payload
}
module.exports = Sign