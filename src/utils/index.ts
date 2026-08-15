"use strict";
import pick from "lodash/pick";

interface GetInfoDataParams {
  fields?: string[];
  object?: Record<string, any>;
}

const getInfoData = ({ fields = [], object = {} }: GetInfoDataParams) => {
  return pick(object, fields);
};

export { getInfoData };
