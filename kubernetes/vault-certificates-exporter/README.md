# Vault Certificates Exporter Helm Chart

Prometheus exporter for X509 certificates stored in Hashicorp Vault

Learn more: https://github.com/neufeldtech/vault-certificates-exporter 

## TL;DR;


## Introduction

This chart creates a Vault-Certificates-Exporter deployment on a [Kubernetes](http://kubernetes.io)
cluster using the [Helm](https://helm.sh) package manager.

## Installing the Chart

To install the chart with the release name `my-release`:

```
$ git clone https://github.com/neufeldtech/vault-certificates-exporter.git
$ cd vault-certificates-exporter/kubernetes
$ helm install -f ./vault-certificates-exporter/values.yaml ./vault-certificates-exporter --name my-release
```

The command deploys Vault-Certificates-Exporter on the Kubernetes cluster using the default configuration. The [configuration](#configuration) section lists the parameters that can be configured during installation.

## Uninstalling the Chart

To uninstall/delete the `my-release` deployment:

```
$ helm delete --purge my-release
```
The command removes all the Kubernetes components associated with the chart and deletes the release.

## Configuration

The following table lists the configurable parameters of the Vault-Certificates-Exporter chart and their default values.

Parameter | Description | Default
--- | --- | ---
`replicaCount` | desired number of pods | `1`
`image.repository` | container image repository | `neufeldtech/vault-certificates-exporter`
`image.tag` | container image tag | `0.0.5`
`image.pullPolicy` | container image pull policy | `IfNotPresent`
`nodeSelector` | Node labels for pod assignment | `{}`
`tolerations` | Node tolerations for pod assignment | `{}`
`podAnnotations` | Pod annotations | `{}` |
`service.type` | type of service to create | `ClusterIP`
`service.port` | port for the http service | `80`
`service.annotations` | Annotations on the http service | `{}`
`vault.address` | A URI containing the protocol, host, port, and path to your vault server | `http://127.0.0.1:8200`
`vault.basePath` | A string indicating the vault path in which your certificates are stored | `secret/letsencrypt/cert_configs`
`vault.token` | A vault token that has read access to your specified vault base path | `12345-67890-ABCDE-FGHIJ`
`vault.certPropertyName` | The name of the vault property/attribute that contains the PEM certificate you wish to expose data about | `certificate`

> **Tip**: You can use the default [values.yaml](values.yaml)