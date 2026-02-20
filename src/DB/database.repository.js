export const findOne = async ({
  filter={},
  options={},
  select='',
  model
} = {}) => {
  const doc = model.findOne(filter).select(select || "");
  if (options?.populate) {
    doc.populate(options.populate);
  }
  if (options?.lean) {
    doc.lean(options.lean);
  }
  return await doc.exec();
}

export const create = async ({
  data=[{}],
  options={validateBeforeSave:true},
  model

}) => {
  return await model.create(data, options) || [];
}

 export const createOne = async ({
  data={},
  options={validateBeforeSave:true},
  model

}) => {
  const [doc]=await create({model,data:[data], options}) || [];
  return doc;
} 