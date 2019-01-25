const chai = require('chai')
const expect = chai.expect
const chaiSubset = require('chai-subset')
chai.use(chaiSubset)
const mock = require('mock-require')
const certs = {
  'gitlab.example.com': '-----BEGIN CERTIFICATE-----\nMIIDkjCCAnoCCQCXHtXs4NYH9TANBgkqhkiG9w0BAQUFADCBijEbMBkGA1UEAwwS\nZ2l0bGFiLmV4YW1wbGUuY29tMRgwFgYDVQQKDA9leGFtcGxlIGNvbXBhbnkxEDAO\nBgNVBAcMB2V4YW1wbGUxEDAOBgNVBAgMB0FsYWJhbWExCzAJBgNVBAYTAlVTMSAw\nHgYJKoZIhvcNAQkBFhFnaXRsYWJAZXhhbXBsZS5vbTAeFw0xOTAxMjIyMTI1MTda\nFw0yMDAxMjIyMTI1MTdaMIGKMRswGQYDVQQDDBJnaXRsYWIuZXhhbXBsZS5jb20x\nGDAWBgNVBAoMD2V4YW1wbGUgY29tcGFueTEQMA4GA1UEBwwHZXhhbXBsZTEQMA4G\nA1UECAwHQWxhYmFtYTELMAkGA1UEBhMCVVMxIDAeBgkqhkiG9w0BCQEWEWdpdGxh\nYkBleGFtcGxlLm9tMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA7aS6\n17MLqXmpdSFSa1hgrY1Jl3VEols1CMoC3TuYDIpUDON7U/oBo7jPffHqk8jBvhZ3\n6RfzupVoZM4BqBQd1AimoPC/N3sfE+DdgzTUzMM2cb/xX/Nz6s0IKjkoEZ+vnJmo\nEuOReLr2tLot3lMS3NsZsSvY8eoK22W1kXBG3EOQ2zwu1rlgBM9hAWIyD+Xj10Qs\nQYswXae6I/autiOI7zT4CUHTEFlvG3DB9D2uUIBfj/lzjNYJ0a7aJTowzz3qXbkY\n+z6+FR1y9lTUSLvBFHP1uBNNGNi6XS71lwqpajv/dRKGWI+jlldeKZ/mFTnX8Ygu\nqskKPW8z2koieQQUKQIDAQABMA0GCSqGSIb3DQEBBQUAA4IBAQBrxHgKqmIbuccz\naks8MD5T4EP2NGpogLZ5Wp8O4qi6QeZZTnuisYTuJvAUkF2XaN7cTpDgfZK1gJyz\nhxifJ7+poLT4WUgiBTB9p+IRdU8NBpk5rvr0fVg8Evd7sbjuKRRuMaqw2f/7X1Ni\nMOGBu1FGnzbvjQaCn3Z9OcFqY6gzfbWTBlf6Qz4dduoLOHEBZoGJUTHBRiPhGYQ4\nIsYAJI92WZI6ZdnMRisES+vr2ls9RaYgdsOyOV3nCEM/1CtDZhvbHUv3JHtuqAkr\n9Whs8eX7STYT73Ub7JQt9hc2bCd6iRJcBllJmHjTWLNtr6QUOz+vpZl2Qd/8KyyW\nUafi+XbY\n-----END CERTIFICATE-----',
  'github.example.com': '-----BEGIN CERTIFICATE-----\nMIIDlDCCAnwCCQCbXVhuVMrORDANBgkqhkiG9w0BAQUFADCBizEbMBkGA1UEAwwS\nZ2l0aHViLmV4YW1wbGUuY29tMRgwFgYDVQQKDA9leGFtcGxlIGNvbXBhbnkxEDAO\nBgNVBAcMB2V4YW1wbGUxEDAOBgNVBAgMB0FsYWJhbWExCzAJBgNVBAYTAlVTMSEw\nHwYJKoZIhvcNAQkBFhJleGFtcGxlQGV4YW1wbGUub20wHhcNMTkwMTIyMjEyMzU1\nWhcNMjAwMTIyMjEyMzU1WjCBizEbMBkGA1UEAwwSZ2l0aHViLmV4YW1wbGUuY29t\nMRgwFgYDVQQKDA9leGFtcGxlIGNvbXBhbnkxEDAOBgNVBAcMB2V4YW1wbGUxEDAO\nBgNVBAgMB0FsYWJhbWExCzAJBgNVBAYTAlVTMSEwHwYJKoZIhvcNAQkBFhJleGFt\ncGxlQGV4YW1wbGUub20wggEiMA0GCSqGSIb3DQEBAQUAA4IBDwAwggEKAoIBAQC2\nwILtUBnW5X8UMVpIBEXHk3W4u0sVZmve1UrU4bwBjoTVtQ/TdtDjCYUdnD5mfGXU\naz9TJ/XYfxJ8ZRxaRUrzKLl/jJTOd1VkOHmoamWl9ejUJG4B5zC12b9tazU7ISVE\nmvMfhISBR5QYjEapLeIPsJpzrbmENom+TW/FbIllkvdTEDPicqbAF+dG3Fqjj/Vr\nadcjwf2V8thtvt6CEG8+Fnpf/o8CiUQ+QpN4BC5jsmV2jOu05YPmFMJP2XWBfdtD\nw1RVznoT2PEBcYCFfrZyJ3kvdNszjdJk7na2n8wc5j4eVtQnd0QvqsGejwSXYY2h\ncFHFPz4oJeOAdsKXOpOfAgMBAAEwDQYJKoZIhvcNAQEFBQADggEBAEAeQH8+TKyy\n+pbnSpaIX0U6IhendqmPCP0dsEj6O9vZPY03cklHyIdFPZkXduq66pxabCa//H4s\n+xNR1YT33N8JBcW+OsOxyj/n3iaG+1R1X3llrlB5wZ7/2bCp+qWpfFQWHyc3Vub/\nxuYMdaLQ2bB1uhHbzpr4ZKEeUHMLXYNwg0N21pwkkNNU3ggR14yzZePEHRekvypS\nZH00dV0LGQtpCw9Swqh9IhBcNMOSI+9KRCmIxuRwPJ5iB4fNIuic3Wh7Bd0dHa1W\nxPPcd1f23Nsni+0vHKbxwGbdo6I5ekwvi6lBVTiDQs3fIJyFxzO/OPFnquHHDrvL\nM5AkB+nbxPU=\n-----END CERTIFICATE-----'
}

const CERT_PROPERTY_NAME = 'cert_data'
const VAULT_ADDR = 'http://vault.example.com:8200'
const VAULT_BASE_PATH = 'secret/certificates'
const VAULT_TOKEN = 'FOOOOOOOOOOO'

var options = {
  apiVersion: 'v1', // default
  endpoint: VAULT_ADDR,
  token: VAULT_TOKEN
};

describe('Helper Library', () => {
  describe('.getMultipleCertificates', () => {
    before(() => {
      mock('node-vault', {
        read: (path) => {
          return new Promise((resolve, reject) => {
            if (VAULT_BASE_PATH == (path.split('/').slice(0, -1).join('/'))) {
              let certName = path.split('/').reverse()[0]
              let response = {
                request_id: 'c17146f2-0e07-3905-b35e-29fb11fc16d3',
                lease_id: certName,
                renewable: false,
                lease_duration: 2764800,
                data: {},
                wrap_info: null,
                warnings: null,
                auth: null
              }
              response.data[CERT_PROPERTY_NAME] = certs[certName] 
              resolve(response)
            } else {
              reject(`Vault key not found at ${path}`)
            }
          })
        }
      })
    })
    it('should return an array of certs from vault', () => {
      let vault = require('node-vault')
      let lib = require('../src/lib.js')(vault)
      return lib.getMultipleCertificates([`${VAULT_BASE_PATH}/gitlab.example.com`, `${VAULT_BASE_PATH}/github.example.com`])
        .then((result) => {
          expect(result.length).to.equal(2)
          expect(result).to.be.an('array').to.containSubset([
            {
              lease_id: 'github.example.com',
              data: {
                cert_data: certs['github.example.com']
              }
            },
            {
              lease_id: 'gitlab.example.com',
              data: {
                cert_data: certs['gitlab.example.com']
              }
            }
          ])
        })
    })
  })
  describe('.readAndReturnMetadata', () => {
    before(() => {
      mock('node-vault', {
        read: (path) => {
          return new Promise((resolve, reject) => {
            let response = {
              request_id: 1234,
              data: {
                'some': 'data'
              }
            }
            resolve(response)
          })
        }
      })
    })
    it('should inject the original vault request path into the response', () => {
      let vault = require('node-vault')
      let lib = require('../src/lib.js')(vault)
      return lib.readAndReturnMetadata('some/vault/path')
        .then((result) => {
          expect(result.vault_exporter.path).to.equal('some/vault/path')
          expect(result.data.some).to.equal('data')
        })
    })
  })
  describe('.notBefore', () => {
    it('should return value of notBefore property of certificate', () => {
      let vault = require('node-vault')
      let lib = require('../src/lib.js')(vault)
      let notBefore = lib.notBefore(certs['gitlab.example.com'])
      expect(notBefore).to.equal(1548192317)
    })
  })
  describe('.notAfter', () => {
    it('should return value of notAfter property of certificate', () => {
      let vault = require('node-vault')
      let lib = require('../src/lib.js')(vault)
      let notAfter = lib.notAfter(certs['gitlab.example.com'])
      expect(notAfter).to.equal(1579728317)
    })
  })
})