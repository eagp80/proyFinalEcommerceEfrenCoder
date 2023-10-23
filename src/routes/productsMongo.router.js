import { Router } from "express";

import productsMongoModel from "../dao/models/productsMongo.models.js";

import productsMongoData from "../db/productsMongo.js";
import ProductMongoManager from "../dao/managers/productMongo.manager.js";
import { HttpResponse, EnumErrors } from "../middleware/error-handler.js";
import { passportCall } from "../utils/jwt.js";
import handlePolicies from "../middleware/handle-policies.middleware.js";
import ProductController from "../controllers/product.controller.js";
 const  httpResp  = new HttpResponse();

const productController = new ProductController();



class ProductsMongoRoutes {//no es un Router pero adentro tiene uno
  path = "/products";
  router = Router();
  productMongoManager = new ProductMongoManager();

  constructor() {
    this.initProductsMongoRoutes();
  }

  initProductsMongoRoutes() {  

    //**********************Obtener todos los productos en un JSON**************************** */
    this.router.get(`${this.path}`, productController.getAllProducts);

    //**********************Obtener un producto por su pid******************************* */
    this.router.get(`${this.path}/:pid`, productController.getProductById);

    //*******Crear  un producto pasando sus popiedades (clave:valor) por el body desde postman********** */
    this.router.post(`${this.path}`, [passportCall("jwt"), handlePolicies(["ADMIN", "PREMIUM"])], productController.createProduct);

    //**********************Actualizar un producto por su pid******************************* */
    this.router.put(`${this.path}/:pid`,[passportCall("jwt"), handlePolicies(["ADMIN", "PREMIUM"])], productController.updateProductById);
    
    //**********************Eliminar un producto por su pid******************************* */
    this.router.delete(`${this.path}/:pid`,[passportCall("jwt"), handlePolicies(["ADMIN", "PREMIUM"])], productController.deleteProductById);
  }
}
export default  ProductsMongoRoutes;
