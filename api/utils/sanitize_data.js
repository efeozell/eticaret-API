export const sanitizeUser = function (user) {
  return {
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
  };
};

export const sanitizeProduct = function (product) {
  return {
    name: product.name,
    description: product.description,
    price: product.price,
    image: product.image,
    category: product.category,
  };
};
