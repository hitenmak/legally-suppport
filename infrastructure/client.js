const axios = require('axios');

//--------------------------------------------------------------
class Client {
    static async callRequest(url, method, payload = {}, headers = {}) {
        const resultFormat = (result) => {
            result = result || {};
            const isSuccess = result.status === 200;
            return {
                status: isSuccess,
                data: isSuccess ? result.data || {} : {},
                message: isSuccess ? 'Success!' : 'Fail!',
                statusCode: result.status || 0,
                info: {
                    url,
                    method,
                    headers,
                    payload,
                    error: !isSuccess ? result.data || {} : null,
                }
            }
        }

        try {
            const result = await axios({
                method: method.toLowerCase(),
                url,
                headers,
                data: payload,
            });

            return resultFormat(result);

        } catch (e) {
            return resultFormat(e.response);

        }
    }

    static async get(url, payload = {}, headers = {}) {
        return await this.callRequest(url, 'GET', payload, headers)
    }


    static async post(url, payload = {}, headers = {}) {
        return await this.callRequest(url, 'POST', payload, headers)
    }
}

module.exports = Client;
