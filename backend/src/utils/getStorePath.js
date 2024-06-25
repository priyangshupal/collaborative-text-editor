import { FILEPATH } from "../constants.js";

export const getStorePath = (replicaId) => {
  return `${FILEPATH}/${replicaId}.bin`;
};
