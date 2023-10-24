import { Router } from "express";
import CartsMongoManager from "../dao/managers/cartMongo.manager.js";
import ProductsMongoManager from "../dao/managers/productMongo.manager.js";
import productMongoModel from "../dao/models/productsMongo.models.js";
import { NODE_ENV, PORT, API_VERSION, CURSO, URL_API } from "../config/config.js";
import { passportCall } from "../utils/jwt.js";
import handlePolicies from "../middleware/handle-policies.middleware.js";
import { HttpResponse } from "../middleware/error-handler.js";
import ticketManager from "../dao/managers/tickets.manager.js";
const httpResp  = new HttpResponse;

class ViewsMongoRoutes {
  path = "/views";
  router = Router();
  productMongoManager = new ProductsMongoManager();
  cartsMongoManager = new CartsMongoManager();
  //ticketManager = new ticketsManager();
  role="USER";

  constructor() {
    this.initViewsMongoRoutes();
  }

  initViewsMongoRoutes() {

    /*************************************************************************************
    //*************************************************************************************
    //********** Vista de todos los carritos  *************************************
    //******  GET DE /api/v1/views/carts/ **************************************
    //*************************************************************************************
    //*************************************************************************************/

    this.router.get(`${this.path}/carts`, 
    [passportCall("jwt"), 
    handlePolicies(["USER", "ADMIN", "GOLD", "SILVER", "BRONCE"])],
     async (req, res) => {
      // let courses = [];
      let i = 0;
      const cartsMongo = await this.cartsMongoManager.getAllCartsMongoPopulate();

      const cartsMongoMapped = cartsMongo.map((cartMongo, index) => {
        return {
          i: index+1,
          id: cartMongo.id,
          // products: cartMongo.products.map(prod => prod.product.title)

          products: cartMongo.products.map(prod => {
            return {
              title: prod.product.title,
              qty: prod.quantity
            }
          })

        }
      })
      // console.log(JSON.stringify(cartsMongoMapped));    
      // cartsMongoMapped.map(item =>  console.log("Carrito:",item.i,item.products));     
      res.render("carts", { cartsMongo: cartsMongoMapped });
    });

    //*************************************************************************************
    //*************************************************************************************
    //********** Vista de un carrito por  Id de carrito *************************************
    //******  GET DE /api/v1/views/carts/:cid **************************************
    //*************************************************************************************
    //*************************************************************************************
    
    this.router.get(`${this.path}/carts/:cid`, 
    [passportCall("jwt"), 
    handlePolicies(["USER", "PREMIUM","ADMIN", "GOLD", "SILVER", "BRONCE"])],
     async (req, res) => {
      try {
        // TODO: HACER VALIDACIONES *
        const cid=req.params.cid;
        let cartMongoData = await this.cartsMongoManager.getCartMongoByIdPopulate(cid);//population        
        // TODO REVISANDO SI EL CARRITO YA FUE CREADO ANTERIOMENTE        
        if (!cartMongoData) {
          return res.json({
            message: `the cart by Id in Mongo Atlas not found`,
          });
        }//se cambio por throw,

      const cartMongoMapped = cartMongoData.products.map((item, index) => {
        return {
          i: index+1,
          title: item.product.title,
          qty: item.quantity          
          // products: cartMongo.products.map(prod => prod.product.title)
        }
      })
      req.logger.info(
        `Method: ${req.method}, url: ${
          req.url
        } - time: ${new Date().toLocaleTimeString()
        } con cartMongoMapped: ${JSON.stringify(cartMongoMapped)}`); 
      
      cartMongoMapped.map(item2 =>  console.log("Item",item2.i,": ",item2.title,`, cantidad(${item2.qty}).`));  
        res.render("cartbyid", { cartMongo: cartMongoMapped, id:cid});

        // return res.status(201).json({
        //   message: `cart found successfully in Mongo Atlas (with population)`,
        //   cart: cartMongoData,
        // });
      } catch (error) {
        req.logger.fatal(
          `Method: ${req.method}, url: ${
            req.url
          } - time: ${new Date().toLocaleTimeString()
          } con ERROR: ${error.message}`); 

        //recibe tambiem el catch de getCartMongoByIdPopulate 
         return res.status(400).json({
            message: error.message ?? error            
          });
        }
    });


   //******************************************************************************* */
   //******************************************************************************* */
   //*******************Vista de productos con paginacion*************************** */
   //******************************************************************************* */
   //******************************************************************************* */
    this.router.get(`${this.path}/products`,
    [passportCall("jwt"), 
    handlePolicies(["USER", "ADMIN", "PREMIUM","GOLD", "SILVER", "BRONCE"])], 
    async (req, res) => {//
      try {
        //obtener el carrito asosiado al usuario y ponerselo en linea 132s a CartOwn
        const cartUser = req.user.cart??req.user.user.cart;

        const { page = 1, limit = 10, query, sort } = req.query;
        let q = {};
        let qString = "";       
        let s = {};
        let sString = "";
        let url1="";
        let url2="";
        // let cartOwn = `${URL_API}:${PORT}/api/${API_VERSION}/carts/${cartUser}/products/`;
        let cartOwn = `../carts/${cartUser}/products/`;


        if (sort) {
          s = JSON.parse(sort);
          sString= JSON.stringify(s);
        }        
        if(query){
          q = JSON.parse(query);
          qString = JSON.stringify(q);
        }
        const { docs, totalPages, hasPrevPage, hasNextPage, prevPage, nextPage } =
          await productMongoModel.paginate(q, { limit, page, sort: s, lean: true });      

          if (!query && sort) {            
            url1=`${URL_API}:${PORT}/api/${API_VERSION}/views/products?limit=${limit}&page=${prevPage}&sort=${sString}`;
            url2=`${URL_API}:${PORT}/api/${API_VERSION}/views/products?limit=${limit}&page=${nextPage}&sort=${sString}`;
          }

          
          if (query && !sort) {
            let qStringURI = encodeURIComponent(qString);
            url1=`${URL_API}:${PORT}/api/${API_VERSION}/views/products?limit=${limit}&page=${prevPage}&query=${qStringURI}`;
            url2=`${URL_API}:${PORT}/api/${API_VERSION}/views/products?limit=${limit}&page=${nextPage}&query=${qStringURI}`;
          }

          if (!query && !sort) {
            url1=`${URL_API}:${PORT}/api/${API_VERSION}/views/products?limit=${limit}&page=${prevPage}`;
            url2=`${URL_API}:${PORT}/api/${API_VERSION}/views/products?limit=${limit}&page=${nextPage}`;
          }        

          if (query && sort) {
            let qStringURI = encodeURIComponent(qString);
            url1 = `${URL_API}:${PORT}/api/${API_VERSION}/views/products?limit=${limit}&page=${prevPage}&sort=${sort}&query=${qStringURI}`
            url2 = `${URL_API}:${PORT}/api/${API_VERSION}/views/products?limit=${limit}&page=${nextPage}&sort=${sort}&query=${qStringURI}`
        }

      if (req.session.user?.email === "adminCoder@coder.com") {
        console.log(req.session);
        req.user.role="ADMIN";
      }else{ req.user.role = "USER" }

      //GET CURRENT TICKET USER
      const lastTicket = await ticketManager.getLastTicketUser(req.session?.user?.email||req.user.user.email);
      console.log("🚀 ~ file: viewsMongo.router.js:182 ~ ViewsMongoRoutes ~ lastTicket:",  lastTicket)
      const arrayLastTicket = [];
      let totalTicket = "";

      if(lastTicket==null) {
        console.log("efreeeen");
        arrayLastTicket.push({
        title:"sin compras aún"
      })} else{
        lastTicket.products.forEach(prod => {
          return arrayLastTicket.push({
            title:prod.product.title,
            price:prod.product.price,
            quantity:prod.quantity,
            total:prod.quantity*prod.product.price,
          })          
        })
        totalTicket= lastTicket.amount
      }

      //END

      //////////////////GET CURRENT CART
      const cartProducts = await this.cartsMongoManager.getCartMongoById(req.user.user.cart)
      console.log("🚀 ~ file: viewsMongo.router.js:201 ~ ViewsMongoRoutes ~ cartProducts:", cartProducts)
      let selectProducts = "";
      const cartCurrent = [];
      
      if (cartProducts==null) {
        selectProducts = "Sin productos añadidos, carrito vacío";
      

        
      } else {
        selectProducts = "Total de productos seleccionados: "+ cartProducts.products.length
        let stockMessage = ""
        cartProducts.products.forEach(prod => {
         console.log("🚀 ~ file: viewsMongo.router.js:188 ~ ViewsMongoRoutes ~ prod:", prod)
         stockMessage = prod.quantity>prod.product.stock ? "Sin stock suficiente":"Stock disponible"
          return cartCurrent.push({
            title:prod.product.title,
            price:prod.product.price,
            quantity:prod.quantity,
            id:prod.product._id,
            cartId:cartProducts._id,
            stockMessage
          })          
        })        
      }

           ///////////////END


        res.render("products", {
          role: req.session?.user?.rol||req.user.user.role,
          name: req.session?.user?.name||req.user.user.name,
          first_name: req.session?.user?.first_name||req.user.user.first_name,
          last_name: req.session?.user?.last_name||req.user.user.last_name,
          email: req.session?.user?.email||req.user.user.email,
          cart: req.user.user.cart,
          age: req.session?.user?.age||req.user.user.age,
          payload: docs,
          cartCurrent:cartCurrent,
          selectProducts:selectProducts,
          ticket: arrayLastTicket,
          totalTicket: totalTicket,
          totalPages: totalPages,
          prevPage: prevPage,
          nextPage: nextPage,
          page: page,
          hasPrevPage: hasPrevPage,
          hasNextPage: hasNextPage,
          prevLink: hasPrevPage
            ? url1
            : null,
          nextLink: hasNextPage
            ? url2
            : null,
          //prevLink: Link directo a la página previa (null si hasPrevPage=false),
          //nextLink:Link directo a la página siguiente (null si hasNextPage=false),
          cartOwn: cartOwn,
        })
      } catch (error) {
        console.log(error);
        req.logger.fatal(
          `Method: ${req.method}, url: ${
            req.url
          } - time: ${new Date().toLocaleTimeString()
          } con ERROR: ${error}`);      
      }
    });
    
    this.router.get(`${this.path}/*`, async (req,res)=>{
      res.status(404).send('Error: algo mal en la ruta escrita');
    })
  }
}

export default ViewsMongoRoutes;
