import Category from "../models/category.model.js";

export const getAllCategory = async (req, res) => {
  try {
    const categories = await Category.find({});

    res.status(200).json(categories);
  } catch (error) {
    console.log("Error in getAllCategory: ", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const createCategory = async (req, res) => {
  const { name, slug } = req.body;
  if (!name || !slug) {
    return res.status(400).json({ message: "name or slug is required" });
  }

  try {
    const newCategory = await Category.create({
      name,
      slug,
    });

    res.status(201).json({
      message: "Category created successfully",
      newCategory,
    });
  } catch (error) {
    console.log("Error in getAllCategory: ", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const updateCategory = async (req, res) => {
  const { name, slug, categoryId } = req.body;
  if (!name || !categoryId) {
    return res.status(400).json({ message: "name or categoryId is required" });
  }

  try {
    const updatedCategory = await Category.findByIdAndUpdate(categoryId, { name, slug }, { new: true });
    if (!updateCategory) {
      return res.status(404).json({ message: "Category not found" });
    }

    res.status(200).json({ messages: "Category updated successfully", updatedCategory });
  } catch (error) {
    console.log("Error in getAllCategory: ", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const deleteCategory = async (req, res) => {
  const { categoryId } = req.body;
  if (!categoryId) {
    return res.status(400).json({ message: "name or slug is required" });
  }

  try {
    const deletedCategory = await Category.findByIdAndDelete(categoryId, { new: true });
    if (!deletedCategory) {
      return res.status(404).json({ message: "Category not found" });
    }

    res.status(200).json({ message: "Category deleted successfully", deletedCategory });
  } catch (error) {
    console.log("Error in getAllCategory: ", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
