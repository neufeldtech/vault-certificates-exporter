const client = require('prom-client');
const Gauge = require('prom-client').Gauge
const express = require('express');
const server = express();
const port = process.env.PORT || 8080
const register = require('prom-client').register;

// Start Configurable options
var options = {
  apiVersion: 'v1', // default
  endpoint: process.env.VAULT_ADDR || 'http://127.0.0.1:8200',
  token: process.env.VAULT_TOKEN || '12345-67890-ABCDE-FGHIJ'
};
const vault = require('node-vault')(options)
let lib = require('./src/lib.js')(vault)
const certConfigsPath = process.env.VAULT_BASE_PATH || 'secret/letsencrypt/cert_configs'
const certConfigProperty = process.env.CERT_PROPERTY_NAME || 'certificate'
const metricPrefix = 'vault_certificates_'
// End configurable options

const upGauge = new Gauge({
  name: `${metricPrefix}up`,
  help: 'Whether the last scrape was successful'
});

const sealedGauge = new Gauge({
  name: `${metricPrefix}sealed`,
  help: 'Whether the vault is sealed or not'
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

function errorOut() {
  upGauge.set(0, new Date())
  notValidBeforeGauge.reset()
  notValidAfterGauge.reset()
}

function getCertificates() {
  return new Promise((resolve, reject) => {
    return vault.status()
      .then((status) => {
        if (status.sealed == true) {
          sealedGauge.set(1, new Date())
          errorOut()
          return reject('Vault is sealed')
        } else {
          sealedGauge.set(0, new Date())
        }
      })
      .then(() => {
        return vault.list(certConfigsPath)
      })
      .then((certificatesArray) => {
        let certList = certificatesArray.data.keys.map((cn) => { return `${certConfigsPath.replace(/\/$/, '')}/${cn}` })
        return lib.getMultipleCertificates(certList)
      })
      .then((certs) => {
        certs.forEach(configItem => {
          let certificatePem = configItem['data'][certConfigProperty]
          let cn = configItem.vault_exporter.path.split('/').reverse()[0]
          let vaultPath = configItem.vault_exporter.path
          let notValidBefore = lib.notBefore(certificatePem)
          let notValidAfter = lib.notAfter(certificatePem)
          notValidBeforeGauge.set({ 'cn': cn, 'path': vaultPath }, notValidBefore, new Date())
          notValidAfterGauge.set({ 'cn': cn, 'path': vaultPath }, notValidAfter, new Date())
          console.log(`Retrieved cert from vault: ${cn} notValidBefore: ${notValidBefore} notValidAfter: ${notValidAfter}`)
        })
        upGauge.set(1, new Date())
      })
      .then(() => resolve('done'))
      .catch((err) => {
        errorOut()
        reject(err)
      })
  })
}
server.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
})

server.get('/metrics', (req, res) => {
  // Need to reset this every time so that we remove certs that were deleted from vault
  notValidBeforeGauge.reset()
  notValidAfterGauge.reset()
  getCertificates()
    .then(() => {
      res.set('Content-Type', register.contentType);
      res.end(register.metrics());
    })
    .catch((err) => {
      res.set('Content-Type', register.contentType);
      res.status(500).end(register.metrics());
      console.log(`Failed to scrape vault: ${err}`)
    })
  // Attempt to renew the token, but it's fine if it didn't work
  vault.tokenRenewSelf()
    .then(() => console.log('Successfully renewed vault token'))  
    .catch((err) => { console.log(err)})
})

console.log(`Server listening on... ${port}`)
server.listen(port)