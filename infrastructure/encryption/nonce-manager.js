const CLEANUP_AFTER_MINUTE = 1440;
//--------------------------------------------------------------

class NonceManager {
    constructor(cleanupIntervalMinute) {
        this.usedNonces = {};
        this.cleanupInterval = (cleanupIntervalMinute || CLEANUP_AFTER_MINUTE) * 60 * 1000; // interval in milliseconds
        setInterval(this.cleanupOldNonces.bind(this), this.cleanupInterval);
    }

    isNonceUsed(nonce) {
        return !!this.usedNonces[nonce];
    }

    markNonceAsUsed(nonce) {
        this.usedNonces[nonce] = Date.now();
    }

    verifyNonce(nonce) {
        if (this.isNonceUsed(nonce)) {
            return { status: false, error: 'Nonce Already Used' };
        }
        this.markNonceAsUsed(nonce);
        return { status: true, error: null }
    }

    cleanupOldNonces() {
        const currentTime = Date.now();
        for (const key in this.usedNonces) {
            if ((currentTime - this.usedNonces[key]) > this.cleanupInterval) {
                delete this.usedNonces[key]
            }
        }
    }
}
module.exports = NonceManager