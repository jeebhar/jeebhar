import { defaultContent } from "../default-content.js";
import { SiteContent } from "../models/site-content.model.js";

export const getContent = async (_req, res, next) => {
  try {
    let content = await SiteContent.findOne().lean();
    if (!content) {
      const created = await SiteContent.create(defaultContent);
      content = created.toObject();
    }

    res.json(content);
  } catch (error) {
    next(error);
  }
};

export const updateContent = async (req, res, next) => {
  try {
    const updated = await SiteContent.findOneAndUpdate({}, req.body, {
      new: true,
      upsert: true,
      runValidators: true,
      setDefaultsOnInsert: true
    }).lean();

    res.json(updated);
  } catch (error) {
    next(error);
  }
};
