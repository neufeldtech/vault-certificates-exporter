# Vault Certificates Exporter

A Prometheus exporter to report on X509 Certificate metrics stored in Hashicorp Vault

## About the project

So you've built some automation around [Let's Encrypt](https://letsencrypt.org/) certificates and you store them in [Vault](https://www.hashicorp.com/products/vault/). How are you ensuring that your automation is working correctly and that your certificates in Vault are not silently expiring?

 This Prometheus exporter can read certificates that are stored in vault, and will expose metrics about their issuance and expiry time, so that you can visualize/alert on your certificate validity.

## Prerequisites

This assumes that you already have the following available

- A Vault server
- A Vault token that has `read` and `list` access to the `VAULT_BASE_PATH` path in vault
- At least one certificate stored in Vault at `VAULT_BASE_PATH` with the attribute `CERT_PROPERTY_NAME` containing the value of the certificate
- [Node.js](https://nodejs.org/) v6 or higher

## Config Options

Some configuration is exposed through environment variables

| Environment Variable | Description                                                                                              | Default                         |
|----------------------|----------------------------------------------------------------------------------------------------------|---------------------------------|
| PORT                 | Port to run the exporter on                                                                              | 8080                            |
| VAULT_ADDR           | A URI containing the protocol, host, port, and path to your vault server                                 | http://127.0.0.1:8200           |
| VAULT_BASE_PATH      | A string indicating the vault path in which your certificates are stored                                 | secret/letsencrypt/cert_configs |
| VAULT_TOKEN          | A vault token that has read access to your VAULT_BASE_PATH/*                                             | 12345-67890-ABCDE-FGHIJ         |
| CERT_PROPERTY_NAME   | The name of the vault property/attribute that contains the PEM certificate you wish to expose data about | certificate                     |

## Usage

```
# Set any environment variables you need...
export VAULT_TOKEN=iamgroot

$ npm install
$ node index.js
```

After the app is running, you can view it at http://localhost:8080/metrics, where you will see the Prometheus metrics exposed:

```
# HELP vault_certificates_up Whether the last scrape was successful
# TYPE vault_certificates_up gauge
vault_certificates_up 1

# HELP vault_certificates_not_valid_before Epoch time (in seconds) of which a certificate not valid before
# TYPE vault_certificates_not_valid_before gauge
vault_certificates_not_valid_before{cn="gitlab.example.com",path="secret/letsencrypt/cert_configs/gitlab.example.com"} 1544200231 1547668348421

# HELP vault_certificates_not_valid_after Epoch time (in seconds) of which a certificate not valid after
# TYPE vault_certificates_not_valid_after gauge
vault_certificates_not_valid_after{cn="gitlab.example.com",path="secret/letsencrypt/cert_configs/gitlab.example.com"} 1551976231 1547668348421
```

## Vault Data Model

All of your certificates in Vault should be stored under a common path. This path should not have other keys stored in it, as this app will assume that all keys under this path will be certificates.

For example, you might have each of your certificates under the common path `secret/letsencrypt/cert_configs`

```
$ vault list secret/letsencrypt/cert_configs/
Keys
----
gitlab.example.com
jenkins.example.com
```

Each certificate in Vault can have any number of properties attached to it, but it is required to have at least one property that is the same name as your configured `CERT_PROPERTY_NAME`.

For example, you might have the following certificate in Vault:

```
$ vault read -format=json secret/letsencrypt/cert_configs/gitlab.example.com
{
  "request_id": "1f0726bb-f606-7758-ed37-a35a73c14732",
  "lease_id": "",
  "lease_duration": 2764800,
  "renewable": false,
  "data": {
    "certificate": "-----BEGIN CERTIFICATE-----\nMIIEHzCCA4igAwIBAgIFAC.......vcNAQELBQAwPTELMAkGA1UEBhM\n-----END CERTIFICATE-----",
    "chain": "-----BEGIN CERTIFICATE-----\nMIIEHzCCA4igAwIBAgIFAC.......vcNAQELBQAwPTELMAkGA1UEBhM\n-----END CERTIFICATE-----",
    "private_key": "-----BEGIN RSA PRIVATE KEY-----\nnMIIEHzCCA4igAwIBAgIFAC...nMIIEHzCCA4igAwIBAgIFAC\n-----END RSA PRIVATE KEY-----\n"
  },
  "warnings": null
}
```

In the above case, you would set the `CERT_PROPERTY_NAME` environment variable to `certificate`, since this is the field where your certificate lives within the certificate Vault object.

## Vault Setup

### Create Policy

Create a policy with read and list access to your `VAULT_BASE_PATH` path.

1) Write the policy hcl config file

```
$ cat letsencrypt-policy-ro.hcl
path "secret/letsencrypt/cert_configs/*" {
  capabilities = [ "read", "list" ]
}
```

2) Create the policy

```
$ vault policy write letsencrypt-policy-ro ./letsencrypt-policy-ro.hcl
```

3) Get a token with the new policy

```
$ vault token create -renewable=true -policy=letsencrypt-policy-ro
Key                  Value
---                  -----
token                LASKDFKDJSFHASDFJHSDIFHJUDAFJS
token_accessor       SDKFJHSJWEHRKSUDFd2WG1F3HOZiiH
token_duration       768h
token_renewable      true
token_policies       ["default" "letsencrypt-policy-ro"]
identity_policies    []
policies             ["default" "letsencrypt-policy-ro"]

```

You will use the value in the `token` field for your `VAULT_TOKEN`

## Docker

### Building Docker image:

```
$ docker build . -t my_vault_exporter:latest
```

### Running Docker image:

```
$ docker run -p 8080:8080 -d -e VAULT_ADDR=http://1.2.3.4:8200 -e VAULT_TOKEN=12345-67890-ABCDE-FGHIJ --rm my_vault_exporter:latest
```