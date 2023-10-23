import { HttpResponse , EnumErrors } from "../middleware/error-handler.js";
import ticketsManager from "../dao/managers/tickets.manager.js";


class TicketController {

  constructor() {
   //this.ticketService = new TicketService();
    this.httpResp = new HttpResponse();
    this.enumError = EnumErrors;
    this.ticketManager = ticketsManager;
    
  }

  getAllTicket = async (req, res) => {
    try {
      const getAllTicket = await this.ticketManager.getAllTicket();
      return this.httpResp.OK(res, 'Tomando Tickets', { ticket: getAllTicket });
    } catch (error) {
      return this.httpResp.Error(res, `${this.enumError.CONTROLLER_ERROR} error al obtener todos los tickets`, { error: error.message });
    }
  };

  createTicket = async (req, res) => {
    try {
      const DataTicket = req.user;
      const createdTicket = await this.ticketManager.createTicket(DataTicket);
      return this.httpResp.OK(res, 'Creando Ticket', { ticket: createdTicket });
    } catch (error) {
      return this.httpResp.Error(res, `${this.enumError.CONTROLLER_ERROR}error al crear el ticket`, { error: error.message });
    }
  };

  getTicketById = async (req, res) => {
    try {
      const { tId } = req.params;
      const getTicketById = await this.ticketManager.getTicketById(tId);
      return this.httpResp.OK(res, `Se encontro el ticket con id:${tId} `, { ticket: getTicketById });
    } catch (error) {
      return this.httpResp.Error(res, `${this.enumError.CONTROLLER_ERROR} error al obtener el ticket`, { error: error.message });
    }
  };
}

export default TicketController;
