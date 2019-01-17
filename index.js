const client = require('prom-client');
const Gauge = require('prom-client').Gauge
const express = require('express');
const server = express();
const port = process.env.PORT || 8080
const register = require('prom-client').register;
const vault = require('node-vault')(options)
const forge = require('node-forge')
const pki = forge.pki

// Start Configurable options
var options = {
  apiVersion: 'v1', // default
  endpoint: process.env.VAULT_ADDR || 'http://127.0.0.1:8200',
  token: process.env.VAULT_TOKEN || '12345-67890-ABCDE-FGHIJ'
};
const certConfigsPath = process.env.VAULT_BASE_PATH || 'secret/letsencrypt/cert_configs'
const certConfigProperty = process.env.CERT_PROPERTY_NAME || 'certificate'
const metricPrefix = 'vault_certificates_'
// End configurable options

const upGauge = new Gauge({
  name: `${metricPrefix}up`,
  help: 'Whether the last scrape was successful'
});

const notValidBeforeGauge = new Gauge({
  name: `${metricPrefix}not_valid_before`,
  help: 'Epoch time (in seconds) of which a certificate not valid before',
  labelNames: ['cn', 'path']
});

const notValidAfterGauge = new Gauge({
  name: `${metricPrefix}not_valid_after`,
  help: 'Epoch time (in seconds) of which a certificate not valid after',
  labelNames: ['cn', 'path']
});


function getCertificates() {
  return new Promise((resolve, reject) => {
    vault.list(certConfigsPath)
      .then((configs) => {
        configs.data.keys.forEach(cn => {
          var vaultPath = `${certConfigsPath}/${cn}`
          vault.read(vaultPath)
            .then((configItem) => {
              var decodedCertificate = pki.certificateFromPem(configItem.data[certConfigProperty])
              var notValidBefore = new Date(decodedCertificate.validity.notBefore).valueOf() / 1000
              var notValidAfter = new Date(decodedCertificate.validity.notAfter).valueOf() / 1000
              console.log(`Retrieved cert from vault: ${cn} notValidBefore: ${notValidBefore} notValidAfter: ${notValidAfter}`)
              notValidBeforeGauge.set({ 'cn': cn, 'path': vaultPath }, notValidBefore, new Date())
              notValidAfterGauge.set({ 'cn': cn, 'path': vaultPath }, notValidAfter, new Date())
            })
        });
        upGauge.set(1)
        resolve()
      })
      .then(() => {
        vault.tokenRenewSelf()
        .catch((err) => console.log(`Error renewing Vault token: ${err}`))
      })
      .catch((err) => {
        upGauge.set(0)
        notValidBeforeGauge.reset()
        notValidAfterGauge.reset()
        reject(err)
      })
  })
}

server.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
})

server.get('/metrics', (req, res) => {
  // register.clear()
  getCertificates()
  .then(() => {
    res.set('Content-Type', register.contentType);
    res.end(register.metrics());
  })
  .catch((err) => {
    res.set('Content-Type', register.contentType);
    res.status(500).end(register.metrics());
    console.log(`Failed to scrape vault: ${err}`)
  }
  )
})

// Initialize the getCertificates call once
getCertificates().catch((err) => console.log(`Failed to scrape vault: ${err}`))


console.log(`Server listening on... ${port}`)
server.listen(port)