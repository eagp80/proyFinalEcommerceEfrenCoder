
# Corresponde a Proyecto Final Backend de una aplicación E-commerce.
###  RUTAS
        - Ruta de inicio, de entrada a la api (redirige al login): 
        http://localhost:8080/api/v1/

        - Para recuperar contraseña, entrar a ruta de arriba, clic en boton donde dice Ir a formulario de restauración de contraseña.

        - Ruta para crear ticket de compra (metodo POST, con postman) http://localhost:8080/api/v1/carts/:cid/purchase Tambien se hace la compra dando clic al boton PURCHASE en la vista http://localhost:8080/api/v1/views/products


        - Ruta para cambiar role de usuario de USER a PREMIUM y viceversa:
        http://localhost:8080/api/v1/users/premium/:uid

        - Ruta para crear producto:
        Se debe ser PREMIUM , se loguea desde POSTMAN, se copia el token en authorization, bear token, desde POSTMAN se crea producto metodo POST a la ruta http://localhost:8080/api/v1/products/, pegando el token en authorization, bear token, y escribiendo los clave:valor de producto en el body, raw, JSON. El servidor creara el producto con la propiedad owner: email del usuario que lo creo.

        - Ruta eliminar y actualizar producto solo las pueden acceder ADMIN o PREMIUM, el owner de un producto y ADMIN son quienes pueden eliminar y actualizar un producto, las rutas son:
        Desde POSTMAN metodo DELETE  http://localhost:8080/api/v1/products/:pidmetodo metodo PUT http://localhost:8080/api/v1/products/:pid, respectivamente.

        - Ruta para agregar producto a carrito siendo PREMIUM:
        debe loguearse desde navegador, aparece vista de productos debe  agregar un producto credao por ese usuario al carrito se vera que no deja agregarlo.

        -  Deberá loguearse en localhost:8080/api/v1 para realizar pruebas de logger con winston.

        - Las rutas para las pruebas de logger con winston son (localhost:8080) api/v1/loggerTest/fatal, 
                api/v1/loggerTest/error, api/v1/loggerTest/warning, api/v1/loggerTest/info, api/v1/loggerTest/http, 
                api/v1/loggerTest/debug 

        - Ruta de mocking, generando 50 productos con faker en localhost:8081/mockingproducts.

        - Ruta de creacion de producto con postmnan mediante metodo post y raw json http://localhost:8080/api/v1/products/ .
        
        - La ruta anterior valida si las propiedades requeridas del producto a crear  son enviadas  y envia mensaje personalizado con error-handler y Http-Status-Code.

        - Ruta de usuario actual logueado (muestra usuario examinando token):
        http://localhost:8080/api/v1/session/current

        - Ruta de usuario actual logueado por id (muestra usuario examinando BD en Mongo Atlas):
        http://localhost:8080/api/v1/session/current/:uid

###  BACKEND DE UNA APLICACION E-COMMERCE: SERVIDOR DE PRODUCTOS, CARRITOS, USUARIOS, TICKETS DE COMPRA, SESIONES Y VISTAS CON EXPRESS, VISTAS CON EXPRESS-HANDLEBARS, BASE DE DATOS MANEJADA CON MONGOOSE HACIA MONGO ATLAS (PRONTO TENDRÁ WEBSOCKET PARA CHAT CON SOCKETS.IO). 
### ADEMÁS TIENE: MANEJO DE VARIABLES DE ENTORNO CON dotenv CAMBIO DE VARIABLES DE ENTORNO DURANTE EJECUCIÓN CON cross-env, SE MUESTRAN RUTAS EN TABLA EN CONSOLA LADO BACKEND CON express-routemap, (PRONTO TENDRÁ MANEJO DE ARCHIVOS CON MULTER).

### Como usar la app:
<h4> Ruta de mocking, generando 50 productos con faker en localhost:8081/mockingproducts </h4>

<h4> Ruta de creacion de producto con postmnan mediante metodo post y raw json http://localhost:8080/api/v1/products/</h4>
<h4>La ruta anterior valida si las propiedades requeridas del producto a crear  son enviadas  y envia mensaje personalizado con error-handler y Http-Status-Code</h4>
<h2> Ruta de inicio, de entrada a la api:   </h2>
<h4> http://localhost:8080/api/v1/  la cual redirige al login </h4>

 <h2>Ejemplos de rutas:</h2>
        Ruta de inicio, de entrada a la api (redirige al login): 
        http://localhost:8080/api/v1/

        Ruta de usuario actual logueado:
        http://localhost:8080/api/v1/session/current

        Ruta de usuario actual logueado por id:
        http://localhost:8080/api/v1/session/current/:uid

        Para obtener todos los productos detalladamemnte en formato JSON (método GET)::
        http://localhost:8080/api/v1/products/

        Para ver resumen de todos los carritos (método GET):
        http://localhost:8080/api/v1/views/carts/

        Para la paginación desde mongo atlas con limit, sort y query (método GET):
        http://localhost:8080/api/v1/views/products?page=1&limit=3&sort={"code":1}&query={"description": "Desde fromulario con socket"}
## Consigna. Se está requiriendo lo siguiente para parte final del proyecto:
- Completar el proyecto final.
    - Conseguir una experiencia de compra completa. ((Hecho)).
    - Cerrar detalles administrativos con los roles. ((Hecho)).

### TESTEO:
- 


### Formato

- Link al repositorio de Github con el proyecto completo, sin la carpeta de node_modules. ((Hecho)).
- Link al pryecto desplegado ((Hecho con railway))
    https://ecommerceefrencoder.up.railway.app/api/v1/login

### Sugerencias
- Presta especial atención a las rúbricas de Proyecto final. ¡Es crucial para alcanzar la nota que esperas!
- Debido a la complejidad de frontend requerida para poder aplicar una pasarela de pago, el PF no evalúa la pasarela de pago.

### Aspectos a incluir
- Desde el router de /api/users, crear tres rutas:
    - GET  /  deberá obtener todos los usuarios, éste sólo debe devolver los datos principales como nombre, correo, tipo de cuenta (rol).

q   - DELETE / deberá limpiar a todos los usuarios que no hayan tenido conexión en los últimos 2 días. (puedes hacer pruebas con los últimos 30 minutos, por ejemplo). Deberá enviarse un correo indicando al usuario que su cuenta ha sido eliminada por inactividad.

    - Crear una vista para poder visualizar, modificar el rol y eliminar un usuario. Esta vista únicamente será accesible para el administrador del ecommerce.

- Modificar el endpoint que elimina productos, para que, en caso de que el producto pertenezca a un usuario premium, le envíe un correo indicándole que el producto fue eliminado.

- Finalizar las vistas pendientes para la realización de flujo completo de compra. NO ES NECESARIO tener una estructura específica de vistas, sólo las que tú consideres necesarias para poder llevar a cabo el proceso de compra. ((Hecho)).

- No es necesario desarrollar vistas para módulos que no influyan en el proceso de compra (Como vistas de usuarios premium para crear productos, o vistas de panel de admin para updates de productos, etc). ((Hecho)).


- Realizar el despliegue de tu aplicativo en la plataforma de tu elección (Preferentemente Railway.app, pues es la abarcada en el curso) y corroborar que se puede llevar a cabo un proceso de compra completo. ((Hecho)).



## Rutas para servidor con file-system en puerto 8081 (se eliminó del código para enfocar todo a Mongo-Atlas):

- Carritos: (se deshabilitó, es decir, se comentó en el código):
    - /api/carts/:cid   GET_BY_CID  trae carrito cid en formato JSON.
    - /api/carts/   POST crea un carrito nuevo vacío.
    - /api/carts/:cid/product/:pid  POST agregar producto pid a carrito cid.
    - En api/carts/  No hay PUT ni DELETE.

- Productos:(se deshabilitó, es decir, se comentó en el código):
    - /api/products/:pid GET_BY_PID muestra carrito pid en formato JSON, PUT con postman body y params, DELETE con postman y params.
    - /api/products/ GET de todos los productos en formato JSON y no hay formulario, POST con postman y body.
    - /api/products?limit=NUM GET muestra los primeros NUM productos en formato JSON. Utiliza req.query.

    - Adicionalmente, en localhost:8081/index2.html se tiene un formulario html para hacer POST de product.

- Socket IO:(se deshabilitó, es decir, se comentó en el código):
    - /    GET    Tiene socket. Utiliza vista "home.handlebars" y muestra lista de todos los productos en html. No tiene formulario.
    - /realtimeproducts  GET   Tiene socket. Utiliza vista "realTimeProducts.handlebars" y Tiene formulario para hacer post de product, muestra Lista de productos, al crear un producto nuevo lo muestra resaltado en una tabla y agrega al final de la lista mostrada el nuevo producto en html.

## Rutas para servidor con Mongo-Atlas en puerto 8080:

# Rutas carritos con Mongo:

- Ver la imagen en carpeta: imagenes explicativas.
- Ver encabezado HTML al entrar a la API.

# Rutas productos con Mongo:

-  Ver la imagen carpeta: imagenes explicativas.
- Ver encabezado HTML al entrar a la API.

# Rutas de  views (carritos y productos) con Mongo: 

- Ver la iamgen en carpeta carpeta: imagenes explicativas.
- Ver encabezado HTML al entrar a la API.
