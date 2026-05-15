"use client";

import bs58 from "bs58";
import nacl from "tweetnacl";

const encoder = new TextEncoder();
const decoder = new TextDecoder();

export const createPhantomEncryptionKeypair = () => {
  const keypair = nacl.box.keyPair();

  return {
    publicKey: bs58.encode(keypair.publicKey),
    secretKey: bs58.encode(keypair.secretKey),
  };
};

export const derivePhantomSharedSecret = ({
  phantomEncryptionPublicKey,
  dappEncryptionSecretKey,
}) =>
  nacl.box.before(
    bs58.decode(phantomEncryptionPublicKey),
    bs58.decode(dappEncryptionSecretKey)
  );

export const encryptPhantomPayload = (payload, sharedSecret) => {
  const nonce = nacl.randomBytes(nacl.box.nonceLength);
  const messageBytes = encoder.encode(JSON.stringify(payload));
  const encrypted = nacl.box.after(messageBytes, nonce, sharedSecret);

  return {
    nonce: bs58.encode(nonce),
    payload: bs58.encode(encrypted),
  };
};

export const decryptPhantomPayload = ({
  data,
  nonce,
  sharedSecret,
}) => {
  const decrypted = nacl.box.open.after(
    bs58.decode(data),
    bs58.decode(nonce),
    sharedSecret
  );

  if (!decrypted) {
    throw new Error("Unable to decrypt Phantom payload.");
  }

  return JSON.parse(decoder.decode(decrypted));
};

export const encodeUtf8ForPhantom = (value) =>
  bs58.encode(encoder.encode(value));
