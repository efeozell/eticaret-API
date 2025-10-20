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

export const sanitizeCart = function (cart) {
  if (!cart || !cart.cartItems || !Array.isArray(cart.cartItems)) {
    return { cartItems: [] };
  }

  return {
    cartItems: cart.cartItems.map((item) => ({
      productId: item.productId,
      quantity: item.quantity,
    })),
  };
};
