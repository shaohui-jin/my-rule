import JSEncrypt from "jsencrypt";

const publicKey =
  "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAzk48wcG3r3KMF14kH6KV+5dIU1f7aJyZxfhSiXLPLGJvY9LcXra68NJuyWpQMKF5MYRwoDMl87PuCEwQuSiiXbUMW2F7ky33C8A8OZvHhpETdnlTOnShd1VI7/nZ4Lg5l/w11+S3BkTzEh65tpiTQ+mflhPGrzrxL2sRYew6joXpSXjOQMVH4xR4fQIMaq/SChVvs/dYABwtsp9p6gmXcGRH6Iypmp8Qz9m3k6kxHp5eEyYLUTGLwInVfjHVndBNx1mP73PVM7nC4M7DUKT2ysOAqQL+MH3AxpLjYikBiFi3VGjJUcb3Itfb+kUB2XMJ2VJs7c2w1LzA3R/XIymUXQIDAQAB";

export function encryptRSA(plainText: string): string {
  const encrypt = new JSEncrypt({})
  encrypt.setPublicKey(publicKey)
  return encrypt.encrypt(plainText) as string
}
