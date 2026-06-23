const axios = require('axios');

async function createTempMail() {
    const domainRes = await axios.get('https://api.mail.tm/domains');
    const domain = domainRes.data['hydra:member'][0].domain;

    const email = `test${Date.now()}@${domain}`;
    const password = 'Test@1234';

    await axios.post('https://api.mail.tm/accounts', {
        address: email,
        password: password
    });

    const tokenRes = await axios.post('https://api.mail.tm/token', {
        address: email,
        password: password
    });

    return {
        email,
        password,
        token: tokenRes.data.token
    };
}

async function getOtp(token) {
    const headers = { Authorization: `Bearer ${token}` };

    for (let i = 0; i < 10; i++) {
        const res = await axios.get('https://api.mail.tm/messages', { headers });

        const messages = res.data['hydra:member'];

        if (messages.length > 0) {
            const id = messages[0].id;

            const msg = await axios.get(
                `https://api.mail.tm/messages/${id}`,
                { headers }
            );

            const text = msg.data.text || msg.data.html;

            const otp = text.match(/\b\d{6}\b/)[0];
            return otp;
        }

        await new Promise(r => setTimeout(r, 3000));
    }

    throw new Error('OTP not received');
}

module.exports = { createTempMail, getOtp };