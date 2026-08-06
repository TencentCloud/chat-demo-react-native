import LibGenerateTestUserSig from "./lib-generate-test-usersig-es.min.js";

export function genTestUserSig(options) {
  const { SDKAppID, SecretKey, userID, expireTime = 604800 } = options;

  const generator = new LibGenerateTestUserSig(SDKAppID, SecretKey, expireTime);
  const userSig = generator.genTestUserSig(userID);

  return {
    SDKAppID,
    userSig,
    userID,
  };
}