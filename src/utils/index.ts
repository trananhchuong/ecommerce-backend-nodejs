const { Types } = require("mongoose");
import pick from "lodash/pick";
interface GetInfoDataParams {
  fields?: string[];
  object?: Record<string, any>;
}

const getInfoData = ({ fields = [], object = {} }: GetInfoDataParams) => {
  return pick(object, fields);
};

const getSelectData = (fields: string[] = []) => {
  return Object.fromEntries(fields.map((field) => [field, 1]));
};

const unGetSelectData = (fields: string[] = []) => {
  return fields.map((field) => `-${field}`).join(" ");
};

const convertToObjectId = (id: string) => {
  return new Types.ObjectId(id);
};

export { getInfoData, getSelectData, unGetSelectData, convertToObjectId };
