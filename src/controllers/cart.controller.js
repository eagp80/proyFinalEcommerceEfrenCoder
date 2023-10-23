import TicketController from "./ticket.controller.js"; 
import { HttpResponse , EnumErrors } from "../middleware/error-handler.js";
import CartsMongoManager from '../dao/managers/cartMongo.manager.js'; 
import ProductMongoManager from '../dao/managers/productMongo.manager.js'
import cartsMongoModel from "../dao/models/cartsMongo.models.js";

import userModel from "../dao/models/user.model.js";
import ticketsManager from "../dao/managers/tickets.manager.js";
import { Schema, model, Types } from "mongoose";
import { API_VERSION, PORT } from "../config/config.js";
const { ObjectId } = Types;


class CartController {

  constructor() {
    //this.cartService = new CartService();
    this.ticketController = new TicketController();
    this.httpResp = new HttpResponse();
    this.enumError = EnumErrors;
    this.cartMongoManager = new CartsMongoManager();
    this.productMongoManager = new ProductMongoManager();

  }

  createCart = async (req, res) => {
    try {    
      const cartMongo = {"products": []};
      const newCartMongo = await cartsMongoModel.create(cartMongo);

      //const newCartMongo = await this.cartMongoManager.createCartMongo(cartMongo);
      if (!newCartMongo) {
        return this.httpResp.Error(res,`the cartMongo not created`, {error:this.enumError.DATABASE_ERROR});       
      }
      return this.httpResp.OK(res,`Carrito nuevo creado`, {newCartMongo:newCartMongo}); 
    } catch (error) {
      req.logger.fatal(
        `Method: ${req.method}, url: ${
          req.url
        } - time: ${new Date().toLocaleTimeString()
        } con ERROR: ${error.message}`);   
     
      return this.httpResp.Error(res,`the cartMongo not created ${this.enumError.CONTROLLER_ERROR}`, {error:error}); 
      }
  };

  getCarts = async (req, res) => {
    //TODO no implementada aun

  };

  getCartById = async (req, res) => {
    try {
      const cid=req.params.cid;
      let cartMongoData = await this.cartMongoManager.getCartMongoByIdPopulate(cid);//population        
      //REVISANDO SI EL CARRITO YA FUE CREADO ANTERIOMENTE        
      if (!cartMongoData) {
        return this.httpResp.Error(res,`the cart by Id in Mongo Atlas not found`, {error:this.enumError.INVALID_PARAMS}); 

      }
      return this.httpResp.OK(res,`cart found successfully in Mongo Atlas (with population)`, {cart: cartMongoData}); 

    } catch (error) {
      req.logger.fatal(
        `Method: ${req.method}, url: ${
          req.url
        } - time: ${new Date().toLocaleTimeString()
        } con ERROR: ${error.message}`);   

      return this.httpResp.Error(res,error.message ?? error, {error:this.enumError.CONTROLLER_ERROR});  
      }

  };

  updateCartById = async (req, res) => {
    try{
      const { cid} = req.params;
      const arrayItemsProducts= req.body.products;
      let result = await cartsMongoModel.findOneAndUpdate({_id:`${cid}`},{products:arrayItemsProducts}, { new: true });
      return this.httpResp.OK(res,`cartsMongo update array of products with PUT sucessfully`, {result:result}); 

    } catch (error) {
      req.logger.fatal(
        `Method: ${req.method}, url: ${
          req.url
        } - time: ${new Date().toLocaleTimeString()
        } con ERROR: ${error.message}`);  
        return this.httpResp.Error(res,`cartsMongo NOT update array of products with PUT`, {error:this.enumError.DATABASE_ERROR}); 
    }

  };

  deleteCart = async (req, res) => {
    //TODO no implementada aun

  };

  deleteAllProductsInCart = async (req, res) => {
    try{
      const { cid} = req.params;
      let result = await cartsMongoModel.findOneAndUpdate({_id:`${cid}`},{products:[]},{ new: true });
      return this.httpResp.OK(res,`cartsMongo DELETE all products sucessfully`, {result:result});       
    } catch (error) {
      req.logger.fatal(
        `Method: ${req.method}, url: ${
          req.url
        } - time: ${new Date().toLocaleTimeString()
        } con ERROR: ${error.message}`);  
        return this.httpResp.Error(res,`the cart by Id in Mongo Atlas not deleted`, {error:this.enumError.DATABASE_ERROR}); 
    }
  };

  createProductInCart = async (req, res) => {
    try {
      const cid=req.params.cid;
      const pid=req.params.pid;
      const { email, role } = req.user.user;
      const productMongoExist = await this.productMongoManager.getProductMongoById(
        pid
      );  
      //verificar si existe producto
      if (!productMongoExist) {
        return this.httpResp.BadRequest(res, `Unexisting Product error: ${this.enumError.INVALID_PARAMS}`, 'Product not found')
      }
      //comparar owner de producto con email de usuario, no proceder si son iguales
      if (productMongoExist.owner === email ) {
        return this.httpResp.Forbbiden(res, 'you are owner', 'You are not can buy this product')
      }

      let cartMongoData = {};

      cartMongoData = await this.cartMongoManager.getCartMongoById(cid);
      //verificar si existe carrito
      if (!cartMongoData) {// 1. si no existe carrito no se hace nada
        return this.httpResp.Error(res,`the cart by Id in Mongo Atlas not found`, {error:this.enumError.INVALID_PARAMS}); 
      }
        //2. si existe carrito pero no tiene productos se agrega el producto con quantity 1
      if(cartMongoData.products==[]){           
          const productNewId= new ObjectId(pid);
          req.logger.debug(
            `Method: ${req.method}, url: ${
              req.url
            } - time: ${new Date().toLocaleTimeString()
            } entro en 2`
          ); 
          cartsMongoModel.findByIdAndUpdate(cid, { products: [{product: productNewId, quantity: 1}] }, { new: true })
          .then(updatedCart => {
            req.logger.info(
              `Method: ${req.method}, url: ${
                req.url
              } - time: ${new Date().toLocaleTimeString()
              } updatedCart: ${updatedCart}`
            );  
            cartMongoData=updatedCart;
          })
          .catch(error => {
            req.logger.fatal(
              `Method: ${req.method}, url: ${
                req.url
              } - time: ${new Date().toLocaleTimeString()
              } con ERROR: ${error.message}`); 
            return this.httpResp.Error(res,`the cart by Id in Mongo Atlas not update`, {error:this.enumError.DATABASE_ERROR}); 
          });
      } else {// fin if 2, else al if 2... Situacion 3. si el carrito tiene productos verificar si ya tiene el producto
        req.logger.debug(
          `Method: ${req.method}, url: ${
            req.url
          } - time: ${new Date().toLocaleTimeString()
          } Comparando cada producto en carrito con pid pasado por parametro en url, antes de entrar a 3 o 4 `
        );  
          //console.log("verificando antes de entrar a caso 3 o 4")
          //const idComp = new ObjectId(pid);
          let existeProduct = false;
          let indexOfProducts= 0;
          cartMongoData.products.forEach((element,i) => {  
            req.logger.debug(
              `Method: ${req.method}, url: ${
                req.url
              } - time: ${new Date().toLocaleTimeString()
              } product: ${element.product.toString()} `
            );       
            req.logger.debug(
              `Method: ${req.method}, url: ${
                req.url
              } - time: ${new Date().toLocaleTimeString()
              } pid: ${pid} `
            );  

            if(element.product.id.toString() === pid){//este if solo funciono con toString() en ambos
              req.logger.debug(
                `Method: ${req.method}, url: ${
                  req.url
                } - time: ${new Date().toLocaleTimeString()
                } el producto ya lo tiene el carrito`
              ); 
              existeProduct= true;
              indexOfProducts=i;              
            }              
          }); 

          if(existeProduct){//if 3 situacion 3, si ya se tiene el producto incrementamos quantity
                cartMongoData.products[indexOfProducts].quantity++;
                req.logger.debug(
                  `Method: ${req.method}, url: ${
                    req.url
                  } - time: ${new Date().toLocaleTimeString()
                  }  entrooooo en caso 3, ya tiene el producto se incrementa quantity `
                );
                cartsMongoModel.findByIdAndUpdate(cid, {products: cartMongoData.products }, { new: true })
                .then(updatedCart => {
                  req.logger.http(
                    `Method: ${req.method}, url: ${
                      req.url
                    } - time: ${new Date().toLocaleTimeString()
                    }Carrito actualizado updatedCart: ${updatedCart}  `
                  );
                  cartMongoData = updatedCart;

                })
                .catch(error => {
                  req.logger.fatal(
                    `Method: ${req.method}, url: ${
                      req.url
                    } - time: ${new Date().toLocaleTimeString()
                    } con ERROR: ${error.message}`); 
                  return this.httpResp.Error(res,`the cart by Id in Mongo Atlas not update`, {error:this.enumError.DATABASE_ERROR}); 

                });
          } else {//else a if 3,  situacion 4 . si el carrrito existe y no tiene el producto hacer quantity =1
            req.logger.debug(
              `Method: ${req.method}, url: ${
                req.url
              } - time: ${new Date().toLocaleTimeString()
              } entro en caso 4, no tiene el producto, se agregara un nuevo ObjectId del producto en el carrito`
            );    
                const productNewId= new ObjectId(pid);
                cartMongoData.products.push({ product:productNewId, quantity: 1 }); 
                cartsMongoModel.findByIdAndUpdate(cid, {products: cartMongoData.products }, { new: true })
                .then(updatedCart => {
                  req.logger.info(
                    `Method: ${req.method}, url: ${
                      req.url
                    } - time: ${new Date().toLocaleTimeString()
                    } updateCart: ${updatedCart}`
                  );
                  cartMongoData = updatedCart;
                })
                .catch(error => {
                  req.logger.fatal(
                    `Method: ${req.method}, url: ${
                      req.url
                    } - time: ${new Date().toLocaleTimeString()
                    } con ERROR: ${error.message}`);  
                  return this.httpResp.Error(res,`c error ${this.enumError.DATABASE_ERROR}`, {error:error.message ?? error}); 
                });          
          }// fin else de situacion 4
      }//fin else del if 2, situacion 3
      return res.redirect(`http://localhost:${PORT}/api/${API_VERSION}/views/products`);
      //return this.httpResp.OK(res,`cart found successfully and update in Mongo Atlas`,{cartMongoData});

    } catch (error) {
      req.logger.fatal(
        `Method: ${req.method}, url: ${
          req.url
        } - time: ${new Date().toLocaleTimeString()
        } con ERROR: ${error.message}`);   
       return this.httpResp.Error(res,`cart by Id in Mongo Atlas not update with product by Id, error: ${this.enumError.CONTROLLER_ERROR}`, {error:error.message ?? error});
      }
  };

  updateCartItemQuantity = async (req, res) => {
    try{
      let result = await cartsMongoModel.findOneAndUpdate(
        { _id: req.params.cid, "products.product": req.params.pid },
        { $set: { "products.$.quantity": req.body.quantity } },
        { new: true });   
        return this.httpResp.OK(res,`cartsMongo PUT set quantity in product pid of cart cid`, {result:result}); 
    } catch (error) {
      req.logger.fatal(
        `Method: ${req.method}, url: ${
          req.url
        } - time: ${new Date().toLocaleTimeString()
        } con ERROR: ${error.message}`);   
        return this.httpResp.Error(res,`Error cartsMongo PUT NOT set quantity in product pid of cart cid`, {error:this.enumError.DATABASE_ERROR});
    }

  };

  deleteItemInCart = async (req, res) => {//delete id product in cart by id
    try{
      const { cid, pid } = req.params;
      const cart = await cartsMongoModel.findById({_id: cid}); 
      const index =  cart.products.findIndex(item => item.product.toString() === pid);
      console.log("🚀 ~ file: cart.controller.js:285 ~ CartController ~ deleteItemInCart ~ index:", index);
      if(index>=0){
        const cartAux = cart;
        cartAux.products.splice(index,1);    
        await cartsMongoModel.updateOne({_id:cid}, cartAux);
        const cartUpdate = await cartsMongoModel.findById({_id: cid}); 
        return this.httpResp.OK(res,`the product by Id in cart by Id in Mongo Atlas deleted`, {cartUpdate: cartUpdate});        
      }else{
        return this.httpResp.NotFound(res,`no existe el producto en este carrito`, {productId: pid}); 
      }
    } catch (error) {
      req.logger.fatal(
        `Method: ${req.method}, url: ${
          req.url
        } - time: ${new Date().toLocaleTimeString()
        } con ERROR: ${error.message}`);  
        return this.httpResp.Error(res,`the cart by Id in Mongo Atlas not deleted`, {error:this.enumError.DATABASE_ERROR}); 
    }
  };

  purchaseCart = async (req, res) => {
    const { cid } = req.params;    
    try {
    // verificando existencia del cart
    const cart = await this.cartMongoManager.getCartMongoByIdPopulate(cid);  //OJOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOO       
      if (!cart)  return this.httpResp.BadRequest(res,'Cart not found',cart);
    const outOfStock = [];// defino inicializo variables para almacenar productos cuyo stock es menor a la compra
    const addProducts = [];// defino inicializo variables para almacenar productos cuyo stock es menor a la compra
    let purchaseAmount = 0;// defino inicializo monto total de compra

    // Si tiene existencia suficiente: lo sumo al monto total de la compra, actualizo la existencia, y lo elimino del carrito.
    // Si no tiene existencia suficiente agrego al producto al arreglo de "outOfStock"
    for (const element of cart.products) {
      if ( element.product.stock > element.quantity ) {
        purchaseAmount += element.quantity * element.product.price
        await this.productMongoManager.updateProduct(element.product._id, {
          stock: element.product.stock - element.quantity
        })
        await this.cartMongoManager.deleteProductFromCart(cid, element.product._id)
        addProducts.push(element);
      } else {
        outOfStock.push(element.product.title)
      }
    }
    // Si no hay ningun producto tenia stock
    if(outOfStock.length > 0 && purchaseAmount === 0) {
      req.logger.debug(
        `Method: ${req.method}, url: ${
          req.url
        } - time: ${new Date().toLocaleTimeString()
        } con outOfStock: ${outOfStock}`);
      return this.httpResp.BadRequest(res,'Selected products are out of stock.',null);   
    }

    // verificando el id de usuario que es propietario de ese cart
    const userWithCart = await userModel.findOne({ cart: cid }).populate('cart');
    console.log("🚀 ~ file: cart.controller.js:344 ~ CartController ~ purchaseCart= ~ userWithCart:", userWithCart)
    req.logger.debug(
      `Method: ${req.method}, url: ${
        req.url
      } - time: ${new Date().toLocaleTimeString()
      } con userWithCart: ${userWithCart}`);
    
    // Creo un ticket pasandole el email del usuario dueño del carrito, y el monto total de la compra.
    // El id carrito se le asigna al usuario cuando el mismo se registra. Relacion 1 a 1 entre cart y usuario.
    const ticket = await ticketsManager.createTicket(userWithCart.email, purchaseAmount,addProducts);

    // Si algunos productos no tenian stock
    if(outOfStock.length > 0 && purchaseAmount > 0) {
      //return this.httpResp.OK(res,'Purchase submitted, The following products are out of stock:',{outOfStock, ticket});
    }
    // Si todos los productos tenian stock
    return res.redirect(`http://localhost:${PORT}/api/${API_VERSION}/views/products`);    
    //return httpResp.OK(res,'Purchase submitted, ticket:',ticket);
    } catch (error) {
      req.logger.fatal(
        `Method: ${req.method}, url: ${
          req.url
        } - time: ${new Date().toLocaleTimeString()
        } con ERROR: ${error.message}`);
      this.httpResp.Error(res, 'Error while purchasing', error);
    }

  };
}

export default CartController;
