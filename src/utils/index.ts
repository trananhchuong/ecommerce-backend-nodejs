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

const unGetSelectData = (select: Record<string, number> = {}) => {
  return Object.keys(select).filter((field) => select[field] === 1);
};

export { getInfoData, getSelectData, unGetSelectData };
