const axios = require('axios');

async function generateVietQR(amount, content) {
  const bankId = process.env.VIETQR_BANK_ID;
  const accountNo = process.env.VIETQR_ACCOUNT_NO;
  const accountName = process.env.VIETQR_ACCOUNT_NAME;

  const response = await axios.post('https://api.vietqr.io/v2/generate', {
    accountNo,
    accountName,
    acqId: bankId,
    addInfo: content,
    amount,
    template: "compact2"
  });

  return response.data.data.qrDataURL;
}

module.exports = { generateVietQR };
