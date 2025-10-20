import Product from "../models/product.model.js";
import { redis } from "../lib/redis.js";
import cloudinary from "../lib/cloudinary.js";
import { sanitizeProduct } from "../utils/sanitize_data.js";
import Category from "../models/category.model.js";

export const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find({});
    res.json({ products });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error", error: error.message });
    console.log("Error in getAllProducts: ", error);
  }
};

export const getFeaturedProducts = async (req, res) => {
  try {
    let featuredProducts = null;

    try {
      //rediste var mi diye bakiyoruz
      const cachedData = await redis.get("featured_products");
      //rediste bu veri var mi ve string mi ve [ ile basliyor mu]
      if (cachedData && typeof cachedData === "string" && cachedData.startsWith("[")) {
        //metni alip json a ceviriyoruz
        featuredProducts = JSON.parse(cachedData);

        //donusturdugumuz veririnin array oldugunu kontrol ediyoruz
        if (Array.isArray(featuredProducts)) {
          return res.json(featuredProducts);
        }
      }
      //eger kontrolden gecemediyse bu veri bekledigimiz gibi degildir bu yuzden siliyoruz
      if (cachedData) {
        await redis.del("featured_products");
      }
    } catch (cacheError) {
      console.log("Cache error in getFeaturedProducts:", cacheError);
      await redis.del("featured_products").catch(console.error);
    }

    //eger redisten gelmediyse mongodbden aliyoruz
    featuredProducts = await Product.find({ isFeatured: true }).lean();

    //eger mongodbden gelen veri yoksa veya bekledigimiz gibi degilse hata donuyoruz
    if (!featuredProducts || !Array.isArray(featuredProducts) || featuredProducts.length === 0) {
      return res.status(404).json({ message: "No featured products found" });
    }

    //
    try {
      const jsonString = JSON.stringify(featuredProducts);
      // Eger dogru json formatindaysa redise aliyoruz
      if (jsonString && jsonString.startsWith("[")) {
        await redis.set("featured_products", jsonString, { ex: 60 * 60 });
      }
    } catch (serializeError) {
      console.log("Error caching featured products:", serializeError);
    }

    res.json(featuredProducts);
  } catch (error) {
    console.log("Error in getFeaturedProducts: ", error);
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};

export const createProduct = async (req, res) => {
  const { name, description, quantity, price, image, category, isFeatured } = req.body;

  try {
    const existingProduct = await Product.findOne({ name });

    if (existingProduct) {
      const inc = quantity ? parseInt(quantity, 10) : 1;
      const updated = await Product.findByIdAndUpdate(existingProduct._id, { $inc: { quantity: inc } }, { new: true });

      return res.status(200).json({ message: "Product exists — quantity updated", product: sanitizeProduct(updated) });
    }

    let cloudinaryResponse = null;
    if (image) {
      cloudinaryResponse = await cloudinary.uploader.upload(image, { folder: "products" });
    }

    const product = await Product.create({
      name,
      description: description || "",
      quantity: quantity ? parseInt(quantity, 10) : 1,
      price: Number(price),
      image: cloudinaryResponse?.secure_url ? cloudinaryResponse.secure_url : "",
      category: category,
      isFeatured: isFeatured,
    });

    res.status(201).json(sanitizeProduct(product));
  } catch (error) {
    console.log("Error in createProduct: ", error);
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedProduct = await Product.findById(id);
    if (!deletedProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (deletedProduct.image) {
      const publicId = deletedProduct.image.split("/").pop().split(".")[0]; // Extract public ID from URL
      try {
        await cloudinary.uploader.destroy(`products/${publicId}`);
        console.log("Deleted image from cloudinary");
      } catch (error) {
        console.log("Error deleting image from cloudinary: ", error);
      }
    }

    await Product.findByIdAndDelete(id);

    res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    console.log("Error in deleteProduct: ", error);
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};

export const updateProduct = async (req, res) => {
  const { id } = req.params;
  if (id) {
    try {
      const { name, description, quantity, price, image, category, isFeatured } = req.body;

      const updatedProduct = await Product.findByIdAndUpdate(id, {
        name,
        description,
        quantity,
        price,
        image,
        category,
        isFeatured,
      });

      if (!updatedProduct) {
        return res.status(404).json({ message: "Product not found" });
      }

      res.status(200).json({ message: "Product updated successfully" }, updatedProduct);
    } catch (error) {
      console.log("Error in updateProducts: ", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  }
};

export const getRecommendedProducts = async (req, res) => {
  try {
    const products = await Product.aggregate([
      //rastgele secim $sample
      { $sample: { size: 3 } },
      //quantitysi 0'dan olanlari bulmak icin
      {
        $match: {
          quantity: { $gt: 0 },
        },
      },
      {
        //$project sekillendirme ve paketleme 1'ler ise dahil etmek icin
        $project: {
          _id: 1,
          name: 1,
          price: 1,
          image: 1,
        },
      },
    ]);

    res.json(products);
  } catch (error) {
    console.log("Error in getRecommendedProducts: ", error);
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};

export const getProductsByCategory = async (req, res) => {
  const { category } = req.params;

  try {
    const products = await Product.find({ category: category });
    if (!products) {
      return res.status(400).json({ message: "Category not found" });
    }

    res.json(products);
  } catch (error) {
    console.log("Error in getProductsByCategory: ", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const toggleFeaturedProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (product) {
      product.isFeatured = !product.isFeatured;
      const updatedProduct = await product.save();
      await updateFeaturedProductsCache();
      res.json(updatedProduct);
    } else {
      res.status(404).json({ message: "Product not found" });
    }
  } catch (error) {
    console.log("Error in toggleFeaturedProduct: ", error);
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};

async function updateFeaturedProductsCache() {
  try {
    const featured = await Product.find({ isFeatured: true }).lean();
    await redis.set("featured_products", JSON.stringify(featured), { ex: 60 * 60 });
  } catch (error) {
    console.log("Error updating featured products cache: ", error);
  }
}
