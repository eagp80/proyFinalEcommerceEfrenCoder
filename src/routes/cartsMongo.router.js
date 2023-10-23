import { Router } from "express";
import { passportCall } from "../utils/jwt.js";
import handlePolicies from "../middleware/handle-policies.middleware.js";
import CartController from "../controllers/cart.controller.js";

const cartController = new CartController();


class CartsMongoRoutes {
  path = "/carts";
  router = Router();


  constructor() {
    this.initCartsMongoRoutes();
  }

  initCartsMongoRoutes() {
    //******* Crear un carrito nuevo con un array vacío de products ***********************
    this.router.post(`${this.path}`,[passportCall("jwt"), handlePolicies(["ADMIN", "USER","PREMIUM"])], cartController.createCart);

    //********** Obtener un carrito con Id de carrito *************************************
    this.router.get(`${this.path}/:cid`,[passportCall("jwt"), handlePolicies(["ADMIN", "USER","PREMIUM"])], cartController.getCartById);

    //*********** Agregar un Id de  producto a un carrito dado por su Id *****************
    this.router.post(`${this.path}/:cid/products/:pid`,[passportCall("jwt"), handlePolicies(["ADMIN", "USER","PREMIUM"])], cartController.createProductInCart);

    // Eliminar un Id de  producto de un carrito por medio de Id de carrito  **************
    this.router.delete(`${this.path}/:cid/products/:pid`,[passportCall("jwt"), handlePolicies(["ADMIN", "USER","PREMIUM"])], cartController.deleteItemInCart);

    //****** VACIAR el array de products de un carrito por medio de Id CARRITO ************
    this.router.delete(`${this.path}/:cid`,[passportCall("jwt"), handlePolicies(["ADMIN", "USER","PREMIUM"])], cartController.deleteAllProductsInCart);

    //******  Actualizar el array de products por medio de Id de carrito ******************
    this.router.put(`${this.path}/:cid`,[passportCall("jwt"), handlePolicies(["ADMIN", "USER","PREMIUM"])], cartController.updateCartById);

    //******  Actualizar  SÓLO la cantidad de ejemplares  del producto ********************
    //******* por cualquier cantidad pasada desde req.body.     ***************************
    this.router.put(`${this.path}/:cid/products/:pid`,[passportCall("jwt"), handlePolicies(["ADMIN", "USER","PREMIUM"])], cartController.updateCartItemQuantity);
    //hacer  compra generar ticket si no hay sufieciente productos en stock ese producto no entra en la compra
    this.router.post(`${this.path}/:cid/purchase`,[passportCall("jwt"), handlePolicies(["ADMIN", "USER","PREMIUM"])], cartController.purchaseCart)
  }
}

export default CartsMongoRoutes;
