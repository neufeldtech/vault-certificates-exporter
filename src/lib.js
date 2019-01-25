module.exports = function (vault) {
  const forge = require('node-forge')
  const pki = forge.pki
  let lib = {
    getMultipleCertificates(certificatesArray) {
      return new Promise((resolve, reject) => {
        // Promise.all(certificatesArray.map(vault.read()))
        Promise.all(certificatesArray.map((path) => this.readAndReturnMetadata(path)))
          .then((result) => {
            resolve(result)
          })
          .catch((err) => {
            console.log(err)
            reject(err)
          })
      })
    },
    readAndReturnMetadata(path) {
      return new Promise((resolve, reject) => {
        vault.read(path)
          .then((result) => {
            if (result.hasOwnProperty('vault_exporter')) {
              result.vault_exporter.path = path
            } else {
              result.vault_exporter = {}
              result.vault_exporter.path = path
            }
            resolve(result)
          })
          .catch((err) => {
            reject(err)
          })
      })
    },
    notBefore(cert) {
      let decoded = pki.certificateFromPem(cert)
      return new Date(decoded.validity.notBefore).valueOf() / 1000
    },
    notAfter(cert) {
      let decoded = pki.certificateFromPem(cert)
      return new Date(decoded.validity.notAfter).valueOf() / 1000
    }
  }
  return lib
}