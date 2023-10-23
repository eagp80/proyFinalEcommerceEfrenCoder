import { HttpResponse , EnumErrors } from "../middleware/error-handler.js";
import ProductMongoManager from '../dao/managers/productMongo.manager.js';


class ProductController {
  constructor() {
    //this.productService = new ProductService();
    this.httpResp = new HttpResponse();
    this.enumError = EnumErrors;  
    this.productMongoManager = new ProductMongoManager();
    
  }

  createProduct = async (req, res) => {
    try {
      const { title, description, code, price, status, stock, category,thumbnails } = req.body;
      let paramsInvalids = [];
      let text="";

      if (!title) {
        paramsInvalids.push("title");
      }
      if (!description) {
        paramsInvalids.push("desription");
      }
      if (!code) {
        paramsInvalids.push("code");
      }
      if (!price) {
        paramsInvalids.push("price");
      }
      if (!stock) {
        paramsInvalids.push("stock");
      }
      if (!category) {
        paramsInvalids.push("category");
      }
      if(paramsInvalids.length>0){
        paramsInvalids.forEach((param)=> text=text+" "+param+"," ); 
        return this.httpResp.BadRequest(res, `missing ${text} in body`, req.body);
      }

      const productMongoBody = req.body;
      productMongoBody.owner= req.user.user.email;

      const newProductMongo = await this.productMongoManager.createProductMongo(productMongoBody);
      return this.httpResp.OK(res,`productMongo created successfully`,newProductMongo);   
    } catch (error) {
      req.logger.fatal(
        `Method: ${req.method}, url: ${
          req.url
        } - time: ${new Date().toLocaleTimeString()
        } con ERROR: ${error.message ?? error}`); 
      //recibe tambiem el catch de createProductMongo
      return this.httpResp.Error(res,error.message ?? error , error);
    }
  };

  getAllProducts = async (req, res) => {
    try {
      const productsMongoArr = await this.productMongoManager.getAllProductsMongo();
      return this.httpResp.OK(res, `get all products succesfully`, productsMongoArr);

    } catch (error) {
      req.logger.fatal(
        `Method: ${req.method}, url: ${
          req.url
        } - time: ${new Date().toLocaleTimeString()
        } con ERROR: ${error.message}`); 

      return this.httpResp.Error(res, `error in get all products`, error.message);
    }
  };

  getProductById = async (req, res) => {
    try {
      const { pid } = req.params;
      const productMongoDetail = await this.productMongoManager.getProductMongoById(
        pid
      );
      return this.httpResp.OK(res, `get productMongo info of ${pid} succesfully`, {
        productMongo: productMongoDetail})

    } catch (error) {
      req.logger.fatal(
        `Method: ${req.method}, url: ${
          req.url
        } - time: ${new Date().toLocaleTimeString()
        } con ERROR: ${error.message}`); 

      this.httpResp.Error(res, `${this.enumError.CONTROLLER_ERROR} Error al solicitar el producto `, {
        error: error.message,
      });      
    }
  };

  updateProductById = async (req, res) => {
    try {
      const { pid } = req.params;
      const { title, description, code, price, status, stock, category,thumbnails } = req.body;
      const { email, role } = req.user.user;
      const productMongoBody = req.body;
      const productMongoExist = await this.productMongoManager.getProductMongoById(
        pid
      );  
      if (!productMongoExist) {
        return this.httpResp.BadRequest(res, 'Unexisting Product', 'Product not found')
      }
      if (productMongoExist.owner !== email && role !== 'ADMIN') {
        return this.httpResp.Forbbiden(res, '**Unauthorized**', 'You are not authorized to update this product')
      }
      const updatedProductMongo = await this.productMongoManager.updateProduct(pid,productMongoBody);

      return this.httpResp.OK(res,`productMongo with pid: ${pid}, updated successfully`,updatedProductMongo);

    } catch (error) {
      req.logger.fatal(
        `Method: ${req.method}, url: ${
          req.url
        } - time: ${new Date().toLocaleTimeString()
        } con ERROR: ${error.message}`); 
      return this.httpResp.Error(res,error.message ?? error , error);
    } 
  };

  deleteProductById = async (req, res) => {
    try {
      const { pid } = req.params;
      const { email, role } = req.user.user;
      const productMongoBody = req.body;
      const productMongoExist = await this.productMongoManager.getProductMongoById(
        pid
      );  
      if (!productMongoExist) {
        return this.httpResp.BadRequest(res, 'Unexisting Product for to delete', 'Product not found')
      }
      if (productMongoExist.owner !== email && role !== 'ADMIN') {
        return this.httpResp.Forbbiden(res, '**Unauthorized**', 'You are not authorized to delete this product')
      }
      const deletedProductMongo = await this.productMongoManager.deleteProduct(pid);

      return this.httpResp.OK(res,`productMongo with pid: ${pid}, deleted successfully`,deletedProductMongo);

    } catch (error) {
      req.logger.fatal(
        `Method: ${req.method}, url: ${
          req.url
        } - time: ${new Date().toLocaleTimeString()
        } con ERROR: ${error.message}`); 
      return this.httpResp.Error(res,error.message ?? error , error);
      
    } 
  
  };
}

export default ProductController;
